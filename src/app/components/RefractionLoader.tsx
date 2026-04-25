import { motion } from 'motion/react';

export function RefractionLoader() {
  return (
    <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative">
        <motion.div
          className="w-32 h-32 relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-16 origin-bottom"
              style={{
                left: '50%',
                bottom: '50%',
                transform: `rotate(${angle}deg)`,
              }}
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 1, 0.3],
                background: [
                  'linear-gradient(to top, #8b5cf6, #ec4899)',
                  'linear-gradient(to top, #ec4899, #06b6d4)',
                  'linear-gradient(to top, #06b6d4, #8b5cf6)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
        <motion.p
          className="text-gray-400 text-sm mt-8 text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Synthesizing Analysis...
        </motion.p>
      </div>
    </div>
  );
}
