import React from 'react';
import { SessionState } from '../types';
import { Coffee, ShoppingBasket, TrendingUp, AlertCircle } from 'lucide-react';

interface StatsPanelProps {
  session: SessionState;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ session }) => {
  const getSceneIcon = () => {
    return session.currentScene === 'cafe' ? (
      <Coffee className="w-5 h-5 text-amber-600" />
    ) : (
      <ShoppingBasket className="w-5 h-5 text-green-600" />
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 h-full flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
        <div className="p-2 bg-stone-100 rounded-lg">
           {getSceneIcon()}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Current Scene</h2>
          <p className="text-lg font-bold text-stone-800 capitalize">{session.currentScene}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500"/>
            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Score</h3>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
           <span className="text-2xl font-bold text-blue-700">{session.score}</span>
           <span className="text-sm text-blue-400 ml-1">points</span>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-500"/>
            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Mistakes</h3>
        </div>
        
        <div className="bg-orange-50 rounded-lg border border-orange-100 p-3">
          <div className="flex justify-between items-center mb-2">
             <span className="text-sm text-stone-600 font-medium">Total Errors</span>
             <span className="text-lg font-bold text-orange-700">{session.totalErrors}</span>
          </div>
          
          <div className="space-y-2 mt-3">
            {Object.entries(session.mistakes).map(([type, count]) => {
                if (count === 0 || type === 'none') return null;
                return (
                    <div key={type} className="flex justify-between text-xs items-center">
                        <span className="text-stone-500 capitalize">{type.replace('_', ' ')}</span>
                        <span className="bg-white px-2 py-0.5 rounded text-stone-700 font-bold border border-orange-100">{count}</span>
                    </div>
                )
            })}
             {session.totalErrors === 0 && (
                <div className="text-center text-xs text-stone-400 py-2">No mistakes yet! Keep it up.</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
