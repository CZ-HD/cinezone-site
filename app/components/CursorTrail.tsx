"use client";

import { useEffect, useRef } from "react";

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (window.innerWidth < 768) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resize);

    const particles: any[] = [];

    window.addEventListener("mousemove", (e) => {
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1,
          size: 2 + Math.random() * 4,
        });
      }
    });

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        p.life -= 0.02;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        ctx.fillStyle = `rgba(0,198,255,${p.life})`;

        ctx.shadowColor = "#00c6ff";
        ctx.shadowBlur = 20;

        ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 99999,
      }}
    />
  );
}
