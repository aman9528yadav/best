
"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfettiPiece = ({ id, x, y, rotation, color }: { id: number; x: number; y: number; rotation: number; color: string }) => {
  return (
    <motion.div
      key={id}
      initial={{ x, y, rotate: rotation, opacity: 1 }}
      animate={{ y: '100vh', opacity: 0 }}
      transition={{ duration: Math.random() * 2 + 3, ease: 'linear' }}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '10px',
        height: '10px',
        backgroundColor: color,
        transform: `translateX(${x}px) translateY(${y}px) rotate(${rotation}deg)`,
      }}
      className="rounded-sm"
    />
  );
};

export function Confetti() {
  const [pieces, setPieces] = useState<any[]>([]);

  useEffect(() => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    const newPieces = Array.from({ length: 150 }).map((_, index) => ({
      id: index,
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {pieces.map((piece) => (
          <ConfettiPiece key={piece.id} {...piece} />
        ))}
      </AnimatePresence>
    </div>
  );
}
