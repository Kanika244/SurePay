import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = "http://localhost:8000/api/agent";

interface Message {
    role: "user" | "agent";
    text: string;
}

const SUGGESTIONS = [
    "How many employees do I have?",
    "Show me unverified employees",
    "What's my wallet balance?",
    "Show me analytics",
];

const AgentChat = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const companyId = localStorage.getItem("company_id") || "";

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (open && inputRef.current) inputRef.current.focus();
    }, [open]);

    const sendMessage = async (text?: string) => {
        const msg = text || input.trim();
        if (!msg || loading) return;

        const userMsg: Message = { role: "user", text: msg };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(`${API}/chat/${companyId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: msg,
                    history: messages.slice(-10), // Last 10 messages for context
                }),
            });
            const data = await res.json();
            setMessages(prev => [
                ...prev,
                { role: "agent", text: data.reply || "Sorry, something went wrong." },
            ]);
        } catch {
            setMessages(prev => [
                ...prev,
                { role: "agent", text: "Failed to connect to the agent. Please try again." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Simple markdown-like formatting
    const formatText = (text: string) => {
        return text.split("\n").map((line, i) => {
            // Bold
            let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Bullet points
            if (formatted.startsWith("- ") || formatted.startsWith("* ")) {
                formatted = `<span class="ml-2">• ${formatted.slice(2)}</span>`;
            }
            // Numbered lists
            const numMatch = formatted.match(/^(\d+)\.\s/);
            if (numMatch) {
                formatted = `<span class="ml-2">${formatted}</span>`;
            }
            return (
                <span key={i} className="block" dangerouslySetInnerHTML={{ __html: formatted || "&nbsp;" }} />
            );
        });
    };

    return (
        <>
            {/* Floating Button */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all group"
                >
                    <Sparkles size={22} className="group-hover:rotate-12 transition-transform" />
                </button>
            )}

            {/* Chat Panel */}
            {open && (
                <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                                <Bot size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold">SurePay AI Assistant</h3>
                                <p className="text-[11px] text-white/70">Powered by Gemini</p>
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition p-1">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center pt-8">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
                                    <Sparkles size={28} className="text-indigo-500" />
                                </div>
                                <h4 className="text-sm font-semibold mb-1">How can I help?</h4>
                                <p className="text-xs text-muted-foreground mb-5">
                                    I can manage employees, check wallets, show analytics, and more.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {SUGGESTIONS.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(s)}
                                            className="text-[11px] px-3 py-1.5 rounded-full border border-border bg-muted/50 hover:bg-muted text-foreground transition"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                {msg.role === "agent" && (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                                        <Bot size={14} className="text-white" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-br-md"
                                            : "bg-muted text-foreground rounded-bl-md"
                                        }`}
                                >
                                    {msg.role === "agent" ? formatText(msg.text) : msg.text}
                                </div>
                                {msg.role === "user" && (
                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <User size={14} className="text-primary" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                                    <Bot size={14} className="text-white" />
                                </div>
                                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                                    <Loader2 size={14} className="animate-spin text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Thinking...</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-border p-3 shrink-0">
                        <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-1">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything..."
                                className="flex-1 bg-transparent text-sm outline-none py-2 placeholder:text-muted-foreground/60"
                                disabled={loading}
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-lg shrink-0"
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || loading}
                            >
                                <Send size={16} />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AgentChat;
