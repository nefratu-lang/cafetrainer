import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_USER_MESSAGE } from './constants';
import { parseGeminiResponse } from './utils/parser';
import { sendMessage, startChat } from './services/geminiService';
import { SessionState, ChatMessage, MistakeType } from './types';
import MessageBubble from './components/MessageBubble';
import StatsPanel from './components/StatsPanel';
import InputArea from './components/InputArea';
import SummaryCard from './components/SummaryCard';
import { Anchor, Ship, Coffee } from 'lucide-react';

const INITIAL_STATE: SessionState = {
  isActive: false,
  currentScene: 'cafe',
  score: 0,
  totalErrors: 0,
  mistakes: {
    some_any: 0,
    much_many: 0,
    countable_uncountable: 0,
    none: 0,
    other: 0
  },
  messages: [],
  isLoading: false,
  isFinished: false
};

const App: React.FC = () => {
  const [session, setSession] = useState<SessionState>(INITIAL_STATE);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, session.isFinished]);

  const handleStartSession = async () => {
    setSession({ ...INITIAL_STATE, isActive: true, isLoading: true });
    
    try {
      await startChat();
      const rawResponse = await sendMessage(INITIAL_USER_MESSAGE);
      const { text, meta } = parseGeminiResponse(rawResponse || '');
      
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: text
      };

      setSession(prev => ({
        ...prev,
        messages: [newMsg],
        currentScene: meta?.scene || 'cafe',
        isLoading: false
      }));

    } catch (error) {
      console.error("Failed to start session:", error);
      alert(`Oturum başlatılamadı. Hata: ${error}\nLütfen API Anahtarını kontrol edin.`);
      setSession(prev => ({ ...prev, isLoading: false, isActive: false }));
    }
  };

  const handleUserMessage = async (text: string) => {
    // Optimistic user update
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text
    };

    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isLoading: true
    }));

    try {
      const rawResponse = await sendMessage(text);
      const { text: cleanText, meta, summary } = parseGeminiResponse(rawResponse || '');

      setSession(prev => {
        const next = { ...prev };
        if (cleanText) {
             next.messages = [...prev.messages, {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: cleanText
              }];
        } else {
             next.messages = [...prev.messages]; 
        }
        
        next.isLoading = false;

        // If we got a final summary
        if (summary) {
            next.isFinished = true;
            next.totalErrors = summary.total_errors;
            next.score = summary.final_score;
            if (summary.errors_by_type) {
                 Object.entries(summary.errors_by_type).forEach(([key, val]) => {
                     if (key in next.mistakes) {
                         next.mistakes[key as MistakeType] = val;
                     }
                 });
            }
        }

        // Process Meta Updates
        if (meta && !summary) {
            next.currentScene = meta.scene;
            next.score = prev.score + (meta.score_delta || 0);
            
            if (meta.mistake_type && meta.mistake_type !== 'none') {
                 if (meta.is_quantifier_correct === false) {
                     next.totalErrors = prev.totalErrors + 1;
                     next.mistakes = {
                         ...prev.mistakes,
                         [meta.mistake_type]: (prev.mistakes[meta.mistake_type] || 0) + 1
                     };
                 }
            }
        }
        
        return next;
      });

    } catch (error) {
      console.error("Error sending message:", error);
      setSession(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden relative">
        
        {/* Background Decorations (Warships & Anchors) */}
        <div className="absolute top-10 left-10 opacity-5 text-slate-400 pointer-events-none hidden xl:block">
            <Ship size={180} />
        </div>
        <div className="absolute bottom-10 right-10 opacity-5 text-slate-400 pointer-events-none hidden xl:block">
            <Anchor size={180} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full md:px-4 md:py-6 h-full z-10">
            
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-slate-900 md:rounded-t-2xl border-b border-slate-700 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-600/30">
                        <Anchor size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight uppercase">Damyo Cipa Kafeterya <span className="text-blue-400 text-sm normal-case">V1.00</span></h1>
                        <p className="text-xs text-slate-400 font-medium">Naval English Practice</p>
                    </div>
                </div>
                {!session.isActive && !session.isLoading && (
                   <div className="text-sm text-slate-400 font-medium hidden sm:block">
                     Hazır olda bekle
                   </div>
                )}
            </header>

            {/* Chat Area + Sidebar Container */}
            <div className="flex-1 flex overflow-hidden bg-white md:rounded-b-2xl shadow-xl border-x border-b border-slate-200">
                
                {/* Chat Column */}
                <main className="flex-1 flex flex-col relative">
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide space-y-4">
                        {session.messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-4">
                                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                                    <div className="bg-blue-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                        <Ship size={40} className="text-blue-700" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Damyo Cipa Kafeterya</h2>
                                    <p className="text-slate-500 mb-6 text-sm">Denizci usulü "Some, Any, Much, Many" pratikleri.</p>
                                    
                                    <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 space-y-3">
                                        <h3 className="font-semibold text-slate-700 text-xs uppercase tracking-wide mb-2 border-b border-slate-200 pb-2">Talimatlar</h3>
                                        
                                        <div className="flex items-start gap-3 text-sm text-slate-600">
                                            <div className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded text-xs min-w-[2rem] text-center mt-0.5">+1</div>
                                            <p className="leading-snug">İlk denemede doğru sipariş ver.</p>
                                        </div>
                                        
                                        <div className="flex items-start gap-3 text-sm text-slate-600">
                                            <div className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-xs min-w-[2rem] text-center mt-0.5">-1</div>
                                            <p className="leading-snug">3 yanlış hakaret sayılır (puan düşer).</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {session.messages.map((msg) => (
                                    <MessageBubble key={msg.id} message={msg} />
                                ))}
                                {session.isLoading && (
                                    <div className="flex justify-start mb-6 animate-pulse">
                                         <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100"></div>
                                            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-400 w-24">
                                                Thinking...
                                            </div>
                                         </div>
                                    </div>
                                )}
                                {session.isFinished && (
                                    <SummaryCard 
                                        score={session.score}
                                        totalErrors={session.totalErrors}
                                        mistakes={session.mistakes}
                                        totalTurns={session.messages.length}
                                    />
                                )}
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Input Area */}
                    <InputArea 
                        onSendMessage={handleUserMessage} 
                        isLoading={session.isLoading} 
                        isActive={session.isActive}
                        onRestart={handleStartSession}
                        isFinished={session.isFinished}
                    />
                </main>

                {/* Sidebar Stats (Desktop) */}
                <aside className="w-80 border-l border-slate-200 bg-slate-50 p-6 hidden lg:block">
                    <StatsPanel session={session} />
                </aside>

            </div>
        </div>
    </div>
  );
};

export default App;
