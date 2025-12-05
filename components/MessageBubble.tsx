import React from 'react';
import { ChatMessage } from '../types';
import { User } from 'lucide-react';

// BURAYA KENDİ FOTOĞRAFININ LİNKİNİ YAPIŞTIR
const TEACHER_IMAGE_URL = "https://img.freepik.com/free-photo/portrait-smiling-young-man-eyewear_171337-4842.jpg?w=200&h=200&fit=crop";

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex w-full mb-6 ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border border-stone-200
            ${isModel ? 'bg-amber-100' : 'bg-stone-200 text-stone-600'}`}>
          {isModel ? (
            <img 
                src={TEACHER_IMAGE_URL} 
                alt="Teacher" 
                className="w-full h-full object-cover"
            />
          ) : (
            <User size={20} />
          )}
        </div>

        {/* Bubble */}
        <div className={`p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm
            ${isModel 
              ? 'bg-white border border-stone-200 text-stone-800 rounded-tl-none' 
              : 'bg-stone-800 text-stone-50 rounded-tr-none'
            } ${message.isError ? 'border-red-300 bg-red-50' : ''}`}>
          {message.text ? (
             message.text.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                    {line}
                    {i < message.text.split('\n').length - 1 && <br />}
                </React.Fragment>
             ))
          ) : (
             <span className="italic text-stone-400">...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;