import OpenAI from "openai";
import { parseLang, type Lang } from "@/lib/i18n";
import { hasDatabaseUrl, query } from "@/lib/db";

export const runtime = "nodejs";

type ChatRequest = {
  lang?: string;
  message?: string;
};

type KpiContextRow = {
  metric: string;
  value: string | number;
};

type DriverContextRow = {
  feature: string;
  importance: string | number;
};

type HighRiskContextRow = {
  customerid: string;
  churn_probability: string | number;
  contract: string;
  monthlycharges: string | number;
  tenure: string | number;
};

const friendlyMetricNames: Record<string, string> = {
  actual_churn_rate_percent: "customers_who_really_left_percent",
  avg_churn_probability_percent: "average_chance_of_leaving_percent",
  high_risk_customers: "customers_likely_to_leave",
  model_accuracy: "model_correct_rate",
  model_f1: "model_balance_score",
  model_precision: "warning_accuracy",
  model_recall: "leaver_catch_rate",
  model_roc_auc: "risk_ranking_score",
  monthly_revenue_at_risk: "monthly_bill_at_risk",
  total_customers: "customers",
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function chatbotFailureAnswer(error: unknown, lang: Lang) {
  const message = errorMessage(error);
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("insufficient_quota") ||
    lowerMessage.includes("exceeded your current quota")
  ) {
    return lang === "fr"
      ? "Les données du tableau de bord fonctionnent, mais la clé API OpenAI n'a plus de quota disponible. Ajoutez de la facturation ou des crédits dans OpenAI Platform, puis redéployez Vercel."
      : "The dashboard data is working, but the OpenAI API key has no available quota. Add billing or credits in the OpenAI Platform, then redeploy Vercel.";
  }

  if (
    lowerMessage.includes("invalid_api_key") ||
    lowerMessage.includes("incorrect api key") ||
    lowerMessage.includes("401")
  ) {
    return lang === "fr"
      ? "Les données du tableau de bord fonctionnent, mais la clé API OpenAI est invalide. Créez une nouvelle clé, mettez à jour OPENAI_API_KEY dans Vercel, puis redéployez."
      : "The dashboard data is working, but the OpenAI API key is invalid. Create a new OpenAI API key, update OPENAI_API_KEY in Vercel, and redeploy.";
  }

  if (lowerMessage.includes("model") && lowerMessage.includes("not found")) {
    return lang === "fr"
      ? "Les données du tableau de bord fonctionnent, mais le modèle OpenAI choisi n'est pas disponible pour cette clé API. Vérifiez OPENAI_MODEL dans Vercel."
      : "The dashboard data is working, but the selected OpenAI model is not available for this API key. Check OPENAI_MODEL in Vercel.";
  }

  return lang === "fr"
    ? "J'ai eu un problème pour répondre. Vérifiez les logs serveur, les tables de base de données et les variables d'environnement."
    : "I had a problem answering the question. Check the server logs, database tables, and environment variables.";
}

export async function POST(request: Request) {
  let lang: Lang = "en";

  try {
    const body = (await request.json()) as ChatRequest;
    lang = parseLang(body.lang);
    const userMessage = body.message?.trim();

    if (!userMessage) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    if (!hasDatabaseUrl()) {
      return Response.json(
        {
          answer:
            lang === "fr"
              ? "Le chatbot est prêt, mais DATABASE_URL n'est pas encore configuré. Ajoutez l'URL Neon en lecture seule dans Vercel pour répondre avec les données du tableau."
              : "The chatbot is ready, but DATABASE_URL is not configured yet. Add the Vercel read-only Neon URL so it can answer from the dashboard data.",
        },
        { status: 200 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          answer:
            lang === "fr"
              ? "Les données du tableau de bord sont accessibles, mais OPENAI_API_KEY est manquante. Ajoutez-la pour activer les réponses en langage naturel."
              : "The dashboard data is reachable, but OPENAI_API_KEY is missing. Add it to enable natural-language answers.",
        },
        { status: 200 },
      );
    }

    const [kpis, drivers, highRisk] = await Promise.all([
      query<KpiContextRow>(`
        SELECT metric, value
        FROM analytics.kpi_summary
        ORDER BY metric
      `),
      query<DriverContextRow>(`
        SELECT feature, importance
        FROM analytics.churn_drivers
        ORDER BY abs_importance DESC
        LIMIT 10
      `),
      query<HighRiskContextRow>(`
        SELECT customerid, churn_probability, monthlycharges, contract, tenure
        FROM analytics.churn_predictions
        WHERE risk_level = 'High'
        ORDER BY churn_probability DESC
        LIMIT 5
      `),
    ]);

    const context = {
      main_numbers: kpis.rows.map((row) => ({
        name: friendlyMetricNames[row.metric] ?? row.metric,
        value: row.value,
      })),
      strongest_reasons_customers_may_leave: drivers.rows.map((row) => ({
        original_data_column: row.feature,
        strength_score: row.importance,
      })),
      customers_most_likely_to_leave: highRisk.rows.map((row) => ({
        customer: row.customerid,
        chance_of_leaving: row.churn_probability,
        contract_type: row.contract,
        monthly_bill: row.monthlycharges,
        months_as_customer: row.tenure,
      })),
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
            lang === "fr"
              ? "Vous êtes le chatbot de données Airbyte pour un projet portfolio. Répondez en français simple, comme à un élève de 15 ans. Parlez surtout de clients qui partent au lieu d'utiliser le mot churn, sauf si vous l'expliquez. N'utilisez pas de gras Markdown et ne répétez pas les noms techniques des colonnes sauf si l'utilisateur les demande. Utilisez uniquement le contexte fourni. Si la réponse n'est pas dans le contexte, dites quelles données supplémentaires seraient nécessaires."
              : "You are the Airbyte Data Chatbot for a portfolio project. Answer in simple English, like you are explaining to a 15-year-old. Prefer saying customers leaving instead of churn unless you define churn. Do not use Markdown bold, and do not repeat technical column names unless the user asks for them. Use only the provided data context. If the answer is not in the context, say what extra data would be needed.",
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
        answer: chatbotFailureAnswer(error, lang),
        detail: errorMessage(error),
      },
      { status: 500 },
    );
  }
}
