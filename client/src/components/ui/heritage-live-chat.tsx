import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Minimize2, User, Bot } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Avatar, AvatarFallback } from "./avatar";

// Heritage Life Solutions color palette - Purple theme
const c = {
  background: "#fffaf3",
  primary: "#7c3aed",
  primaryHover: "#6d28d9",
  secondary: "#a78bfa",
  secondaryHover: "#8b5cf6",
  muted: "#e5e7eb",
  textPrimary: "#1f2937",
  textSecondary: "#6b7280",
  cream: "#fffaf3",
  white: "#ffffff",
};

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const quickReplies = [
  "Get a quote",
  "Talk to an agent",
  "Learn about term life",
  "Office hours",
];

const botResponses: { [key: string]: string } = {
  "get a quote": "I'd be happy to help you get a quote! You can click here to start your personalized quote, or I can have one of our advisors call you. What works best?",
  "talk to an agent": "Great! Our team is available Monday-Friday, 9am-5pm CT. You can call us at (630) 555-0123, or leave your contact info and we'll reach out within 24 hours.",
  "learn about term life": "Term life insurance provides coverage for a specific period (10, 20, or 30 years). It's the most affordable option and perfect for protecting your family during peak earning years. Would you like to learn more or get a quote?",
  "office hours": "Our office hours are:\n• Monday - Friday: 9:00 AM - 5:00 PM CT\n• Saturday: By Appointment\n• Sunday: Closed\n\nYou can also reach us anytime via email at contact@heritagels.org",
  "default": "Thanks for reaching out! One of our advisors will get back to you shortly. In the meantime, is there anything specific I can help you with?",
};

export function HeritageLiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! 👋 Welcome to Heritage Life Solutions. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setHasNewMessage(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let response = botResponses.default;

      for (const [key, value] of Object.entries(botResponses)) {
        if (lowerText.includes(key)) {
          response = value;
          break;
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasNewMessage(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 md:right-6 w-[calc(100%-2rem)] md:w-96 max-w-sm rounded-2xl shadow-2xl border overflow-hidden z-50"
            style={{ backgroundColor: c.white, borderColor: c.muted }}
          >
            <div
              className="p-4 flex items-center justify-between"
              style={{ background: `linear-gradient(to right, ${c.primary}, ${c.primaryHover})` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${c.secondary}40` }}
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Heritage Life Support</h3>
                  <p className="text-xs text-white/70 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    We typically reply instantly
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={() => setIsMinimized(true)}
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="h-80 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: c.cream }}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${message.isBot ? "" : "flex-row-reverse"}`}
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback style={{ backgroundColor: message.isBot ? c.primary : c.secondary, color: c.white }}>
                      {message.isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className="max-w-[75%] rounded-2xl px-4 py-2"
                    style={{
                      backgroundColor: message.isBot ? c.white : c.primary,
                      color: message.isBot ? c.textPrimary : c.white,
                      borderRadius: message.isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                      border: message.isBot ? `1px solid ${c.muted}` : 'none',
                      boxShadow: message.isBot ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback style={{ backgroundColor: c.primary, color: c.white }}>
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className="rounded-2xl px-4 py-3"
                    style={{ backgroundColor: c.white, border: `1px solid ${c.muted}`, borderRadius: '16px 16px 16px 4px' }}
                  >
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: c.muted, animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: c.muted, animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: c.muted, animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t" style={{ backgroundColor: c.white, borderColor: c.muted }}>
              <div className="flex flex-wrap gap-2 mb-3">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleSendMessage(reply)}
                    className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                    style={{
                      borderColor: `${c.primary}30`,
                      color: c.primary
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = c.primary;
                      e.currentTarget.style.color = c.white;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = c.primary;
                    }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex gap-2"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full"
                  style={{ borderColor: c.muted }}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full shrink-0"
                  style={{ backgroundColor: c.primary, color: c.white }}
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        onClick={handleOpen}
        className="fixed bottom-4 right-4 md:right-6 w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center z-50 group"
        style={{ backgroundColor: c.primary }}
      >
        <AnimatePresence mode="wait">
          {isOpen && !isMinimized ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {hasNewMessage && !isOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center font-bold"
            style={{ backgroundColor: c.secondary, color: c.white }}
          >
            1
          </motion.span>
        )}

        <span
          className="absolute right-full mr-3 px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ backgroundColor: c.white, color: c.primary }}
        >
          Chat with us!
        </span>
      </motion.button>
    </>
  );
}
