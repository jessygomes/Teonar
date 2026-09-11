import Image from "next/image";

import Carousel from "@/app/components/Carousel";
import RSVPForm from "@/app/components/RSVPForm";
import SiteIntro from "@/app/components/SiteIntro";

const CAROUSEL_IMAGES = [
  "/img/_MG_5890.JPG",
  "/img/brasmultibracelet.JPG",
  "/img/photo bracelet eternel m.jpg",
  "/img/21A42E86-3389-41FE-ADBB-BB2967555A35.JPG",
  "/img/C383FFFB-5C97-4D3B-9DF3-8D630CABFDB2.JPG",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] lg:h-screen lg:overflow-hidden">
      {/* INTRO PLEIN ÉCRAN */}
      <SiteIntro />

      <div className="grid min-h-screen lg:h-screen lg:grid-cols-[1.12fr_0.88fr]">
        {/* ------------------------------------------------------------------ */}
        {/*                              VISUEL                                */}
        {/* ------------------------------------------------------------------ */}

        <section className="hero-reveal relative min-h-[72svh] overflow-hidden lg:min-h-0">
          <Carousel images={CAROUSEL_IMAGES} />

          {/* Overlay principal */}
          <div className="absolute inset-0 bg-black/25" />

          {/* Dégradé vertical */}
          <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/5 to-black/75" />

          {/* Vignette subtile */}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.35)]" />

          <div className="relative z-10 flex h-full min-h-[72svh] flex-col justify-between px-7 py-8 text-[#F3EFE8] sm:px-10 sm:py-10 lg:min-h-0 lg:px-14 lg:py-12 xl:px-20">
            {/* -------------------------------------------------------------- */}
            {/* HEADER                                                         */}
            {/* -------------------------------------------------------------- */}

            <div className="hero-item hero-delay-1 flex items-center justify-between">
              <Image
                src="/logo/logo_t.png"
                alt="TEONAR"
                width={72}
                height={72}
                priority
                className="h-auto w-14 opacity-95 lg:w-16"
              />

              <p className="font-rubik text-[9px] uppercase tracking-[0.4em] text-white/60">
                Paris · 2026
              </p>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* CONTENU CENTRAL                                                */}
            {/* -------------------------------------------------------------- */}

            <div className="hero-item hero-delay-2 my-auto py-20 lg:py-0">
              <p className="mb-7 font-rubik text-[10px] uppercase tracking-[0.55em] text-white/60">
                Invitation privée
              </p>

              <h1 className="max-w-3xl font-montserrat text-[clamp(3.6rem,7vw,7.5rem)] font-medium uppercase tracking-wider leading-[1]">
                Teonar

                <span className="block font-light text-white/50 text-6xl tracking-widest">
                  Eventum
                </span>
              </h1>

              {/* <div className="mt-10 flex items-center gap-5">
                <span className="h-px w-12 bg-[#A97A54]" />

                <p className="font-rubik text-[10px] uppercase tracking-[0.32em] text-white/70">
                  Maison de joaillerie
                </p>
              </div> */}
            </div>

            {/* -------------------------------------------------------------- */}
            {/* INFORMATIONS ÉVÉNEMENT                                         */}
            {/* -------------------------------------------------------------- */}

            <div className="hero-item hero-delay-3 border-t border-white/20 pt-6">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div>
                  <p className="font-display text-xl font-light sm:text-2xl">
                    Jeudi 1<sup>er</sup> octobre 2026
                  </p>

                  <p className="mt-2 font-rubik text-[10px] uppercase tracking-[0.32em] text-white/55">
                    Paris · Salon privé
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="font-display text-xl font-light sm:text-2xl">
                    20:00 — 23:00
                  </p>

                  <p className="mt-2 font-rubik text-[10px] uppercase tracking-[0.32em] text-white/55">
                    Sur invitation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/*                              RSVP                                  */}
        {/* ------------------------------------------------------------------ */}

        <section className="rsvp-reveal relative bg-[#F1EEE7] lg:h-screen lg:overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-170 flex-col px-7 py-16 sm:px-12 sm:py-20 lg:px-14 lg:py-16 xl:px-20">
            {/* En-tête RSVP */}

            <div className="rsvp-content-reveal mb-14">
              <p className="mb-4 font-rubik text-[9px] uppercase tracking-[0.45em] text-[#815B3E]">
                RSVP · TEONAR EVENTUM
              </p>

              <h2 className="max-w-md font-display text-4xl font-light leading-[1.05] tracking-tight text-[#171512] sm:text-4xl">
                Confirmez votre présence
              </h2>

              <p className="mt-5 max-w-md font-rubik text-sm font-light leading-6 text-black/50">
                Nous serons heureux de vous accueillir à cette soirée privée
                imaginée par la Maison TEONAR.
              </p>
            </div>

            {/* Formulaire */}

            <div className="rsvp-form-reveal">
              <RSVPForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}