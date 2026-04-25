import { useState } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';

interface RatingSystemProps {
  onRate: (rating: number) => void;
  currentRating?: number;
}

export function RatingSystem({ onRate, currentRating = 0 }: RatingSystemProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Rate Analysis:</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <motion.button
            key={rating}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setHoveredRating(rating)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => onRate(rating)}
            className="focus:outline-none"
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                rating <= (hoveredRating || currentRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-600'
              }`}
            />
          </motion.button>
        ))}
      </div>
      {currentRating > 0 && (
        <span className="text-xs text-gray-400 ml-1">({currentRating}/5)</span>
      )}
    </div>
  );
}
