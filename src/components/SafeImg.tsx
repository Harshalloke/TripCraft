"use client";
import React from "react";

type SafeImgProps = {
  /** Full image URL to try first (usually /api/place-photo?... for item) */
  src: string;
  /** Query used for fallback, e.g. the destination/city name */
  fallbackQuery?: string;
  /** Render sizes for the proxy and layout */
  w: number;
  h: number;
  alt?: string;
  className?: string;
  /** Extra overlay content (optional) */
  children?: React.ReactNode;
};

function photoUrl(q: string, w: number, h: number) {
  return `/api/place-photo?w=${w}&h=${h}&q=${encodeURIComponent(q)}`;
}

export default function SafeImg({
  src,
  fallbackQuery,
  w,
  h,
  alt = "",
  className = "",
  children,
}: SafeImgProps) {
  const [stage, setStage] = React.useState<0 | 1 | 2>(0); // 0: primary, 1: fallback, 2: placeholder
  const [curSrc, setCurSrc] = React.useState(src);

  // reset when 'src' changes
  React.useEffect(() => {
    setStage(0);
    setCurSrc(src);
  }, [src]);

  const handleError = () => {
    if (stage === 0 && fallbackQuery) {
      // try one fallback (city-only)
      setCurSrc(photoUrl(fallbackQuery, w, h));
      setStage(1);
      return;
    }
    // final: show placeholder (no <img> => no more network loops)
    setStage(2);
  };

  // ...
  if (stage === 2) {
    return (
      <div
        className={`relative ${className}`}
        style={{ minHeight: `${h}px` }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(49,46,129,0.6))] backdrop-blur-sm" />
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-xs text-white/70">No photo</span>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ minHeight: `${h}px` }}>
      <img
        src={curSrc}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover absolute inset-0"
        onError={handleError}
        referrerPolicy="no-referrer"
      />
      {children}
    </div>
  );
}