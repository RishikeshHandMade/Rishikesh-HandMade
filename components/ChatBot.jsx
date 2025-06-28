"use client"
import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Send, MessageCircle, X } from "lucide-react";

import Link from "next/link";

// Helper: checks if the user is logged in
function isLoggedIn(session) {
  return !!session?.user;
}

const productQnA = [
  {
    q: "🛍 Product Information",
    a: `Q: Is this product available in stock?\nA: Yes, the product is currently available.\n\nQ: What sizes/colors are available?\nA: This product comes in [List Sizes/Colors]. Please select your preferred option from the dropdown menu.\n\nQ: Is this product genuine/original?\nA: Yes, we only sell 100% genuine and authentic products.\n\nQ: Can I see more pictures of the product?\nA: Sure! You can find multiple images in the product gallery. Let us know if you need a close-up of any specific feature.\n\nQ: Does this product have a warranty?\nA: Yes, it comes with a [Duration] warranty provided by the manufacturer.`
  },
  {
    q: "🚚 Shipping & Delivery",
    a: `Q: When will I receive my order?\nA: Delivery usually takes [3 to 7 days], depending on your location.\n\nQ: Do you offer free shipping?\nA: We offer free shipping on orders over ₹2,999. Shipping fees apply to orders below that.\n\nQ: Can I track my order?\nA: Yes, once shipped, you will receive a tracking link via email/SMS or your client dashboard.`
  },
  {
    q: "💳 Payment & Checkout",
    a: `Q: What payment methods do you accept?\nA: We accept credit/debit cards, UPI, PayPal, and Cash on Delivery (COD) in selected areas.\n\nQ: Is it safe to make a payment on your site?\nA: Absolutely. Our website uses SSL encryption and secure payment gateways to protect your data.`
  },
  {
    q: "🔁 Returns & Refunds",
    a: `Q: Can I return this product?\nA: Yes, we have a 30-day return policy. The product must be unused and in original condition.\n\nQ: How long does a refund take?\nA: Refunds are processed within 30 business days after we receive the returned item.`
  },
  {
    q: "📦 Order Status",
    a: `Q: Can I track my order?\nA: Yes, once shipped, you will receive a tracking link via email/SMS or your client dashboard.\n\nQ: Can I change or cancel my order?\nA: You can cancel or modify your order within a certain period after placing it. Please contact us immediately for assistance.`
  },
  {
    q: "🧑‍💬 Talk to Support",
    a: `Yes, our customer support is available [Days & Hours]. You can also email us at support@rishikeshhandmade.com or call +91 7351009107, 9411571947.`
  }
];

