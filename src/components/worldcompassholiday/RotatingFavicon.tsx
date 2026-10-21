"use client";

import { useEffect } from "react";

const SPIN_MS = 28000;
const SIZE = 64;

function fillPoly(
  ctx: CanvasRenderingContext2D,
  points: Array<[number, number]>,
  fill: string,
  scale: number,
) {
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    const px = x * scale;
    const py = y * scale;
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawCompass(ctx: CanvasRenderingContext2D, angle: number) {
  const scale = SIZE / 32;
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.save();
  ctx.translate(SIZE / 2, SIZE / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.translate(-SIZE / 2, -SIZE / 2);

  ctx.beginPath();
  ctx.arc(16 * scale, 16 * scale, 14 * scale, 0, Math.PI * 2);
  ctx.fillStyle = "#051036";
  ctx.fill();
  ctx.lineWidth = 1.2 * scale;
  ctx.strokeStyle = "#e7c98a";
  ctx.stroke();

  fillPoly(ctx, [[16, 4], [18.2, 16], [16, 14.2], [13.8, 16]], "#e7c98a", scale);
  fillPoly(ctx, [[16, 28], [18.2, 16], [16, 17.8], [13.8, 16]], "#8ea0c8", scale);

  ctx.beginPath();
  ctx.arc(16 * scale, 16 * scale, 2 * scale, 0, Math.PI * 2);
  ctx.fillStyle = "#f7f1e6";
  ctx.fill();
  ctx.restore();
}

export function RotatingFavicon() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let owned: HTMLLinkElement | null = null;
    const started = performance.now();
    let timer = 0;

    const paint = () => {
      const angle = (((performance.now() - started) % SPIN_MS) / SPIN_MS) * 360;
      drawCompass(ctx, angle);
      const href = canvas.toDataURL("image/png");
      const links = document.querySelectorAll<HTMLLinkElement>("link[rel='icon'], link[rel='shortcut icon']");
      if (links.length === 0) {
        owned ??= document.createElement("link");
        owned.rel = "icon";
        owned.type = "image/png";
        owned.sizes = "64x64";
        if (!owned.isConnected) document.head.appendChild(owned);
        owned.href = href;
        return;
      }
      links.forEach((node) => {
        if (node.type !== "image/png") node.type = "image/png";
        if (node.href !== href) node.href = href;
      });
    };

    const start = () => {
      window.clearInterval(timer);
      paint();
      timer = window.setInterval(paint, 120);
    };

    const stop = () => window.clearInterval(timer);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      owned?.remove();
    };
  }, []);

  return null;
}
