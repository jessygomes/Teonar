"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

type Status = "idle" | "submitting" | "success" | "error";
type Choice = "oui" | "non" | "";

export default function RSVPForm() {
  const [conciergerie, setConciergerie] = useState<Choice>("");
  const [regime, setRegime] = useState<Choice>("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!conciergerie || !regime) {
      setStatus("error");
      setErrorMessage(
        "Merci de répondre à toutes les questions ci-dessous."
      );
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      ...Object.fromEntries(formData.entries()),
      conciergerie,
      regimeAlimentaire: regime,
    };

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message ?? "Une erreur est survenue."
        );
      }

      form.reset();

      setConciergerie("");
      setRegime("");
      setStatus("success");
    } catch (error) {
      setStatus("error");

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    }
  }

  if (status === "success") {
    return (
      <div className="flex w-full flex-1 flex-col justify-center py-10">
        <div className="max-w-md">
          {/* Icône */}
          <div className="mb-10 flex h-14 w-14 items-center justify-center border border-black/15">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              className="h-5 w-5 text-[#815B3E]"
            >
              <path
                d="M5 12.5l4.2 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="mb-4 font-rubik text-[9px] uppercase tracking-[0.42em] text-[#815B3E]">
            Confirmation reçue
          </p>

          <h3 className="font-display text-4xl font-light leading-[1.05] tracking-[-0.025em] text-[#171512] sm:text-5xl">
            Merci pour votre réponse.
          </h3>

          <p className="mt-6 font-rubik text-sm font-light leading-7 text-black/50">
            Votre présence au TEONAR EVENTUM est enregistrée.
            <br />
            La Maison TEONAR se réjouit de vous recevoir.
          </p>

          <div className="mt-10 h-px w-16 bg-[#815B3E]" />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-14"
    >
      {/* COORDONNÉES */}
      <Section title="Vos coordonnées">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
          <FloatingField
            label="Nom"
            name="nom"
            autoComplete="family-name"
            required
          />

          <FloatingField
            label="Prénom"
            name="prenom"
            autoComplete="given-name"
            required
          />

          <FloatingField
            label="Adresse email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />

          <FloatingField
            label="Téléphone"
            name="telephone"
            type="tel"
            autoComplete="tel"
            required
          />

          <FloatingField
            label="Profession & activité"
            name="profession"
            required
          />

          <FloatingField
            label="Instagram ou LinkedIn"
            name="reseauSocial"
            type="text"
          />
        </div>
      </Section>

      {/* PRÉFÉRENCES */}
      <Section title="Vos préférences">
        <div className="flex flex-col">
          <Toggle
            label="Souhaitez-vous utiliser le service de conciergerie proposé par la Maison ?"
            value={conciergerie}
            onChange={setConciergerie}
          />

          <div className="pt-7">
            <Toggle
              label="Avez-vous un régime alimentaire particulier, une allergie ou une restriction ?"
              value={regime}
              onChange={setRegime}
              withBorder={regime !== "oui"}
            />

            <div
              className={`grid transition-all duration-500 ${
                regime === "oui"
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-b border-black/10 pb-7 pt-7">
                  <FloatingTextarea
                    label="Précisez votre régime ou vos allergies"
                    name="regimeCommentaire"
                    required={regime === "oui"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CONFIRMATION */}
      <Section title="Confirmation">
        <label className="group flex cursor-pointer items-start gap-4">
          <input
            type="checkbox"
            name="attestation"
            required
            className="peer sr-only"
          />

          <span
            className="
              relative
              mt-0.5
              flex
              h-[18px]
              w-[18px]
              shrink-0
              items-center
              justify-center
              border
              border-black/25
              transition-all
              duration-300
              peer-checked:border-[#171512]
              peer-checked:bg-[#171512]
            "
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-3 w-3 scale-75 text-[#F1EEE7] opacity-0 transition-all duration-300 peer-checked:scale-100 peer-checked:opacity-100"
            >
              <path
                d="M4 10.5 8 14l8-9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <span className="font-rubik text-[13px] font-light leading-6 text-black/60 transition-colors duration-300 group-hover:text-black/80">
            J&apos;atteste de ma présence le jeudi 1
            <sup>er</sup> octobre 2026 lors du TEONAR EVENTUM.
          </span>
        </label>

        {/* ERREUR */}
        {status === "error" && (
          <div className="mt-6 border-l border-red-700/60 pl-4">
            <p className="font-rubik text-xs font-light leading-5 text-red-800">
              {errorMessage}
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="
            group
            mt-9
            flex
            w-full
            items-center
            justify-between
            bg-[#171512]
            px-7
            py-5
            font-rubik
            text-[9px]
            uppercase
            tracking-[0.32em]
            text-[#F1EEE7]
            transition-all
            duration-500
            hover:bg-[#815B3E]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <span>
            {status === "submitting"
              ? "Enregistrement..."
              : "Confirmer ma présence"}
          </span>

          {status === "submitting" ? (
            <span className="h-4 w-4 animate-spin rounded-full border border-white/30 border-t-white" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1.5"
            >
              <path
                d="M5 12h14M13 6l6 6-6 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <p className="mt-4 text-center font-rubik text-[8px] uppercase tracking-[0.25em] text-black/30">
          Invitation personnelle · TEONAR Paris
        </p>
      </Section>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   SECTION                                  */
/* -------------------------------------------------------------------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-7">
      <div className="flex items-center gap-5">
        <p className="whitespace-nowrap font-rubik text-[9px] uppercase tracking-[0.4em] text-[#815B3E]">
          {title}
        </p>

        <div className="h-px flex-1 bg-black/10" />
      </div>

      {children}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    INPUT                                   */
/* -------------------------------------------------------------------------- */

function FloatingField({
  label,
  name,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="relative pt-2">
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder=" "
        className="
          peer
          w-full
          border-0
          border-b
          border-black/15
          bg-transparent
          px-0
          pb-3
          pt-5
          font-rubik
          text-[15px]
          font-light
          text-[#171512]
          outline-none
          transition-colors
          duration-300
          placeholder-transparent
          focus:border-[#815B3E]
        "
      />

      <label
        htmlFor={name}
        className="
          pointer-events-none
          absolute
          left-0
          top-7
          font-rubik
          text-[10px]
          uppercase
          tracking-[0.2em]
          text-black/40
          transition-all
          duration-300

          peer-focus:top-1
          peer-focus:text-[8px]
          peer-focus:tracking-[0.3em]
          peer-focus:text-[#815B3E]

          peer-not-placeholder-shown:top-1
          peer-not-placeholder-shown:text-[8px]
          peer-not-placeholder-shown:tracking-[0.3em]
        "
      >
        {label}
        {required && " *"}
      </label>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TEXTAREA                                  */
/* -------------------------------------------------------------------------- */

function FloatingTextarea({
  label,
  name,
  required,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div className="relative pt-2">
      <textarea
        id={name}
        name={name}
        rows={3}
        required={required}
        placeholder=" "
        className="
          peer
          w-full
          resize-none
          border-0
          border-b
          border-black/15
          bg-transparent
          px-0
          pb-3
          pt-5
          font-rubik
          text-[14px]
          font-light
          leading-6
          text-[#171512]
          outline-none
          transition-colors
          duration-300
          placeholder-transparent
          focus:border-[#815B3E]
        "
      />

      <label
        htmlFor={name}
        className="
          pointer-events-none
          absolute
          left-0
          top-7
          font-rubik
          text-[10px]
          uppercase
          tracking-[0.18em]
          text-black/40
          transition-all
          duration-300

          peer-focus:top-1
          peer-focus:text-[8px]
          peer-focus:tracking-[0.25em]
          peer-focus:text-[#815B3E]

          peer-not-placeholder-shown:top-1
          peer-not-placeholder-shown:text-[8px]
          peer-not-placeholder-shown:tracking-[0.25em]
        "
      >
        {label}
        {required && " *"}
      </label>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   TOGGLE                                   */
/* -------------------------------------------------------------------------- */

function Toggle({
  label,
  value,
  onChange,
  withBorder = true,
}: {
  label: string;
  value: Choice;
  onChange: (value: Choice) => void;
  withBorder?: boolean;
}) {
  return (
    <div
      className={`
        flex
        flex-col
        gap-5
        pb-7
        sm:flex-row
        sm:items-center
        sm:justify-between
        sm:gap-8
        ${withBorder ? "border-b border-black/10" : ""}
      `}
    >
      <p className="max-w-sm font-rubik text-[13px] font-light leading-6 text-black/60">
        {label}
      </p>

      <div className="flex w-fit shrink-0 border border-black/15 p-1">
        {(["oui", "non"] as const).map((option) => {
          const active = value === option;

          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option)}
              className={`
                min-w-[72px]
                px-5
                py-2.5
                font-rubik
                text-[9px]
                uppercase
                tracking-[0.25em]
                transition-all
                duration-300

                ${
                  active
                    ? "bg-[#171512] text-[#F1EEE7]"
                    : "text-black/35 hover:bg-black/[0.04] hover:text-black/70"
                }
              `}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}