"use client"
import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, MessageCircle, X } from "lucide-react";

import Link from "next/link";

// Helper: checks if the user is logged in
function isLoggedIn(session) {
  return !!session?.user;
}

const predefinedQnA = [
  {
    q: "What is your return policy?",
    a: "We offer a 7-day return policy on most items. Please visit our Return Policy page for details.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, we ship internationally. Shipping charges and delivery times vary by destination.",
  },
  {
    q: "How can I track my order?",
    a: "Once your order is shipped, you'll receive a tracking link via email.",
  },
  {
    q: "How do I contact support?",
    a: "You can reach our support team using the contact form or email us at support@example.com.",
  },
];

export default function ChatBot() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [customSent, setCustomSent] = useState(false);
  const [input, setInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const chatWindowRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  const handleBubbleClick = () => {
    setOpen(true);
    setTimeout(scrollToBottom, 200);
  };

  const handleClose = () => {
    setOpen(false);
    setShowCustomInput(false);
    setLoginPrompt(false);
    setInput("");
  };

  const handlePredefined = (question) => {
    const answerObj = predefinedQnA.find((qna) => qna.q === question);
    setMessages((msgs) => [
      ...msgs,
      { from: "user", text: question },
      { from: "bot", text: answerObj ? answerObj.a : "Sorry, I don't have an answer for that." },
    ]);
    setTimeout(scrollToBottom, 200);
  };

  const handleAskMore = () => {
    setCustomSent(false);
    if (!isLoggedIn(session)) {
      setLoginPrompt(true);
      return;
    }
    setShowCustomInput(true);
    setLoginPrompt(false);
    setTimeout(scrollToBottom, 200);
  };

  const handleInputSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!isLoggedIn(session)) {
      setLoginPrompt(true);
      return;
    }
    setMessages((msgs) => [...msgs, { from: "user", text: input }]);
    setLoading(true);
    setInput("");
    try {
      // Send to /api/chat/user-query for admin
      await fetch("/api/chat/user-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          userId: session?.user?.id,
          userName: session?.user?.name || session?.user?.email,
          userEmail: session?.user?.email,
        }),
      });
      setCustomSent(true);
      setShowCustomInput(false);
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: "Your question has been sent to our team. We'll get back to you soon!" },
      ]);
    } catch (e) {
      setMessages((msgs) => [...msgs, { from: "bot", text: "Sorry, something went wrong." }]);
    }
    setLoading(false);
    setTimeout(scrollToBottom, 200);
  };


  return (
    <>
      {/* Floating chat bubble */}
      {!open && (
        <button
          className="fixed bottom-2 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center transition-all duration-300"
          aria-label="Open chat"
          onClick={handleBubbleClick}
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      )}
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 max-w-[95vw] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-blue-600 rounded-t-xl">
            <span className="text-white font-semibold">Chat with us</span>
            <button onClick={handleClose} className="text-white hover:text-gray-200"><X className="w-5 h-5" /></button>
          </div>
          {/* Chat body */}
          <div ref={chatWindowRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-blue-50" style={{ maxHeight: 350 }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.from === "user" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl text-sm shadow-sm max-w-[80%] whitespace-pre-wrap "
                  ${msg.from === "user"
                    ? "bg-white text-gray-900 border border-gray-200"
                    : "bg-blue-600 text-white border border-blue-600"}
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-end">
                <div className="px-4 py-2 rounded-2xl text-sm bg-blue-100 text-blue-600 animate-pulse">...
                </div>
              </div>
            )}
          </div>
          {/* Predefined questions & input */}
          <div className="px-4 py-3 border-t border-gray-100 bg-white rounded-b-xl">
            {!showCustomInput && !loginPrompt && (
              <>
                <div className="flex flex-wrap gap-2 mb-2">
                  {predefinedQnA.map((qna) => (
                    <button
                      key={qna.q}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-medium transition"
                      onClick={() => handlePredefined(qna.q)}
                      disabled={loading}
                    >
                      {qna.q}
                    </button>
                  ))}
                </div>
                <button
                  className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                  onClick={handleAskMore}
                  disabled={loading}
                >
                  Ask more
                </button>
              </>
            )}
            {/* Login prompt if not logged in */}
            {loginPrompt && (
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm text-gray-700 mb-2">Please log in or sign up to ask a custom question.</span>
                <div className="flex gap-2 w-full">
                  <Link href="/sign-in" className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Log in</Link>
                  <Link href="/sign-up" className="flex-1 text-center bg-gray-200 text-blue-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">Sign up</Link>
                </div>
              </div>
            )}
            {/* Custom question input */}
            {showCustomInput && !loginPrompt && (
              <form onSubmit={handleInputSend} className="flex gap-2 mt-1">
                <input
                  type="text"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-blue-500 bg-gray-50"
                  placeholder="Type your question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 flex items-center justify-center disabled:opacity-60"
                  disabled={loading || !input.trim()}
                  aria-label="Send"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}