"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function SiteIntro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 2400);

    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="teonar-intro fixed inset-0 z-[9999] flex items-center justify-center bg-[#090909]">
      <div className="flex flex-col items-center">
        <div className="intro-logo">
          <Image
            src="/logo/logo_t.png"
            alt="TEONAR"
            width={85}
            height={85}
            priority
            className="h-auto w-[72px] object-contain"
          />
        </div>

        <div className="intro-line mt-7 h-px bg-[#815B3E]" />

        <p className="intro-text mt-6 font-rubik text-[8px] uppercase tracking-[0.55em] text-white/50">
          Maison de joaillerie
        </p>
      </div>
    </div>
  );
}