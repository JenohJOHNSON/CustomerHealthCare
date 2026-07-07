import json
import os
import re
import sys
from typing import Iterable

import pandas as pd
from sqlalchemy import create_engine, text
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


IDENTIFIER_PATTERN = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


def get_engine():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is missing.")

    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    return create_engine(database_url)


def quote_identifier(identifier: str) -> str:
    if not IDENTIFIER_PATTERN.match(identifier):
        raise RuntimeError(f"Unsafe SQL identifier: {identifier}")

    return f'"{identifier}"'


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = (
        df.columns.astype(str)
        .str.strip()
        .str.replace(" ", "_", regex=False)
        .str.replace("-", "_", regex=False)
        .str.lower()
    )
    return df


def parse_airbyte_payload(value):
    if isinstance(value, dict):
        return value

    if isinstance(value, str):
        return json.loads(value)

    return {}


def expand_airbyte_raw_table(df: pd.DataFrame) -> pd.DataFrame:
    if "_airbyte_data" not in df.columns:
        return df

    records = df["_airbyte_data"].map(parse_airbyte_payload).tolist()
    expanded = pd.json_normalize(records)
    return expanded


def read_raw_table(engine) -> pd.DataFrame:
    raw_schema = os.getenv("RAW_SCHEMA", "raw")
    raw_table = os.getenv("RAW_TABLE", "customer_churn")

    table_ref = f"{quote_identifier(raw_schema)}.{quote_identifier(raw_table)}"
    print(f"Reading {raw_schema}.{raw_table}...")

    return pd.read_sql(f"SELECT * FROM {table_ref}", engine)


def make_one_hot_encoder():
    try:
        return OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:
        return OneHotEncoder(handle_unknown="ignore", sparse=False)


