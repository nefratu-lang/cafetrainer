import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_USER_MESSAGE } from './constants';
import { parseGeminiResponse } from './utils/parser';
import { sendMessage, startChat } from './services/geminiService';
import { SessionState, ChatMessage, MistakeType } from './types';
import MessageBubble from './components/MessageBubble';
import StatsPanel from './components/StatsPanel';
import InputArea from './components/InputArea';
import SummaryCard from './components/SummaryCard';
import { Coffee } from 'lucide-react';

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
            // Even if empty text, we keep the user message
             next.messages = [...prev.messages]; 
        }
        
        next.isLoading = false;

        // If we got a final summary
        if (summary) {
            next.isFinished = true;
            next.totalErrors = summary.total_errors;
            next.score = summary.final_score;
            // Map mistakes from summary if provided
            if (summary.errors_by_type) {
                 // Cast loosely or map correctly depending on strictness needed
                 // merging just in case
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
    <div className="flex h-screen bg-stone-100 overflow-hidden relative">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full md:px-4 md:py-6 h-full">
            
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-white md:rounded-t-2xl border-b border-stone-200">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-600 p-2 rounded-lg text-white shadow-lg shadow-amber-600/20">
                        <Coffee size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-stone-800 tracking-tight">CafeTrainer</h1>
                        <p className="text-xs text-stone-500 font-medium">English A1-A2 Practice</p>
                    </div>
                </div>
                {!session.isActive && !session.isLoading && (
                   <div className="text-sm text-stone-400 font-medium hidden sm:block">
                     Ready to start
                   </div>
                )}
            </header>

            {/* Chat Area + Sidebar Container */}
            <div className="flex-1 flex overflow-hidden bg-white md:rounded-b-2xl shadow-xl border-x border-b border-stone-200">
                
                {/* Chat Column */}
                <main className="flex-1 flex flex-col relative">
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide space-y-4">
                        {session.messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-4">
                                <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-sm border border-stone-200 text-center">
                                    <div className="bg-amber-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                        <Coffee size={32} className="text-amber-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-stone-800 mb-2">CafeTrainer'a Hoş Geldiniz</h2>
                                    <p className="text-stone-500 mb-6 text-sm">Gerçekçi kafe ve market diyaloglarıyla "Some, Any, Much, Many" gibi miktar belirteçlerini öğrenin.</p>
                                    
                                    <div className="text-left bg-stone-50 p-4 rounded-xl border border-stone-100 mb-6 space-y-3">
                                        <h3 className="font-semibold text-stone-700 text-xs uppercase tracking-wide mb-2 border-b border-stone-200 pb-2">Oyun Kuralları & Puanlama</h3>
                                        
                                        <div className="flex items-start gap-3 text-sm text-stone-600">
                                            <div className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-xs min-w-[2rem] text-center mt-0.5">+1</div>
                                            <p className="leading-snug">Cümle içinde <strong>miktar belirteçlerini</strong> (some, any, much, many) ilk seferde doğru kullanırsan puan kazanırsın.</p>
                                        </div>
                                        
                                        <div className="flex items-start gap-3 text-sm text-stone-600">
                                            <div className="bg-stone-200 text-stone-600 font-bold px-2 py-0.5 rounded text-xs min-w-[2rem] text-center mt-0.5">0</div>
                                            <p className="leading-snug">Öğretmen düzelttikten sonra tekrar denediğinde puan değişmez.</p>
                                        </div>
                                        
                                        <div className="flex items-start gap-3 text-sm text-stone-600">
                                            <div className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded text-xs min-w-[2rem] text-center mt-0.5">-1</div>
                                            <p className="leading-snug">Aynı hatayı 3 kez tekrarlarsan veya yanlış kelime kullanırsan puan kaybedersin.</p>
                                        </div>
                                    </div>

                                    <div className="text-xs text-stone-400">
                                        <p>Bitirmek için sohbet sırasında "finish" yazabilirsiniz.</p>
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
                                            <div className="w-10 h-10 rounded-full bg-amber-100"></div>
                                            <div className="p-4 rounded-2xl bg-white border border-stone-200 text-stone-400 w-24">
                                                Typing...
                                            </div>
                                         </div>
                                    </div>
                                )}
                                {/* SHOW SUMMARY CARD HERE IF FINISHED */}
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
                <aside className="w-80 border-l border-stone-200 bg-stone-50 p-6 hidden lg:block">
                    <StatsPanel session={session} />
                </aside>

            </div>
        </div>
    </div>
  );
};

export default App;
