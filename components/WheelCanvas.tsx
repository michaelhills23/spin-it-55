import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Segment } from '../types';

interface WheelCanvasProps {
  segments: Segment[];
  onSpinEnd?: (winner: Segment) => void;
  width?: number;
  height?: number;
}

export interface WheelHandle {
  spin: () => void;
  reset: () => void;
  isSpinning: boolean;
}

const WheelCanvas = forwardRef<WheelHandle, WheelCanvasProps>(({ segments, onSpinEnd, width = 500, height = 500 }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0); // Current rotation angle in radians
  const [isSpinning, setIsSpinning] = useState(false);
  const animationRef = useRef<number>(0);
  
  // Physics state
  const velocity = useRef(0);
  const friction = 0.985;
  const minSpeed = 0.002;

  useImperativeHandle(ref, () => ({
    spin: () => {
      if (isSpinning) return;
      // Initial impulse
      velocity.current = 0.5 + Math.random() * 0.5; // Random start speed
      setIsSpinning(true);
    },
    reset: () => {
      setRotation(0);
      setIsSpinning(false);
      velocity.current = 0;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      drawWheel(0);
    },
    isSpinning
  }));

  const drawWheel = (currentRotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, width, height);

    const totalWeight = segments.reduce((acc, seg) => acc + seg.weight, 0);
    let currentAngle = currentRotation;

    // Draw Segments
    segments.forEach((segment) => {
      const sliceAngle = (segment.weight / totalWeight) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      
      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(currentAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(segment.label, radius - 20, 5);
      ctx.restore();

      currentAngle += sliceAngle;
    });

    // Draw Center Circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#333';
    ctx.stroke();
    
    // Draw Center Dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();

    // Draw Outer Rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#333';
    ctx.stroke();

    // Draw Pointer (Fixed at 0 degrees / 3 o'clock)
    // Actually, let's fix pointer at top (3*PI/2 or 270deg) for better visual
    // But our math assumes 0 is start. 
    // Let's draw pointer at the RIGHT (0 radians) for simplicity in math, 
    // then visually we rotate the whole canvas context or just calculate relative to it.
    // Let's draw the pointer at the Right (3 o'clock)
    
    ctx.beginPath();
    ctx.moveTo(centerX + radius + 10, centerY - 15);
    ctx.lineTo(centerX + radius - 15, centerY);
    ctx.lineTo(centerX + radius + 10, centerY + 15);
    ctx.closePath();
    ctx.fillStyle = '#e11d48'; // Red-600
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const determineWinner = (finalRotation: number) => {
    // Normalize rotation to 0-2PI
    // The pointer is at 0 (Right).
    // The wheel rotates CLOCKWISE.
    // So the segment under the pointer is determined by:
    // (2PI - (rotation % 2PI)) % 2PI
    
    const totalWeight = segments.reduce((acc, seg) => acc + seg.weight, 0);
    const normalizedRotation = finalRotation % (2 * Math.PI);
    const pointerAngle = (2 * Math.PI - normalizedRotation) % (2 * Math.PI);

    let currentAngle = 0;
    let winner: Segment | null = null;

    for (const segment of segments) {
      const sliceAngle = (segment.weight / totalWeight) * 2 * Math.PI;
      if (pointerAngle >= currentAngle && pointerAngle < currentAngle + sliceAngle) {
        winner = segment;
        break;
      }
      currentAngle += sliceAngle;
    }

    if (winner && onSpinEnd) {
      onSpinEnd(winner);
    }
  };

  const animate = () => {
    if (!velocity.current) return;

    velocity.current *= friction; // Decelerate
    
    setRotation(prev => {
        const newRot = prev + velocity.current;
        drawWheel(newRot);
        
        if (velocity.current < minSpeed) {
            velocity.current = 0;
            setIsSpinning(false);
            determineWinner(newRot);
            return newRot; // Stop updating state but keep final value
        }
        
        animationRef.current = requestAnimationFrame(animate);
        return newRot;
    });
  };

  useEffect(() => {
    if (isSpinning) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isSpinning]);

  // Initial Draw
  useEffect(() => {
    drawWheel(rotation);
  }, [segments, width, height]);

  return (
    <div className="relative flex justify-center items-center">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="max-w-full h-auto drop-shadow-2xl"
      />
    </div>
  );
});

WheelCanvas.displayName = 'WheelCanvas';
export default WheelCanvas;