"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type PointerEvent,
} from "react";

export type SignaturePadHandle = {
  isEmpty: () => boolean;
  clear: () => void;
  toBlob: () => Promise<Blob | null>;
};

export const SignaturePad = forwardRef<SignaturePadHandle>(
  function SignaturePad(_props, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawing = useRef(false);
    const empty = useRef(true);

    const paintSetup = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0f172a";
      empty.current = true;
    };

    useEffect(() => {
      paintSetup();
      window.addEventListener("resize", paintSetup);
      return () => window.removeEventListener("resize", paintSetup);
    }, []);

    useImperativeHandle(ref, () => ({
      isEmpty: () => empty.current,
      clear: () => {
        paintSetup();
      },
      toBlob: () =>
        new Promise((resolve) => {
          const canvas = canvasRef.current;
          if (!canvas || empty.current) {
            resolve(null);
            return;
          }
          canvas.toBlob((blob) => resolve(blob), "image/png");
        }),
    }));

    const point = (event: PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      canvas.setPointerCapture(event.pointerId);
      drawing.current = true;
      const { x, y } = point(event);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
      if (!drawing.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;
      const { x, y } = point(event);
      ctx.lineTo(x, y);
      ctx.stroke();
      empty.current = false;
    };

    const endStroke = () => {
      drawing.current = false;
    };

    return (
      <canvas
        ref={canvasRef}
        className="h-44 w-full touch-none rounded-xl bg-white"
        aria-label="Signature pad"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endStroke}
        onPointerLeave={endStroke}
      />
    );
  },
);
