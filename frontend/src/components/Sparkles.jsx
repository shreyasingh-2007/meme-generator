import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Sparkles = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Throttle sparkle creation
      if (Math.random() > 0.85) {
        const newSparkle = {
          id: Date.now() + Math.random(),
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 10 + 5,
          color: `hsl(${Math.random() * 60 + 260}, 100%, 75%)` // Purple to Pink hues
        };
        
        setSparkles(current => [...current, newSparkle]);
        
        // Remove sparkle after animation
        setTimeout(() => {
          setSparkles(current => current.filter(s => s.id !== newSparkle.id));
        }, 800);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            initial={{ 
              opacity: 1, 
              scale: 0, 
              x: sparkle.x, 
              y: sparkle.y,
              rotate: 0 
            }}
            animate={{ 
              opacity: 0, 
              scale: Math.random() * 1.5 + 0.5,
              y: sparkle.y + (Math.random() * 40 - 20),
              x: sparkle.x + (Math.random() * 40 - 20),
              rotate: Math.random() * 180
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: 'absolute',
              width: sparkle.size,
              height: sparkle.size,
              backgroundColor: sparkle.color,
              borderRadius: '50%',
              boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.color}`,
              filter: 'blur(1px)' // Star-like blur effect
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Sparkles;
