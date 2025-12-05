import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, RefreshCw } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isActive: boolean;
  onRestart: () => void;
  isFinished: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading, isActive, onRestart, isFinished }) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when loading completes and it's the user's turn
  useEffect(() => {
    if (!isLoading && isActive && !isFinished && inputRef.current) {
        // Small timeout ensures the DOM is ready if state switched from disabled
        setTimeout(() => {
            inputRef.current?.focus();
        }, 50);
    }
  }, [isLoading, isActive, isFinished]);

  // Focus on mount if active
  useEffect(() => {
      if (isActive && !isFinished && inputRef.current) {
          inputRef.current.focus();
      }
  }, [isActive, isFinished]);

  const handleSend = () => {
    if (text.trim() && !isLoading) {
      onSendMessage(text);
      setText('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (isFinished) {
      return (
          <div className="p-4 border-t border-stone-200 bg-white flex justify-center">
              <button 
                onClick={onRestart}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md">
                <RefreshCw size={20} />
                Start New Session
              </button>
          </div>
      )
  }

  if (!isActive) {
      return (
        <div className="p-4 border-t border-stone-200 bg-white flex justify-center">
            <button 
                onClick={onRestart}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 shadow-lg flex items-center gap-2">
                Start Practice
            </button>
        </div>
      );
  }

  return (
    <div className="p-4 border-t border-stone-200 bg-white">
      <div className="relative flex items-center max-w-4xl mx-auto">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer here..."
          disabled={isLoading}
          className="w-full bg-stone-50 border border-stone-300 text-stone-900 rounded-full py-3 pl-6 pr-12 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all disabled:opacity-60"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          className="absolute right-2 p-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
             <Send size={18} />
          )}
        </button>
      </div>
      <p className="text-center text-xs text-stone-400 mt-2">
        Type "finish" to see your score.
      </p>
    </div>
  );
};

export default InputArea;