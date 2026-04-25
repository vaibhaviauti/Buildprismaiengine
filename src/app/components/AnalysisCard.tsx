import { motion } from 'motion/react';
import { ThumbsUp, ThumbsDown, Scale } from 'lucide-react';

interface AnalysisCardProps {
  title: string;
  content: string;
  type: 'thesis' | 'antithesis' | 'synthesis';
  delay?: number;
}

export function AnalysisCard({ title, content, type, delay = 0 }: AnalysisCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'thesis':
        return <ThumbsUp className="w-5 h-5 text-green-400" />;
      case 'antithesis':
        return <ThumbsDown className="w-5 h-5 text-red-400" />;
      case 'synthesis':
        return <Scale className="w-5 h-5 text-purple-400" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'thesis':
        return 'border-green-500/30';
      case 'antithesis':
        return 'border-red-500/30';
      case 'synthesis':
        return 'border-purple-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`backdrop-blur-xl bg-white/5 border ${getBorderColor()} rounded-xl p-6`}
    >
      <div className="flex items-center gap-3 mb-4">
        {getIcon()}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.5 }}
        className="text-sm text-gray-300 leading-relaxed"
      >
        {content}
      </motion.p>
    </motion.div>
  );
}
