import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Check,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingDown,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { EventData, ChatMessage, ProposedChange } from '../../types';
import { formatINR } from '../../lib/calculations';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData;
  onApplyProposedChange: (change: ProposedChange) => void;
}

const QUICK_PROMPTS = [
  'Reduce total budget by 10%',
  'Suggest a pure vegetarian royal menu',
  'Add task to book drone photographer',
  'Suggest cost-saving decoration alternatives',
  'What are the biggest planning risks for this event?',
];

export function AIChatDrawer({
  isOpen,
  onClose,
  event,
  onApplyProposedChange,
}: AIChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `Namaste! I am your Festivo AI Copilot for "${event.name}". Ask me to adjust your ₹${event.totalBudget.toLocaleString()} budget, recommend regional delicacies, add preparation tasks, or optimize your timeline. Every modification requires your direct approval!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsSending(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          eventContext: event,
          conversationHistory: messages.slice(-6),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Chat service error');
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposedChange: data.proposedChange || undefined,
        changeStatus: data.proposedChange ? 'pending' : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'system',
        content: `Error: ${err.message || 'Unable to connect to Festivo AI.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleApprove = (msgId: string, change: ProposedChange) => {
    onApplyProposedChange(change);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, changeStatus: 'accepted' } : m))
    );
  };

  const handleReject = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, changeStatus: 'rejected' } : m))
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-purple-100 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C4AB6] to-[#FF7F6A] flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#252336] font-['Outfit']">
              Festivo AI Copilot
            </h3>
            <span className="text-[10px] text-purple-700 font-semibold block -mt-0.5">
              Context: {event.name}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user'
                ? 'items-end'
                : msg.role === 'system'
                ? 'items-center'
                : 'items-start'
            }`}
          >
            {msg.role === 'system' ? (
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] text-center max-w-xs">
                {msg.content}
              </div>
            ) : (
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-[#6C4AB6] text-white rounded-br-none shadow-xs'
                    : 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200/60'
                }`}
              >
                <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>

                {/* Proposed Change Card with Approval Workflow */}
                {msg.proposedChange && (
                  <div className="mt-3 p-3 rounded-xl bg-white text-slate-900 border border-purple-200 shadow-xs space-y-2.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#6C4AB6] text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Proposed Event Modification</span>
                    </div>

                    <p className="font-semibold text-xs text-[#252336]">
                      {msg.proposedChange.summary}
                    </p>

                    <p className="text-[11px] text-slate-600">
                      {msg.proposedChange.explanation}
                    </p>

                    {/* Diff Preview */}
                    {msg.proposedChange.diff && msg.proposedChange.diff.length > 0 && (
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[10px] space-y-1">
                        <span className="font-semibold text-slate-500 block uppercase">
                          Comparison Diff
                        </span>
                        {msg.proposedChange.diff.map((d, i) => (
                          <div key={i} className="flex justify-between items-center text-slate-700">
                            <span className="font-medium">{d.field}:</span>
                            <span className="line-through text-rose-500 mr-2">{String(d.oldValue)}</span>
                            <span className="font-bold text-[#248A5A]">{String(d.newValue)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Approve / Reject Controls */}
                    {msg.changeStatus === 'pending' ? (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => handleApprove(msg.id, msg.proposedChange!)}
                          className="flex-1 py-1.5 rounded-lg bg-[#6C4AB6] hover:bg-[#5A3C9E] text-white font-semibold text-xs flex items-center justify-center gap-1 transition cursor-pointer shadow-xs active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve & Apply
                        </button>
                        <button
                          onClick={() => handleReject(msg.id)}
                          className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : msg.changeStatus === 'accepted' ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#248A5A] pt-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Approved and applied to event data!
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 pt-1">
                        <XCircle className="w-4 h-4" />
                        Proposal rejected (no changes made).
                      </div>
                    )}
                  </div>
                )}

                <span
                  className={`text-[9px] block text-right mt-1 ${
                    msg.role === 'user' ? 'text-purple-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#6C4AB6]" />
            <span>Festivo AI is formulating recommendations...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-purple-300 hover:text-[#6C4AB6] whitespace-nowrap transition cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-purple-100 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask AI Copilot to adjust budget, tasks..."
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#6C4AB6] text-xs"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isSending}
          className="p-2.5 rounded-xl bg-[#6C4AB6] hover:bg-[#5A3C9E] text-white disabled:opacity-50 transition cursor-pointer active:scale-95 shadow-xs shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
