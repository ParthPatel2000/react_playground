// ChatbotUI.jsx
import React, { useState, useRef, useEffect } from "react";
import Chatbot from "./chatbot.js";

export default function ChatbotUI() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { sender: "bot", text: "Hi! How can I help you today?" },
    ]);
    const messagesEndRef = useRef(null);
    const chatbot = useRef(new Chatbot());

    useEffect(() => {
        if (open && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, open]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        // Add temporary typing indicator
        const typingMessage = { sender: "bot", text: "…" };
        setMessages((prev) => [...prev, typingMessage]);

        const response = await chatbot.current.fetchResponse(input);
        const botMessage = { sender: "bot", text: response };

        // Replace the typing indicator with real response
        setMessages((prev) => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = botMessage; // overwrite last
            return newMsgs;
        });
    };


    return (
        <>
            {!open && (
                <button
                    className="fixed bottom-6 right-6 rounded-full w-[60px] h-[60px] bg-blue-600 text-white shadow-lg text-2xl z-50 flex items-center justify-center"
                    onClick={() => setOpen(true)}
                >
                    💬
                </button>
            )}

            {open && (
                <div className="flex flex-col fixed bottom-6 right-6 w-[340px] h-[420px] glassmorphic">
                    {/* Header */}
                    <div className="p-4 bg-black/80 text-white rounded-t-2xl flex justify-between items-center border-b border-white/20 shadow-md">
                        <span>AI Parth</span>
                        <button
                            className="text-white text-xl"
                            onClick={() => setOpen(false)}
                        >
                            ×
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-3 overflow-y-auto bg-black/30">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={
                                    msg.sender === "user"
                                        ? "flex justify-end mb-2"
                                        : "flex justify-start mb-2"
                                }
                            >
                                <div
                                    className={
                                        msg.sender === "user"
                                            ? "bg-gray-700 text-white rounded-xl px-4 py-2 max-w-[70%] text-sm shadow"
                                            : "bg-gray-300 text-gray-900 rounded-xl px-4 py-2 max-w-[70%] text-sm shadow"
                                    }
                                >
                                    {
                                        msg.text === "…" ? (
                                            <div className="flex space-x-1">
                                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
                                            </div>
                                        ) : (
                                            msg.text
                                        )
                                    }
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-white/20 bg-black/40 flex">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Type your message..."
                            className="flex-1 text-black border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                        <button
                            onClick={handleSend}
                            className="ml-2 bg-gray-700 text-white rounded-lg px-4 py-2 text-sm"
                            disabled={!input.trim()}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
