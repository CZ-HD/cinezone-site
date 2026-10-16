"use client";

import { useEffect } from "react";
import "./HalloweenTheme.css";

const DECORATION_MARKUP = `
  <div class="cz-halloween-edge-glow cz-edge-left"></div>
  <div class="cz-halloween-edge-glow cz-edge-right"></div>

  <svg class="cz-halloween-tree cz-tree-left" viewBox="0 0 180 900" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 900 L0 590 L26 540 L9 484 L40 513 L25 445 L57 492 L63 420 L78 478 L98 434 L91 500 L127 464 L111 526 L153 500 L127 555 L180 548 L139 582 L180 612 L126 606 L150 652 L111 629 L101 704 L82 660 L62 738 L54 668 L24 710 L38 640 L0 665 Z" fill="#08070d"/>
    <path d="M18 900 Q52 750 65 600 Q76 485 104 390 M63 650 L25 590 M73 560 L120 510 M91 460 L64 425" fill="none" stroke="#17111e" stroke-width="10" stroke-linecap="round"/>
  </svg>
  <svg class="cz-halloween-tree cz-tree-right" viewBox="0 0 220 900" preserveAspectRatio="none" aria-hidden="true">
    <path d="M220 900 L220 600 L190 554 L211 500 L176 527 L185 452 L151 494 L142 412 L125 478 L101 430 L109 500 L72 462 L89 524 L45 496 L72 557 L0 544 L47 585 L0 615 L57 605 L34 652 L78 628 L91 710 L111 657 L135 746 L147 665 L180 715 L166 641 L220 670 Z" fill="#08070d"/>
    <path d="M203 900 Q164 755 151 603 Q138 480 111 382 M151 650 L192 588 M139 555 L90 506 M119 455 L147 418" fill="none" stroke="#17111e" stroke-width="11" stroke-linecap="round"/>
  </svg>

  <svg class="cz-halloween-web cz-web-top-left" viewBox="0 0 160 160" aria-hidden="true">
    <g fill="none" stroke="#c8b8d9" stroke-opacity=".7" stroke-width="1.5">
      <path d="M0 0 L160 160 M0 0 L120 160 M0 0 L80 160 M0 0 L40 160 M0 0 L160 120 M0 0 L160 80 M0 0 L160 40"/>
      <path d="M20 0 Q20 20 0 20 M48 0 Q48 48 0 48 M78 0 Q78 78 0 78 M108 0 Q108 108 0 108 M138 0 Q138 138 0 138"/>
    </g>
  </svg>
  <svg class="cz-halloween-web cz-web-top-right" viewBox="0 0 160 160" aria-hidden="true">
    <g fill="none" stroke="#c8b8d9" stroke-opacity=".7" stroke-width="1.5">
      <path d="M160 0 L0 160 M160 0 L40 160 M160 0 L80 160 M160 0 L120 160 M160 0 L0 120 M160 0 L0 80 M160 0 L0 40"/>
      <path d="M140 0 Q140 20 160 20 M112 0 Q112 48 160 48 M82 0 Q82 78 160 78 M52 0 Q52 108 160 108 M22 0 Q22 138 160 138"/>
    </g>
  </svg>

  <div class="cz-halloween-mist cz-mist-back"></div>
  <div class="cz-halloween-mist cz-mist-front"></div>

  <div class="cz-halloween-pumpkin cz-pumpkin-left" aria-hidden="true">
    <svg viewBox="0 0 120 100">
      <ellipse cx="60" cy="56" rx="42" ry="34" fill="#e86a16"/>
      <ellipse cx="43" cy="56" rx="24" ry="32" fill="#ff8a22"/>
      <ellipse cx="77" cy="56" rx="24" ry="32" fill="#d9530d"/>
      <path d="M57 23 Q55 10 68 7 Q73 18 64 27" fill="#42652c" stroke="#263d1b" stroke-width="3"/>
      <path d="M37 48 L49 54 L40 61 Z M82 48 L70 54 L79 61 Z" fill="#20101a"/>
      <path d="M42 68 Q60 85 78 68 L74 77 L67 74 L61 80 L55 74 L48 77 Z" fill="#20101a"/>
    </svg>
    <span class="cz-pumpkin-halo"></span>
  </div>
  <div class="cz-halloween-pumpkin cz-pumpkin-right" aria-hidden="true">
    <svg viewBox="0 0 120 100">
      <ellipse cx="60" cy="56" rx="42" ry="34" fill="#e86a16"/>
      <ellipse cx="43" cy="56" rx="24" ry="32" fill="#ff8a22"/>
      <ellipse cx="77" cy="56" rx="24" ry="32" fill="#d9530d"/>
      <path d="M57 23 Q55 10 68 7 Q73 18 64 27" fill="#42652c" stroke="#263d1b" stroke-width="3"/>
      <path d="M37 48 L49 54 L40 61 Z M82 48 L70 54 L79 61 Z" fill="#20101a"/>
      <path d="M42 68 Q60 85 78 68 L74 77 L67 74 L61 80 L55 74 L48 77 Z" fill="#20101a"/>
    </svg>
    <span class="cz-pumpkin-halo"></span>
  </div>

  <svg class="cz-halloween-bat cz-bat-one" viewBox="0 0 100 42" aria-hidden="true">
    <path d="M50 20 C38 7 22 4 4 2 L12 16 L2 13 C15 35 31 37 46 27 L50 34 L54 27 C69 37 85 35 98 13 L88 16 L96 2 C78 4 62 7 50 20Z" fill="#0b0711" stroke="#8e7aa8" stroke-width="1.5"/>
  </svg>
  <svg class="cz-halloween-bat cz-bat-two" viewBox="0 0 100 42" aria-hidden="true">
    <path d="M50 20 C38 7 22 4 4 2 L12 16 L2 13 C15 35 31 37 46 27 L50 34 L54 27 C69 37 85 35 98 13 L88 16 L96 2 C78 4 62 7 50 20Z" fill="#0b0711" stroke="#8e7aa8" stroke-width="1.5"/>
  </svg>
  <svg class="cz-halloween-bat cz-bat-three" viewBox="0 0 100 42" aria-hidden="true">
    <path d="M50 20 C38 7 22 4 4 2 L12 16 L2 13 C15 35 31 37 46 27 L50 34 L54 27 C69 37 85 35 98 13 L88 16 L96 2 C78 4 62 7 50 20Z" fill="#0b0711" stroke="#8e7aa8" stroke-width="1.5"/>
  </svg>

  <div class="cz-halloween-lantern cz-lantern-left" aria-hidden="true"><span></span></div>
  <div class="cz-halloween-lantern cz-lantern-right" aria-hidden="true"><span></span></div>
`;

export default function HalloweenTheme() {
  useEffect(() => {
    const updateDecoration = () => {
      const active = document.body.classList.contains("cz-halloween-active");
      const existing = document.querySelector(".cz-halloween-decoration");

      if (!active) {
        existing?.remove();
        return;
      }

      if (existing) return;

      const decoration = document.createElement("div");
      decoration.className = "cz-halloween-decoration";
      decoration.setAttribute("aria-hidden", "true");
      decoration.innerHTML = DECORATION_MARKUP;
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
