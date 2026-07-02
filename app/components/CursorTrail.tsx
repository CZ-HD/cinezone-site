"use client";

import { useEffect } from "react";

export default function CursorTrail() {
  useEffect(() => {
    if (window.innerWidth < 768) return;

    const particles: HTMLDivElement[] = [];

    const createParticle = (x: number, y: number) => {
      const p = document.createElement("div");

      p.style.position = "fixed";
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.width = "8px";
      p.style.height = "8px";
      p.style.borderRadius = "50%";
      p.style.pointerEvents = "none";
      p.style.background = "#00c6ff";
      p.style.boxShadow =
        "0 0 10px #00c6ff, 0 0 20px #00c6ff";
      p.style.zIndex = "99999";
      p.style.transition =
        "transform .8s ease-out, opacity .8s ease-out";

      document.body.appendChild(p);

      requestAnimationFrame(() => {
        p.style.transform = "scale(0)";
        p.style.opacity = "0";
      });

      setTimeout(() => {
        p.remove();
      }, 800);
    };

    const move = (e: MouseEvent) => {
      createParticle(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("mousemove", move);
      particles.forEach((p) => p.remove());
    };
  }, []);

  return null;
}
