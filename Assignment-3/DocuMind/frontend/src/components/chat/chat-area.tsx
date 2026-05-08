"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { IconArrowUp } from "@tabler/icons-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatArea() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to DocuMind. Upload a document and ask questions about it.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const question = input.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: question,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question }),
        }
      );

      const data = await res.json();

      const answer =
        typeof data?.answer === "string" &&
        data.answer.trim()
          ? data.answer.trim()
          : "I couldn't find an answer in the document.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Error connecting to server. Please try again.",
        },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmptyState = messages.length === 1;

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden min-h-0">
      {/* Glow Effects */}
      <div className="absolute top-[-150px] right-[-50px] h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-3xl" />

      <div className="absolute bottom-[-200px] left-[-50px] h-[400px] w-[400px] rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative z-10 flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-white/10 px-8 py-5 backdrop-blur-xl bg-black/20">
          <h1 className="text-2xl font-semibold">
            DocuMind AI
          </h1>

          <p className="text-sm text-white/50 mt-1">
            Chat with your documents using RAG AI
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-8 py-8">
          {isEmptyState ? (
            <div className="h-full flex items-center justify-center">
              <div className="max-w-4xl w-full mx-auto flex justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-6 py-4 rounded-3xl bg-white/10 border border-white/10 text-center max-w-2xl"
                >
                  {messages[0].content}
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl w-full mx-auto flex flex-col gap-6 pb-10">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`px-5 py-4 rounded-3xl max-w-2xl whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-violet-600 to-blue-600"
                        : "bg-white/10 border border-white/10"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <p className="text-white/40">
                  AI is thinking...
                </p>
              )}

            </div>
          )}
        </div>

        {/* Fixed Input */}
        <div className="shrink-0 p-6 border-t border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-4">
            <Textarea
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your document..."
              className="min-h-[80px] resize-none border-0 bg-transparent text-white focus-visible:ring-0"
            />

            <div className="flex justify-end mt-4">
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="h-12 w-12 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center hover:scale-105 transition disabled:opacity-50"
              >
                <IconArrowUp size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
