import { rsvpConfirmationEmail } from "@/app/lib/email/rsvpConfirmation";
import { transporter } from "@/app/lib/mailer";
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

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
          message:
            "Merci de remplir tous les champs obligatoires.",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    const conciergerieBoolean =
      conciergerie === "oui";

    const regimeBoolean =
      regimeAlimentaire === "oui";

    /*
     * 1. ENREGISTREMENT DU RSVP
     */

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
        ${normalizedEmail},
        ${telephone},
        ${profession},
        ${reseauSocial || null},
        ${conciergerieBoolean},
        ${regimeBoolean},
        ${
          regimeBoolean
            ? regimeCommentaire || null
            : null
        }
      )
    `;

    /*
     * 2. EMAIL DE CONFIRMATION
     *
     * On ne bloque PAS l'inscription
     * si le SMTP rencontre un problème.
     */

    let mailSent = false;

    try {
      const {
        html,
        text,
      } = rsvpConfirmationEmail();

      await transporter.sendMail({
        from: process.env.MAIL_FROM,

        to: normalizedEmail,

        subject:
          "Votre présence est confirmée — TEONAR EVENTUM",

        text,

        html,
      });

      mailSent = true;
    } catch (mailError) {
      console.error(
        "TEONAR CONFIRMATION EMAIL ERROR:",
        mailError
      );
    }

    /*
     * 3. RÉPONSE AU CLIENT
     */

    return NextResponse.json(
      {
        success: true,
        mailSent,

        message:
          "Votre présence a bien été enregistrée.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "RSVP ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message.includes(
        "duplicate key value"
      )
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