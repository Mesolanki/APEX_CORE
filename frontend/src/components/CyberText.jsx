import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}|:<>?';

/**
 * CyberText Component
 * Animates text by scrambling characters before revealing the target string.
 * High-fidelity "Decryption" effect for Cyberpunk/Stealth aesthetics.
 */
const CyberText = ({ 
  text, 
  delay = 0, 
  duration = 1.0, 
  className = '', 
  animateOnlyOnce = true,
  trigger = true 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const scramble = useCallback(() => {
    if (isAnimating || (animateOnlyOnce && hasAnimated)) return;
    
    setIsAnimating(true);
    let iteration = 0;
    const maxIterations = 15; // Number of flickers per character
    const intervalTime = (duration * 1000) / (text.length * 2);

    const interval = setInterval(() => {
      setDisplayText(prev => 
        text.split('').map((char, index) => {
          if (index < iteration) {
            return text[index];
          }
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        setIsAnimating(false);
        setHasAnimated(true);
      }

      iteration += 1 / (maxIterations / (text.length / 5 + 1));
    }, 30);

    return () => clearInterval(interval);
  }, [text, duration, animateOnlyOnce, hasAnimated, isAnimating]);

  useEffect(() => {
    if (trigger) {
      const timer = setTimeout(scramble, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [trigger, scramble, delay]);

  return (
    <motion.span 
      className={`inline-block font-mono ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: delay }}
    >
      {displayText || (trigger ? '' : text)}
    </motion.span>
  );
};

export default CyberText;
