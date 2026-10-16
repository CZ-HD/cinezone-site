
"use client";

import { useEffect } from "react";

export default function HalloweenTheme() {
  useEffect(() => {
    const active = document.body.classList.contains("cz-halloween-active");

    if (!active) return;

    const decoration = document.createElement("div");
    decoration.className = "cz-halloween-decoration";
    decoration.setAttribute("aria-hidden", "true");
    decoration.innerHTML = `
      <span class="cz-halloween-pumpkin">🎃</span>
      <span class="cz-halloween-bat cz-bat-one">🦇</span>
      <span class="cz-halloween-bat cz-bat-two">🦇</span>
      <span class="cz-halloween-web">✳</span>
    `;

    document.body.appendChild(decoration);

    return () => decoration.remove();
  }, []);

  return null;
}
