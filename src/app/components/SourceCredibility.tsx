import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface Source {
  name: string;
  score: number;
  status: 'verified' | 'partial' | 'unverified';
}

const mockSources: Source[] = [
  { name: 'Empirical Data', score: 92, status: 'verified' },
  { name: 'Peer Review', score: 78, status: 'partial' },
  { name: 'Meta-Analysis', score: 85, status: 'verified' },
  { name: 'Expert Testimony', score: 64, status: 'partial' },
];

export function SourceCredibility() {
  const getIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Source Credibility</h3>

      <div className="space-y-3">
        {mockSources.map((source, i) => (
          <motion.div
            key={source.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getIcon(source.status)}
                <span className="text-xs text-gray-300">{source.name}</span>
              </div>
              <span className="text-xs font-semibold text-white">{source.score}</span>
            </div>

            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${source.score}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className={`h-full ${
                  source.score > 80
                    ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                    : source.score > 60
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
                    : 'bg-gradient-to-r from-red-500 to-rose-400'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
