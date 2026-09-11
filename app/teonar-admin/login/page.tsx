"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ?? "Impossible de se connecter."
        );
      }

      router.push("/teonar-admin");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-6">
      <div className="w-full max-w-107.5">
        <div className="mb-12 text-center">
          <Image
            src="/logo/logo_teo.png"
            alt="TEONAR"
            width={60}
            height={60}
            className="mx-auto mb-8 h-auto w-14"
          />

          <p className="mb-4 font-rubik text-[9px] uppercase tracking-[0.45em] text-[#A97A54]">
            Administration
          </p>

          <h1 className="font-display text-4xl font-light text-[#F1EEE7]">
            TEONAR EVENTUM
          </h1>

          <p className="mt-4 font-rubik text-xs font-light text-white/40">
            Accès réservé à la Maison TEONAR.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-white/10 p-8"
        >
          <label
            htmlFor="password"
            className="font-rubik text-[9px] uppercase tracking-[0.3em] text-white/40"
          >
            Mot de passe
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            autoFocus
            required
            className="
              mt-4
              w-full
              border-0
              border-b
              border-white/20
              bg-transparent
              px-0
              py-3
              font-rubik
              text-sm
              text-white
              outline-none
              transition-colors
              focus:border-[#A97A54]
            "
          />

          {error && (
            <p className="mt-5 font-rubik text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              mt-8
              flex
              w-full
              items-center
              justify-center
              bg-[#F1EEE7]
              px-6
              py-4
              font-rubik
              text-[9px]
              uppercase
              tracking-[0.3em]
              text-[#171512]
              transition-colors
              hover:bg-[#A97A54]
              hover:text-white
              disabled:opacity-50
            "
          >
            {loading ? "Connexion..." : "Accéder à l'administration"}
          </button>
        </form>
      </div>
    </main>
  );
}