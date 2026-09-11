import { NextResponse } from "next/server";

type RsvpPayload = {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  profession?: string;
  reseauSocial?: string;
  conciergerie?: string;
  regimeAlimentaire?: string;
  regimeCommentaire?: string;
  attestation?: string;
};

const REQUIRED_FIELDS: (keyof RsvpPayload)[] = [
  "nom",
  "prenom",
  "email",
  "telephone",
  "profession",
  "conciergerie",
  "regimeAlimentaire",
  "attestation",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: RsvpPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  for (const field of REQUIRED_FIELDS) {
    if (!payload[field]) {
      return NextResponse.json(
        { message: "Merci de compléter tous les champs obligatoires." },
        { status: 400 }
      );
    }
  }

  if (!EMAIL_REGEX.test(payload.email ?? "")) {
    return NextResponse.json(
      { message: "Adresse email invalide." },
      { status: 400 }
    );
  }

  if (
    payload.regimeAlimentaire === "oui" &&
    !payload.regimeCommentaire?.trim()
  ) {
    return NextResponse.json(
      { message: "Merci de préciser votre régime alimentaire." },
      { status: 400 }
    );
  }

  // TODO: brancher la persistance (base de données / e-mail) des inscriptions.
  console.info("Nouvelle inscription TEONAR EVENTUM:", payload);

  return NextResponse.json({ message: "Inscription enregistrée." });
}
