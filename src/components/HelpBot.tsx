'use client';

import { Logo } from '@/components/icons/Logo';
import { Button, Input, ScrollShadow } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Minimize2, Send, Sparkles, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickActions = [
  { label: 'How to add products?', query: 'How do I add products to my inventory?' },
  { label: 'GST invoice help', query: 'How do I create a GST-compliant invoice?' },
  { label: 'Team permissions', query: 'How can I set up team roles and permissions?' },
  { label: 'Export reports', query: 'How do I export my inventory reports?' },
];

const HelpBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (query?: string) => {
    const messageContent = query || input.trim();
    if (!messageContent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/help/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageContent }),
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I'm sorry, I couldn't process your request. Please try again or contact support@easeinventory.com",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting. Please try again later or visit our Help Center at /help",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-black rounded-full shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="Open help chat"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '500px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-foreground/5 bg-foreground/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Logo size={24} />
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tight">EaseBot</p>
                  <p className="text-[10px] font-bold text-foreground/40 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Always online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-8 h-8 rounded-lg hover:bg-foreground/5 flex items-center justify-center transition-colors"
                >
                  <Minimize2 size={16} className="text-foreground/50" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-foreground/5 flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-foreground/50" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <ScrollShadow className="flex-1 p-4 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="space-y-4">
                      <div className="text-center py-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <Sparkles size={28} className="text-primary" />
                        </div>
                        <h3 className="font-black uppercase tracking-tight mb-1">Hi there! 👋</h3>
                        <p className="text-sm text-foreground/50 font-medium">
                          How can I help you today?
                        </p>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-wider text-foreground/30">Quick Actions</p>
                        <div className="grid grid-cols-2 gap-2">
                          {quickActions.map((action) => (
                            <button
                              key={action.label}
                              onClick={() => handleSend(action.query)}
                              className="p-3 text-left text-xs font-bold rounded-xl bg-foreground/[0.02] border border-foreground/5 hover:border-primary/30 transition-colors flex items-center gap-2"
                            >
                              <ArrowRight size={12} className="text-primary shrink-0" />
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium ${
                              msg.role === 'user'
                                ? 'bg-primary text-black rounded-br-sm'
                                : 'bg-foreground/5 text-foreground rounded-bl-sm'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-foreground/5 p-3 rounded-2xl rounded-bl-sm">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollShadow>

                {/* Input Area */}
                <div className="p-4 border-t border-foreground/5">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask me anything..."
                      radius="full"
                      size="sm"
                      classNames={{
                        inputWrapper: 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 h-10',
                        input: 'font-medium text-sm',
                      }}
                    />
                    <Button
                      isIconOnly
                      color="primary"
                      radius="full"
                      size="sm"
                      onClick={() => handleSend()}
                      isLoading={isLoading}
                      className="h-10 w-10"
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                  <p className="text-[9px] font-medium text-foreground/20 text-center mt-2">
                    Powered by AI • Visit <a href="/help" className="text-primary hover:underline">/help</a> for more
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HelpBot;
