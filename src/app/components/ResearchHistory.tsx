import { motion } from 'motion/react';
import { Clock, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';

interface HistoryItem {
  id: string;
  query: string;
  timestamp: string;
  bias_score: number;
}

interface ResearchHistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export function ResearchHistory({ history, onSelect }: ResearchHistoryProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getBiasStatus = (score: number) => {
    if (score < 30) return { label: 'Unbiased', icon: CheckCircle, color: 'text-green-400' };
    if (score < 60) return { label: 'Moderate', icon: AlertTriangle, color: 'text-yellow-400' };
    return { label: 'Biased', icon: AlertTriangle, color: 'text-red-400' };
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-300">Research History</h3>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No analysis history yet</p>
        ) : (
          history.map((item, i) => {
            const biasStatus = getBiasStatus(item.bias_score);
            const BiasIcon = biasStatus.icon;

            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelect(item)}
                className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
              >
                <div className="flex items-start gap-2">
                  <BiasIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${biasStatus.color}`} />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 font-medium mb-1 line-clamp-2">{item.query}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{formatTime(item.timestamp)}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        item.bias_score < 30
                          ? 'bg-green-500/20 text-green-400'
                          : item.bias_score < 60
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {biasStatus.label}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors flex-shrink-0 mt-1" />
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}
