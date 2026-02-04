'use client';

import {
    Avatar,
    Button,
    Card,
    Chip,
    Input,
    ScrollShadow,
    Spinner,
} from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Bot,
    ChevronDown,
    MessageCircle,
    Send,
    Sparkles,
    User,
    X
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedActions?: string[];
  relatedTopics?: string[];
}

export default function AIHelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions on mount
  useEffect(() => {
    fetchSuggestions();
    setMounted(true);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch('/api/help/ai-chat');
      const data = await res.json();
      if (data.success) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/help/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          conversationHistory,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          suggestedActions: data.suggestedActions,
          relatedTopics: data.relatedTopics,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          "I'm sorry, I couldn't process your request. Please try again or contact support@easeinventory.com for assistance.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 flex items-center justify-center"
          >
            <MessageCircle size={24} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
              <Sparkles size={10} className="text-white" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-100px)]"
          >
            <Card 
              data-help-widget="true"
              className="w-full h-full flex flex-col overflow-hidden rounded-3xl border border-white/20 dark:border-zinc-700/50 backdrop-blur-xl bg-white/90 dark:bg-zinc-900/95 shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">AI Assistant</h3>
                    <p className="text-xs opacity-80">Powered by Claude</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="text-white/80 hover:text-white"
                      onClick={clearChat}
                    >
                      <ChevronDown size={18} />
                    </Button>
                  )}
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="text-white/80 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    <X size={18} />
                  </Button>
                </div>
              </div>

              {/* Messages area */}
              <ScrollShadow className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">
                      Hi! How can I help?
                    </h4>
                    <p className="text-sm text-foreground/60 mb-6">
                      Ask me anything about EaseInventory
                    </p>

                    {/* Quick suggestions */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {suggestions.slice(0, 4).map((suggestion, idx) => (
                        <Chip
                          key={idx}
                          variant="flat"
                          className="cursor-pointer hover:bg-primary/20 transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Chip>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <Avatar
                          size="sm"
                          className={`flex-shrink-0 ${
                            message.role === 'assistant'
                              ? 'bg-primary/20'
                              : 'bg-foreground/10'
                          }`}
                          icon={
                            message.role === 'assistant' ? (
                              <Bot size={16} className="text-primary" />
                            ) : (
                              <User size={16} />
                            )
                          }
                        />
                        <div
                          className={`flex flex-col max-w-[80%] ${
                            message.role === 'user' ? 'items-end' : ''
                          }`}
                        >
                          <div
                            className={`p-3 rounded-2xl text-sm ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-sm'
                                : 'bg-foreground/5 rounded-bl-sm'
                            }`}
                          >
                            <div className="whitespace-pre-wrap">
                              {message.content}
                            </div>
                          </div>

                          {/* Related topics */}
                          {message.relatedTopics &&
                            message.relatedTopics.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {message.relatedTopics.map((topic, idx) => (
                                  <Chip
                                    key={idx}
                                    size="sm"
                                    variant="flat"
                                    className="text-xs cursor-pointer hover:bg-primary/20"
                                    onClick={() => handleSuggestionClick(`Tell me about ${topic}`)}
                                  >
                                    {topic}
                                  </Chip>
                                ))}
                              </div>
                            )}

                          <span className="text-[10px] text-foreground/40 mt-1">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex gap-3">
                        <Avatar
                          size="sm"
                          className="bg-primary/20 flex-shrink-0"
                          icon={<Bot size={16} className="text-primary" />}
                        />
                        <div className="p-3 rounded-2xl rounded-bl-sm bg-foreground/5">
                          <div className="flex items-center gap-2">
                            <Spinner size="sm" color="primary" />
                            <span className="text-sm text-foreground/60">
                              Thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </ScrollShadow>

              {/* Input area */}
              <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-700/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-b-3xl">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    size="sm"
                    radius="full"
                    classNames={{
                      inputWrapper: 'bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50 h-10 backdrop-blur-sm',
                    }}
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    isIconOnly
                    color="primary"
                    radius="full"
                    size="sm"
                    className="h-10 w-10 shadow-md"
                    isDisabled={!input.trim() || isLoading}
                  >
                    <Send size={16} />
                  </Button>
                </form>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center mt-2">
                  AI can make mistakes. Verify important information.
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
