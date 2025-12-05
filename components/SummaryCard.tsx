import React from 'react';
import { MistakeType } from '../types';
import { Trophy, AlertTriangle, CheckCircle } from 'lucide-react';

interface SummaryCardProps {
  score: number;
  totalErrors: number;
  mistakes: Record<MistakeType, number>;
  totalTurns: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ score, totalErrors, mistakes, totalTurns }) => {
  return (
    <div className="mx-auto w-full max-w-lg mb-8 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-amber-600 p-6 text-center text-white">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
            <Trophy size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold">Oturum Tamamlandı!</h2>
          <p className="text-amber-100 text-sm">Harika bir pratikti.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-px bg-stone-100 border-b border-stone-200">
          <div className="bg-white p-4 text-center">
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Toplam Puan</p>
            <p className="text-3xl font-bold text-amber-600">{score}</p>
          </div>
          <div className="bg-white p-4 text-center">
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Toplam Hata</p>
            <p className="text-3xl font-bold text-red-500">{totalErrors}</p>
          </div>
        </div>

        {/* Mistakes Breakdown */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" />
            Hata Analizi
          </h3>
          
          <div className="space-y-3">
            {Object.entries(mistakes).filter(([_, count]) => (count as number) > 0).length === 0 ? (
              <div className="text-center py-4 bg-green-50 rounded-lg border border-green-100">
                <CheckCircle className="mx-auto text-green-500 mb-1" size={24} />
                <p className="text-green-700 font-medium">Hiç hata yapmadın! Mükemmel.</p>
              </div>
            ) : (
              Object.entries(mistakes).map(([type, count]) => {
                if (count === 0 || type === 'none') return null;
                return (
                  <div key={type} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-100">
                    <span className="text-stone-600 capitalize text-sm font-medium">
                      {type.replace('_', ' ')}
                    </span>
                    <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-bold">
                      {count} hata
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 p-4 text-center border-t border-stone-100 text-xs text-stone-400">
            Toplam {totalTurns} tur konuşuldu.
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
