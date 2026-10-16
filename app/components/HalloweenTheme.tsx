
"use client";

import { useEffect } from "react";
import "./HalloweenTheme.css";

export default function HalloweenTheme() {
  useEffect(() => {
    let decoration: HTMLDivElement | null = null;
    let observer: MutationObserver | null = null;

    function updateDecoration() {
      const enabled = document.body.classList.contains(
        "cz-halloween-active"
      );

      if (enabled && !decoration) {
        decoration = document.createElement("div");
        decoration.className = "cz-halloween-decoration";
        decoration.setAttribute("aria-hidden", "true");

        decoration.innerHTML = `
          <span class="cz-halloween-pumpkin">🎃</span>
          <span class="cz-halloween-bat cz-bat-one">🦇</span>
          <span class="cz-halloween-bat cz-bat-two">🦇</span>
          <span class="cz-halloween-web">🕸️</span>
        `;

        document.body.appendChild(decoration);
      } else if (!enabled && decoration) {
        decoration.remove();
        decoration = null;
      }
    }

    updateDecoration();

    observer = new MutationObserver(updateDecoration);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer?.disconnect();
      decoration?.remove();
    };
  }, []);

  return null;
}
