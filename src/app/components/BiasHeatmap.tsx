import { motion } from 'motion/react';

interface BiasHeatmapProps {
  score: number;
}

export function BiasHeatmap({ score }: BiasHeatmapProps) {
  const purityScore = 100 - score;

  const getColor = () => {
    if (purityScore > 70) return 'from-green-500 to-emerald-400';
    if (purityScore > 40) return 'from-yellow-500 to-orange-400';
    return 'from-red-500 to-rose-400';
  };

  const getPurityLabel = () => {
    if (purityScore > 70) return 'High Purity';
    if (purityScore > 40) return 'Moderate Purity';
    return 'Low Purity';
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Truth Purity Gauge</h3>

      <div className="relative h-40 bg-gradient-to-b from-green-500/20 via-yellow-500/20 to-red-500/20 rounded-lg overflow-hidden">
        <motion.div
          initial={{ height: '100%' }}
          animate={{ height: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 bg-gray-950/80"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`absolute left-0 right-0 h-1.5 bg-gradient-to-r ${getColor()} shadow-lg`}
          style={{ bottom: `${score}%` }}
        >
          <div className="absolute -right-1.5 -top-1 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-gray-950" />
        </motion.div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              className="text-4xl font-bold text-white drop-shadow-lg"
            >
              {purityScore}%
            </motion.div>
            <div className="text-xs text-gray-300 mt-1">{getPurityLabel()}</div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500 tracking-wide">BIAS: {score}/100</p>
      </div>
    </div>
  );
}
