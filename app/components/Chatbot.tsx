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
      "Hi, I am the data chatbot. Ask me which customers may leave, why they may leave, or what the main numbers mean.",
    fallback: "Sorry, I could not answer that question yet.",
    unreachable:
      "I could not reach the chatbot. Check that the app is running and the setup values are added.",
    placeholder: "Example: Which customers are most likely to leave?",
    ask: "Ask",
    thinking: "Thinking...",
    label: "Ask the data chatbot",
    aria: "Data chatbot",
  },
  fr: {
    greeting:
      "Bonjour, je suis le chatbot data. Posez une question sur les clients qui peuvent partir, les raisons possibles ou les chiffres clés.",
    fallback: "Désolé, je ne peux pas encore répondre à cette question.",
    unreachable:
      "Je ne peux pas joindre le chatbot. Vérifiez que l'application fonctionne et que les valeurs de configuration sont ajoutées.",
    placeholder: "Exemple : Quels clients sont les plus susceptibles de partir ?",
    ask: "Demander",
    thinking: "Analyse...",
    label: "Poser une question au chatbot data",
    aria: "Chatbot data",
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
