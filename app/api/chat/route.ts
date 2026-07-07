import OpenAI from "openai";
import { hasDatabaseUrl, query } from "@/lib/db";

export const runtime = "nodejs";

type ChatRequest = {
  message?: string;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;
    const userMessage = body.message?.trim();

    if (!userMessage) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    if (!hasDatabaseUrl()) {
      return Response.json(
        {
          answer:
            "The chatbot is ready, but DATABASE_URL is not configured yet. Add the Vercel read-only PostgreSQL connection string to answer questions from analytics tables.",
        },
        { status: 200 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          answer:
            "The dashboard data is reachable, but OPENAI_API_KEY is missing. Add it to enable natural-language answers.",
        },
        { status: 200 },
      );
    }

    const [kpis, drivers, highRisk] = await Promise.all([
      query(`
        SELECT metric, value
        FROM analytics.kpi_summary
        ORDER BY metric
      `),
      query(`
        SELECT feature, importance
        FROM analytics.churn_drivers
        ORDER BY abs_importance DESC
        LIMIT 10
      `),
      query(`
        SELECT customerid, churn_probability, monthlycharges, contract, tenure
        FROM analytics.churn_predictions
        WHERE risk_level = 'High'
        ORDER BY churn_probability DESC
        LIMIT 5
      `),
    ]);

    const context = {
      kpis: kpis.rows,
      top_churn_drivers: drivers.rows,
      sample_high_risk_customers: highRisk.rows,
    };

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are the Airbyte Data Chatbot for a portfolio project. Explain customer churn insights in simple business English. Use only the provided data context. If the answer is not in the context, say what extra data would be needed.",
        },
        {
          role: "user",
          content: `Data context:\n${JSON.stringify(
            context,
            null,
            2,
          )}\n\nUser question:\n${userMessage}`,
        },
      ],
    });

    return Response.json({
      answer: response.output_text,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        answer:
          "I had a problem answering the question. Check the server logs, database tables, and environment variables.",
        detail: errorMessage(error),
      },
      { status: 500 },
    );
  }
}