export default function ChatBot() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0); // 0: greet, 1: small talk, 2: contact, 3: product, 4: menu, 5: qna
  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const [product, setProduct] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const chatWindowRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      setMessages([
        {
          from: "bot",
          text: `Hi there! 👋 Welcome to Rishikesh Handmade!\n\nI’m AI Support Intelligence from our online store – your virtual assistant here to help you with anything you need.\n\nHow can I assist you today?`
        }
      ]);
    }, 1000); // Delay in milliseconds

    return () => clearTimeout(timer);
  }, [open]);



  const handleSmallTalk = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(msgs => [
      ...msgs,
      { from: "user", text: input },
      {
        from: "bot",
        text: `May I know your name and contact number?\n\n📧 Your Email Address:\n📞 Your Phone Number (optional):`
      }
    ]);
    setInput("");
    setStep(2);
  };


  const handleContact = (e) => {
    e.preventDefault();
    if (!contact.name.trim() || !contact.email.trim()) {
      setError("Please enter your name and email.");
      return;
    }

    setMessages(msgs => [
      ...msgs,
      {
        from: "user",
        text: `Name: ${contact.name}\nEmail: ${contact.email}${contact.phone ? `\nPhone: ${contact.phone}` : ""}`
      },
      {
        from: "bot",
        text: `Thank you! 😊\n\nHow can I help you today?\n\nPlease choose one of the options below 👇`
      }
    ]);
    setContact({ name: "", phone: "", email: "" });
    setError("");
    setStep(3);
  };
  const handleQnAOption = (qna) => {
    setMessages((msgs) => [...msgs, { from: "user", text: qna.q }]);

    if (qna.q === "🛍 Product Information") {
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: "Sure! Please share the product name or code (SKU)." }
      ]);
      setStep("product-info"); // Set special step for product input
    } else {
      setMessages((msgs) => [...msgs, { from: "bot", text: qna.a }]);
      setStep(4); // Go to main menu (or stay on 3 if you prefer)
    }
  };
  const handleProduct = async (e) => {
    e.preventDefault();
    if (!product.trim()) {
      setError("Please enter a product name or code.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/product/search?q=${product}`);
      const data = await response.json();
      if (data.product) {
        setMessages(msgs => [
          ...msgs,
          { from: "user", text: product },
          { from: "bot", text: `Product: ${data.product.name}\nPrice: ₹${data.product.price}\nDescription: ${data.product.description}` },
          { from: "bot", text: `Would you like to know more?\n\nPlease choose from the options below:\n\n1. 🛍 Product Information\n2. 🚚 Shipping & Delivery\n3. 💳 Payment & Checkout\n4. 🔁 Returns & Refunds\n5. 📦 Order Status\n6. 🧑‍💬 Talk to Support` }

        ]);
      } else {
        setMessages(msgs => [
          ...msgs,
          { from: "user", text: product },
          { from: "bot", text: "Sorry, product not found." }
        ]);
      }
    } catch (e) {
      setMessages(msgs => [...msgs, { from: "bot", text: "Sorry, something went wrong." }]);
    }
    setLoading(false);
    setProduct("");
    setError("");
    setStep(4);
  };

  // Reset chat on close
  const handleClose = () => {
    setOpen(false);
    setStep(0);
    setMessages([
      { from: "bot", text: "..." }
    ]);
    setInput("");
    setContact({ name: "", phone: "", email: "" });
    setProduct("");
    setError("");
  };

  const handleBubbleClick = () => {
    setOpen(true);

    // Show typing first
    setMessages([{ from: "bot", text: "..." }]);

    // Then show welcome message after 1 second
    setTimeout(() => {
      setMessages([
        {
          from: "bot",
          text: `Hi there! 👋 Welcome to Rishikesh Handmade!\n\nI’m AI Support Intelligence from our online store – your virtual assistant here to help you with anything you need.\n\nHow can I assist you today?`
        }
      ]);
    }, 1000);
  };
  const handleResetChat = () => {
    setMessages([
      {
        from: "bot",
        text: "Hi there! 👋 Welcome to Rishikesh Handmade!\n\nI’m AI Support Intelligence from our online store – your virtual assistant here to help you with anything you need.\n\nHow can I assist you today?",
      },
    ]);
    setStep(0);
    setInput("");
    setContact({ name: "", phone: "", email: "" });
    setProduct("");
    setError("");
  };



  const handleMainMenu = (qna) => {
    setMessages((msgs) => [
      ...msgs,
      { from: "user", text: qna.q },
      { from: "bot", text: qna.a + "\n\nFor more help, contact us at support@rishikeshhandmade.com or call +91 7351009107, 9411571947." },
    ]);
  };

  const handleChatWithAdmin = async () => {
    localStorage.setItem("chat_with_admin", "true");
    localStorage.setItem("chatbot_history", JSON.stringify(messages));
    // Persist bot history to backend
    if (session?.user?.id && messages.length > 0) {
      await fetch('/api/mergeBotHistory', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, botMessages: messages }),
      });
    }
    if (!isLoggedIn(session)) {
      setLoginPrompt(true);
      return;
    }
    window.location.href = "/dashboard?section=chat";
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
          className="fixed bottom-6 right-4 z-100 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center transition-all duration-300"
          aria-label="Open chat"
          onClick={handleBubbleClick}
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      )}
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-2 right-[4%] z-50 w-[330px] h-[30rem] max-w-[95vw] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-blue-600 rounded-t-xl">
            <span className="text-white font-semibold">Chat with us</span>
            <button onClick={handleClose} className="text-white hover:text-gray-200"><X className="w-5 h-5" /></button>
          </div>
          {/* Chat body */}
          <div ref={chatWindowRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-blue-50" style={{ maxHeight: 420 }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.from === "bot" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl text-sm shadow-sm max-w-[80%] whitespace-pre-wrap ${msg.from === "bot"
                    ? "bg-white text-gray-900 border border-gray-200"
                    : "bg-blue-600 text-white border border-blue-600"
                    }`}
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
          {/* Guided chat flow input area */}
          <div className="px-4 py-3 border-t border-gray-100 bg-white rounded-b-xl">
            {/* Step 0: Small talk */}
            {step === 0 && (
              <form onSubmit={handleSmallTalk} className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-blue-500 bg-gray-50"
                  placeholder="Say hi or ask anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 flex items-center justify-center disabled:opacity-60"
                  disabled={!input.trim()}
                  aria-label="Send"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
            {/* Step 2: Contact info */}
            {step === 2 && (
              <form onSubmit={handleContact} className="flex flex-col gap-2">
                <input
                  type="text"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-blue-500 bg-gray-50"
                  placeholder="Your Name (required)"
                  value={contact.name}
                  onChange={e => setContact({ ...contact, name: e.target.value })}
                  autoFocus
                />
                <input
                  type="email"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-blue-500 bg-gray-50"
                  placeholder="Your Email (required)"
                  value={contact.email}
                  onChange={e => setContact({ ...contact, email: e.target.value })}
                />
                <input
                  type="tel"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-blue-500 bg-gray-50"
                  placeholder="Your Phone (optional)"
                  value={contact.phone}
                  onChange={e => setContact({ ...contact, phone: e.target.value })}
                />
                {error && <div className="text-red-500 text-xs">{error}</div>}
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 font-semibold mt-1"
                >
                  Continue
                </button>
              </form>
            )}
            {/* Step 3: Product info */}
            {step === 3 && (
              <>
                <div className="flex flex-wrap gap-2 mb-2">
                  {productQnA.map((qna) => (
                    <button
                      key={qna.q}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-medium transition"
                      onClick={() => handleQnAOption(qna)}
                    >
                      {qna.q}
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === "product-info" && (
              <form onSubmit={handleProduct} className="flex gap-2 mt-1">
                <input
                  type="text"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-blue-500 bg-gray-50"
                  placeholder="Product Name or Code (required)"
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 flex items-center justify-center disabled:opacity-60"
                  disabled={!product.trim()}
                  aria-label="Send"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}


            {/* Step 4: Main menu */}
            {step === 4 && (
              <>
                <div className="flex flex-wrap gap-2 mb-2">
                  {productQnA.map((qna) => (
                    <button
                      key={qna.q}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-medium transition"
                      onClick={() => handleMainMenu(qna)}
                      disabled={loading}
                    >
                      {qna.q}
                    </button>
                  ))}
                </div>

                <button
                  className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                  onClick={() => setStep(0)}
                  disabled={loading}
                >
                  New Question
                </button>
                <button
                  className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
                  onClick={handleChatWithAdmin}
                >
                  🧑‍💬 Chat with Admin
                </button>


                {/* 🔁 Reset Chat Button */}
                <button
                  className="w-full mt-2 text-sm text-red-600 hover:underline"
                  onClick={handleResetChat}
                >
                  🔄 Reset Chat
                </button>
              </>
            )}

            {loginPrompt && (
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm text-gray-700 mb-2">Please log in or sign up to ask a custom question.</span>
                <div className="flex gap-2 w-full">
                </div>
              </div>
            )}
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