def ensure_schemas(engine):
    with engine.begin() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS staging;"))
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS analytics;"))
        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS analytics.pipeline_runs (
                    run_id SERIAL PRIMARY KEY,
                    run_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status TEXT,
                    message TEXT
                );
                """
            )
        )


def drop_airbyte_columns(df: pd.DataFrame) -> pd.DataFrame:
    airbyte_cols = [column for column in df.columns if column.startswith("_airbyte")]
    return df.drop(columns=airbyte_cols, errors="ignore")


def require_columns(df: pd.DataFrame, required_cols: Iterable[str]):
    missing = [column for column in required_cols if column not in df.columns]
    if missing:
        raise RuntimeError(
            f"Missing required columns: {missing}. Available columns: {list(df.columns)}"
        )


def prepare_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    df = expand_airbyte_raw_table(df)
    df = normalize_columns(df)
    df = drop_airbyte_columns(df)

    required_cols = [
        "customerid",
        "tenure",
        "contract",
        "monthlycharges",
        "totalcharges",
        "churn",
    ]
    require_columns(df, required_cols)

    df["totalcharges"] = pd.to_numeric(df["totalcharges"], errors="coerce")
    df["monthlycharges"] = pd.to_numeric(df["monthlycharges"], errors="coerce")
    df["tenure"] = pd.to_numeric(df["tenure"], errors="coerce")

    df["totalcharges"] = df["totalcharges"].fillna(0)
    df["monthlycharges"] = df["monthlycharges"].fillna(df["monthlycharges"].median())
    df["tenure"] = df["tenure"].fillna(df["tenure"].median())

    text_columns = df.select_dtypes(include=["object"]).columns
    for column in text_columns:
        df[column] = df[column].fillna("Unknown").astype(str).str.strip()

    df["churn_flag"] = (
        df["churn"].str.lower().map({"yes": 1, "no": 0}).astype("float")
    )
    df = df[df["churn_flag"].notna()].copy()
    df["churn_flag"] = df["churn_flag"].astype(int)

    df["is_month_to_month"] = (
        df["contract"].str.lower() == "month-to-month"
    ).astype(int)
    df["revenue_at_risk"] = df["monthlycharges"]

    return df


def train_model(df: pd.DataFrame):
    drop_cols = ["customerid", "churn", "churn_flag"]
    x = df.drop(columns=drop_cols, errors="ignore")
    y = df["churn_flag"]

    x = x.select_dtypes(include=["number", "object", "bool"])

    numeric_features = x.select_dtypes(include=["number", "bool"]).columns.tolist()
    categorical_features = x.select_dtypes(include=["object"]).columns.tolist()

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", make_one_hot_encoder(), categorical_features),
        ]
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", LogisticRegression(max_iter=1000)),
        ]
    )

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.25,
        random_state=42,
        stratify=y,
    )

    print("Training churn model...")
    pipeline.fit(x_train, y_train)

    y_pred = pipeline.predict(x_test)
    y_prob = pipeline.predict_proba(x_test)[:, 1]

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1": float(f1_score(y_test, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_prob)),
    }

    print("Model metrics:", metrics)
    return pipeline, x, metrics


def write_analytics_tables(engine, df: pd.DataFrame, pipeline, x, metrics):
    df.to_sql(
        "customer_health",
        engine,
        schema="analytics",
        if_exists="replace",
        index=False,
    )
    print("Saved analytics.customer_health")

    all_prob = pipeline.predict_proba(x)[:, 1]

    predictions = pd.DataFrame(
        {
            "customerid": df["customerid"],
            "churn_probability": all_prob,
            "risk_level": pd.cut(
                all_prob,
                bins=[0, 0.4, 0.7, 1.0],
                labels=["Low", "Medium", "High"],
                include_lowest=True,
            ).astype(str),
            "monthlycharges": df["monthlycharges"],
            "contract": df["contract"],
            "tenure": df["tenure"],
            "churn_flag": df["churn_flag"],
        }
    )

    predictions.to_sql(
        "churn_predictions",
        engine,
        schema="analytics",
        if_exists="replace",
        index=False,
    )
    print("Saved analytics.churn_predictions")

    high_risk = predictions[predictions["risk_level"] == "High"]
    kpis = pd.DataFrame(
        [
            {"metric": "total_customers", "value": len(df)},
            {
                "metric": "actual_churn_rate_percent",
                "value": round(df["churn_flag"].mean() * 100, 2),
            },
            {
                "metric": "avg_churn_probability_percent",
                "value": round(predictions["churn_probability"].mean() * 100, 2),
            },
            {"metric": "high_risk_customers", "value": len(high_risk)},
            {
                "metric": "monthly_revenue_at_risk",
                "value": round(high_risk["monthlycharges"].sum(), 2),
            },
            {"metric": "model_accuracy", "value": round(metrics["accuracy"], 4)},
            {"metric": "model_precision", "value": round(metrics["precision"], 4)},
            {"metric": "model_recall", "value": round(metrics["recall"], 4)},
            {"metric": "model_f1", "value": round(metrics["f1"], 4)},
            {"metric": "model_roc_auc", "value": round(metrics["roc_auc"], 4)},
        ]
    )

    kpis.to_sql(
        "kpi_summary",
        engine,
        schema="analytics",
        if_exists="replace",
        index=False,
    )
    print("Saved analytics.kpi_summary")

    feature_names = pipeline.named_steps["preprocessor"].get_feature_names_out()
    coefficients = pipeline.named_steps["model"].coef_[0]

    drivers = pd.DataFrame(
        {
            "feature": feature_names,
            "importance": coefficients,
        }
    )
    drivers["abs_importance"] = drivers["importance"].abs()
    drivers = drivers.sort_values("abs_importance", ascending=False).head(20)

    drivers.to_sql(
        "churn_drivers",
        engine,
        schema="analytics",
        if_exists="replace",
        index=False,
    )
    print("Saved analytics.churn_drivers")


def record_pipeline_run(engine, status: str, message: str):
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                INSERT INTO analytics.pipeline_runs(status, message)
                VALUES (:status, :message)
                """
            ),
            {"status": status, "message": message},
        )


def main():
    engine = get_engine()
    ensure_schemas(engine)

    df = read_raw_table(engine)
    df = prepare_dataframe(df)

    if df.empty:
        raise RuntimeError("No usable rows found after cleaning raw customer data.")

    pipeline, x, metrics = train_model(df)
    write_analytics_tables(engine, df, pipeline, x, metrics)
    record_pipeline_run(
        engine,
        "success",
        "Transformation and ML training completed successfully.",
    )

    print("Pipeline completed successfully.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("Pipeline failed:", str(exc))
        sys.exit(1)
