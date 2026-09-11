import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      nom,
      prenom,
      email,
      telephone,
      profession,
      reseauSocial,
      conciergerie,
      regimeAlimentaire,
      regimeCommentaire,
    } = body;

    if (
      !nom ||
      !prenom ||
      !email ||
      !telephone ||
      !profession ||
      !conciergerie ||
      !regimeAlimentaire
    ) {
      return NextResponse.json(
        {
          message: "Merci de remplir tous les champs obligatoires.",
        },
        {
          status: 400,
        }
      );
    }

    const conciergerieBoolean = conciergerie === "oui";
    const regimeBoolean = regimeAlimentaire === "oui";

    await sql`
      INSERT INTO rsvp (
        nom,
        prenom,
        email,
        telephone,
        profession,
        reseau_social,
        conciergerie,
        regime_alimentaire,
        regime_commentaire
      )
      VALUES (
        ${nom},
        ${prenom},
        ${email.toLowerCase().trim()},
        ${telephone},
        ${profession},
        ${reseauSocial || null},
        ${conciergerieBoolean},
        ${regimeBoolean},
        ${regimeBoolean ? regimeCommentaire || null : null}
      )
    `;

    return NextResponse.json(
      {
        success: true,
        message: "Votre présence a bien été enregistrée.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("RSVP ERROR:", error);

    if (
      error instanceof Error &&
      error.message.includes("duplicate key value")
    ) {
      return NextResponse.json(
        {
          message:
            "Une confirmation existe déjà pour cette adresse email.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "Impossible d'enregistrer votre réponse pour le moment.",
      },
      {
        status: 500,
      }
    );
  }
}