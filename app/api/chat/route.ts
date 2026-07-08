import OpenAI from "openai";
import { parseLang, type Lang } from "@/lib/i18n";
import { hasDatabaseUrl, query } from "@/lib/db";

export const runtime = "nodejs";

type ChatRequest = {
  lang?: string;
  message?: string;
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
      ? "Les donnees du tableau de bord fonctionnent, mais la cle API OpenAI n'a plus de quota disponible. Ajoutez de la facturation ou des credits dans OpenAI Platform, puis redeployez Vercel."
      : "The dashboard data is working, but the OpenAI API key has no available quota. Add billing or credits in the OpenAI Platform, then redeploy Vercel.";
  }

  if (
    lowerMessage.includes("invalid_api_key") ||
    lowerMessage.includes("incorrect api key") ||
    lowerMessage.includes("401")
  ) {
    return lang === "fr"
      ? "Les donnees du tableau de bord fonctionnent, mais la cle API OpenAI est invalide. Creez une nouvelle cle, mettez a jour OPENAI_API_KEY dans Vercel, puis redeployez."
      : "The dashboard data is working, but the OpenAI API key is invalid. Create a new OpenAI API key, update OPENAI_API_KEY in Vercel, and redeploy.";
  }

  if (lowerMessage.includes("model") && lowerMessage.includes("not found")) {
    return lang === "fr"
      ? "Les donnees du tableau de bord fonctionnent, mais le modele OpenAI choisi n'est pas disponible pour cette cle API. Verifiez OPENAI_MODEL dans Vercel."
      : "The dashboard data is working, but the selected OpenAI model is not available for this API key. Check OPENAI_MODEL in Vercel.";
  }

  return lang === "fr"
    ? "J'ai eu un probleme pour repondre. Verifiez les logs serveur, les tables de base de donnees et les variables d'environnement."
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
              ? "Le chatbot est pret, mais DATABASE_URL n'est pas encore configure. Ajoutez la chaine PostgreSQL en lecture seule dans Vercel pour repondre avec les tables analytics."
              : "The chatbot is ready, but DATABASE_URL is not configured yet. Add the Vercel read-only PostgreSQL connection string to answer questions from analytics tables.",
        },
        { status: 200 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          answer:
            lang === "fr"
              ? "Les donnees du tableau de bord sont accessibles, mais OPENAI_API_KEY est manquante. Ajoutez-la pour activer les reponses en langage naturel."
              : "The dashboard data is reachable, but OPENAI_API_KEY is missing. Add it to enable natural-language answers.",
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
            lang === "fr"
              ? "Vous etes le chatbot de donnees Airbyte pour un projet portfolio. Expliquez les insights de churn client en francais simple. Utilisez uniquement le contexte fourni. Si la reponse n'est pas dans le contexte, dites quelles donnees supplementaires seraient necessaires."
              : "You are the Airbyte Data Chatbot for a portfolio project. Explain customer churn insights in simple business English. Use only the provided data context. If the answer is not in the context, say what extra data would be needed.",
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
