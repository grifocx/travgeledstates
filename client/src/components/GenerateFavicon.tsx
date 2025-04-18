import React, { useEffect, useRef } from 'react';

export function GenerateFavicon() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background color
    ctx.fillStyle = '#f8fafc'; // Light background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw map outline
    ctx.beginPath();
    
    // Simplified USA mainland shape
    ctx.moveTo(20, 12);  // Start at top left
    ctx.lineTo(12, 17);
    ctx.lineTo(9, 23);
    ctx.lineTo(5, 33);
    ctx.lineTo(9, 38);
    ctx.lineTo(15, 42);
    ctx.lineTo(20, 44);
    ctx.lineTo(28, 45);
    ctx.lineTo(34, 42);
    ctx.lineTo(39, 39);
    ctx.lineTo(44, 38);
    ctx.lineTo(47, 36);
    ctx.lineTo(52, 30);
    ctx.lineTo(58, 28);
    ctx.lineTo(65, 28);
    ctx.lineTo(70, 30);
    ctx.lineTo(73, 32);
    ctx.lineTo(78, 34);
    ctx.lineTo(83, 32);
    ctx.lineTo(89, 28);
    ctx.lineTo(93, 22);
    ctx.lineTo(95, 15);
    ctx.lineTo(93, 10);
    ctx.lineTo(88, 7);
    ctx.lineTo(83, 5);
    ctx.lineTo(78, 6);
    ctx.lineTo(72, 8);
    ctx.lineTo(66, 9);
    ctx.lineTo(60, 8);
    ctx.lineTo(55, 9);
    ctx.lineTo(50, 13);
    ctx.lineTo(45, 14);
    ctx.lineTo(39, 12);
    ctx.lineTo(34, 9);
    ctx.lineTo(30, 9);
    ctx.lineTo(25, 10);
    ctx.lineTo(20, 12);
    
    // Fill and stroke
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; // Light blue fill
    ctx.fill();
    ctx.strokeStyle = '#3b82f6'; // Blue outline
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw Alaska
    ctx.beginPath();
    ctx.moveTo(15, 49);
    ctx.lineTo(8, 52);
    ctx.lineTo(4, 54);
    ctx.lineTo(7, 56);
    ctx.lineTo(12, 54);
    ctx.lineTo(16, 52);
    ctx.lineTo(15, 49);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw Hawaii
    ctx.beginPath();
    ctx.moveTo(20, 54);
    ctx.lineTo(23, 55);
    ctx.lineTo(25, 53);
    ctx.lineTo(22, 51);
    ctx.lineTo(20, 54);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw some dots for visited states
    ctx.fillStyle = '#3b82f6';
    [
      [35, 20],
      [55, 15],
      [75, 25],
      [45, 30],
      [25, 30]
    ].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Create favicon link
    const link = document.querySelector('link[rel="icon"]') || document.createElement('link');
    (link as HTMLLinkElement).type = 'image/x-icon';
    (link as HTMLLinkElement).rel = 'icon';
    (link as HTMLLinkElement).href = canvas.toDataURL('image/png');
    
    // Add to head if not already there
    if (!document.querySelector('link[rel="icon"]')) {
      document.head.appendChild(link);
    }
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      width={100} 
      height={100} 
      style={{ display: 'none' }} 
    />
  );
}

export default GenerateFavicon;