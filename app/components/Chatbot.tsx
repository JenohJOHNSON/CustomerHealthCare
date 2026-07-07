"use client";

import { FormEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi, I am the Airbyte Data Chatbot. Ask me about churn risk, KPIs, high-risk customers, or churn drivers.",
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
        body: JSON.stringify({ message: userMessage }),
      });

      const data = (await response.json()) as { answer?: string; error?: string };

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text:
            data.answer ||
            data.error ||
            "Sorry, I could not answer that question yet.",
        },
      ]);
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: "I could not reach the chatbot API. Check that the app is running and environment variables are set.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="chatbot" aria-label="Airbyte Data Chatbot">
      <div className="messages" aria-live="polite">
        {messages.map((message, index) => (
          <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
            <span className="bubble">{message.text}</span>
          </div>
        ))}
      </div>

      <form className="chat-form" onSubmit={sendMessage}>
        <input
          aria-label="Ask the Airbyte Data Chatbot"
          className="chat-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Example: What are the main churn drivers?"
        />
        <button className="button" disabled={loading || !input.trim()} type="submit">
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>
    </section>
  );
}
