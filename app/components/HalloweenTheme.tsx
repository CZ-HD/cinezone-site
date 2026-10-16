"use client";

import { useEffect } from "react";
import "./HalloweenTheme.css";

export default function HalloweenTheme() {
  useEffect(() => {
    const updateDecoration = () => {
      const active = document.body.classList.contains(
        "cz-halloween-active"
      );

      const existing = document.querySelector(
        ".cz-halloween-decoration"
      );

      if (!active) {
        existing?.remove();
        return;
      }

      if (existing) return;

      const decoration = document.createElement("div");
      decoration.className = "cz-halloween-decoration";
      decoration.setAttribute("aria-hidden", "true");

      decoration.innerHTML = `
        <span class="cz-halloween-pumpkin">🎃</span>
        <span class="cz-halloween-bat cz-bat-one">🦇</span>
        <span class="cz-halloween-bat cz-bat-two">🦇</span>
        <span class="cz-halloween-bat cz-bat-three">🦇</span>
        <span class="cz-halloween-web cz-web-top-left">🕸️</span>
        <span class="cz-halloween-web cz-web-top-right">🕸️</span>
        <span class="cz-halloween-web cz-web-bottom-left">🕸️</span>
        <span class="cz-halloween-ghost">👻</span>
      `;

      document.body.appendChild(decoration);
    };

    updateDecoration();

    const observer = new MutationObserver(updateDecoration);

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      document.querySelector(".cz-halloween-decoration")?.remove();
    };
  }, []);

  return null;
}
