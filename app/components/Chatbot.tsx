"use client";

import { FormEvent, useState } from "react";
import type { Lang } from "@/lib/i18n";

type Message = {
  role: "user" | "assistant";
  text: string;
};

const text = {
  en: {
    greeting:
      "Hi, I am the Airbyte Data Chatbot. Ask me about churn risk, KPIs, high-risk customers, or churn drivers.",
    fallback: "Sorry, I could not answer that question yet.",
    unreachable:
      "I could not reach the chatbot API. Check that the app is running and environment variables are set.",
    placeholder: "Example: What are the main churn drivers?",
    ask: "Ask",
    thinking: "Thinking...",
    label: "Ask the Airbyte Data Chatbot",
    aria: "Airbyte Data Chatbot",
  },
  fr: {
    greeting:
      "Bonjour, je suis le chatbot de données Airbyte. Posez une question sur le risque de churn, les KPI, les clients à risque ou les facteurs de churn.",
    fallback: "Désolé, je ne peux pas encore répondre à cette question.",
    unreachable:
      "Je ne peux pas joindre l'API du chatbot. Vérifiez que l'application fonctionne et que les variables d'environnement sont configurées.",
    placeholder: "Exemple : Quels sont les principaux facteurs de churn ?",
    ask: "Demander",
    thinking: "Analyse...",
    label: "Poser une question au chatbot Airbyte",
    aria: "Chatbot de données Airbyte",
  },
};

function renderFormattedText(message: string) {
  return message.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    const boldMatch = part.match(/^\*\*(.+)\*\*$/);

    if (boldMatch) {
      return <strong key={`${part}-${index}`}>{boldMatch[1]}</strong>;
    }

    return part;
  });
}

export default function Chatbot({ lang = "en" }: { lang?: Lang }) {
  const copy = text[lang];
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: copy.greeting,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const userMessage = input.trim();
    if (!userMessage || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", text: userMessage },
    ]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lang, message: userMessage }),
      });

      const data = (await response.json()) as { answer?: string; error?: string };

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text:
            data.answer ||
            data.error ||
            copy.fallback,
        },
      ]);
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: copy.unreachable,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="chatbot" aria-label={copy.aria}>
      <div className="messages" aria-live="polite">
        {messages.map((message, index) => (
          <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
            <span className="bubble">{renderFormattedText(message.text)}</span>
          </div>
        ))}
      </div>

      <form className="chat-form" onSubmit={sendMessage}>
        <input
          aria-label={copy.label}
          className="chat-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={copy.placeholder}
        />
        <button className="button" disabled={loading || !input.trim()} type="submit">
          {loading ? copy.thinking : copy.ask}
        </button>
      </form>
    </section>
  );
}
