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

    /*
     * 1. VALIDATION
     */

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

    const normalizedEmail = String(email).trim().toLowerCase();

    const conciergerieBoolean = conciergerie === "oui";

    const regimeBoolean = regimeAlimentaire === "oui";

    /*
     * 2. ENREGISTREMENT DU RSVP
     *
     * On récupère directement l'ID généré
     * pour pouvoir créer l'URL de l'invitation.
     */

    const insertedRows = await sql`
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
      RETURNING id
    `;

    const rsvpId = insertedRows[0]?.id;

    if (!rsvpId) {
      throw new Error(
        "Impossible de récupérer l'identifiant du RSVP."
      );
    }

    /*
     * 3. NOTIFICATION EMAIL ADMIN
     *
     * Une erreur d'email ne bloque jamais
     * l'inscription de l'invité.
     */

    try {
      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

      if (!adminEmail) {
        throw new Error(
          "ADMIN_NOTIFICATION_EMAIL n'est pas défini."
        );
      }

      if (!process.env.SMTP_USER) {
        throw new Error(
          "SMTP_USER n'est pas défini."
        );
      }

      const safeNom = escapeHtml(String(nom));
      const safePrenom = escapeHtml(String(prenom));
      const safeEmail = escapeHtml(normalizedEmail);
      const safeTelephone = escapeHtml(String(telephone));
      const safeProfession = escapeHtml(String(profession));

      const safeReseauSocial = reseauSocial
        ? escapeHtml(String(reseauSocial))
        : "Non renseigné";

      const safeRegimeCommentaire = regimeCommentaire
        ? escapeHtml(String(regimeCommentaire))
        : "Aucune précision";

      await transporter.sendMail({
        from: `"TEONAR RSVP" <${process.env.SMTP_USER}>`,

        to: adminEmail,

        subject: `Nouvelle inscription — ${prenom} ${nom}`,

        text: `
Nouvelle inscription TEONAR EVENTUM

Prénom : ${prenom}
Nom : ${nom}
Email : ${normalizedEmail}
Téléphone : ${telephone}

Profession : ${profession}
Réseau social : ${reseauSocial || "Non renseigné"}

Conciergerie : ${conciergerieBoolean ? "Oui" : "Non"}
Régime alimentaire particulier : ${regimeBoolean ? "Oui" : "Non"}

${
  regimeBoolean
    ? `Précisions : ${regimeCommentaire || "Aucune précision"}`
    : ""
}

TEONAR EVENTUM
Salon privé · Paris
        `.trim(),

        html: `
          <!doctype html>

          <html lang="fr">
            <head>
              <meta charset="UTF-8" />

              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />

              <title>Nouvelle inscription TEONAR</title>
            </head>

            <body
              style="
                margin: 0;
                padding: 0;
                background-color: #0a0a0a;
                font-family: Arial, Helvetica, sans-serif;
                color: #171512;
              "
            >
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width: 100%;
                  background-color: #0a0a0a;
                "
              >
                <tr>
                  <td
                    align="center"
                    style="
                      padding: 40px 16px;
                    "
                  >
                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                      style="
                        width: 100%;
                        max-width: 620px;
                        background-color: #f1eee7;
                        border-collapse: collapse;
                      "
                    >
                      <!-- ACCENT SUPÉRIEUR -->

                      <tr>
                        <td
                          style="
                            height: 4px;
                            background-color: #815b3e;
                            font-size: 0;
                            line-height: 0;
                          "
                        >
                          &nbsp;
                        </td>
                      </tr>

                      <!-- HEADER -->

                      <tr>
                        <td
                          style="
                            padding: 48px 44px 36px 44px;
                          "
                        >
                          <div
                            style="
                              margin-bottom: 14px;
                              font-size: 9px;
                              text-transform: uppercase;
                              letter-spacing: 4px;
                              color: #815b3e;
                            "
                          >
                            TEONAR EVENTUM
                          </div>

                          <div
                            style="
                              font-family: Georgia, serif;
                              font-size: 34px;
                              line-height: 1.15;
                              font-weight: 400;
                              color: #171512;
                            "
                          >
                            Nouvelle inscription
                          </div>

                          <div
                            style="
                              width: 42px;
                              height: 1px;
                              margin-top: 26px;
                              background-color: #815b3e;
                            "
                          ></div>
                        </td>
                      </tr>

                      <!-- NOM -->

                      <tr>
                        <td
                          style="
                            padding: 0 44px 34px 44px;
                          "
                        >
                          <div
                            style="
                              font-family: Georgia, serif;
                              font-size: 20px;
                              line-height: 1.5;
                              color: #171512;
                            "
                          >
                            <strong>
                              ${safePrenom} ${safeNom}
                            </strong>

                            vient de confirmer sa présence.
                          </div>
                        </td>
                      </tr>

                      <!-- INFORMATIONS -->

                      <tr>
                        <td
                          style="
                            padding: 0 44px 48px 44px;
                          "
                        >
                          ${infoRow(
                            "Email",
                            safeEmail
                          )}

                          ${infoRow(
                            "Téléphone",
                            safeTelephone
                          )}

                          ${infoRow(
                            "Profession",
                            safeProfession
                          )}

                          ${infoRow(
                            "Réseau social",
                            safeReseauSocial
                          )}

                          ${infoRow(
                            "Conciergerie",
                            conciergerieBoolean
                              ? "Oui"
                              : "Non",
                            conciergerieBoolean
                          )}

                          ${infoRow(
                            "Régime particulier",
                            regimeBoolean
                              ? "Oui"
                              : "Non",
                            regimeBoolean
                          )}

                          ${
                            regimeBoolean
                              ? infoRow(
                                  "Précisions",
                                  safeRegimeCommentaire
                                )
                              : ""
                          }
                        </td>
                      </tr>

                      <!-- FOOTER -->

                      <tr>
                        <td
                          style="
                            padding: 34px 44px;
                            background-color: #171512;
                          "
                        >
                          <div
                            style="
                              font-size: 10px;
                              text-transform: uppercase;
                              letter-spacing: 4px;
                              color: #f1eee7;
                            "
                          >
                            TEONAR
                          </div>

                          <div
                            style="
                              margin-top: 8px;
                              font-size: 8px;
                              text-transform: uppercase;
                              letter-spacing: 3px;
                              color: rgba(241, 238, 231, 0.45);
                            "
                          >
                            Salon privé · Paris
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });
    } catch (mailError) {
      console.error(
        "ADMIN NOTIFICATION EMAIL ERROR:",
        mailError
      );
    }

    /*
     * 4. RETOUR AU FORMULAIRE
     *
     * On retourne l'URL permettant de générer
     * le PDF personnalisé.
     */

    return NextResponse.json(
      {
        success: true,

        message:
          "Votre présence a bien été enregistrée.",

        invitationUrl:
          `/api/invitation/${rsvpId}`,
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

    /*
     * EMAIL DÉJÀ INSCRIT
     */

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

    /*
     * ERREUR GÉNÉRALE
     */

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

/*
 * --------------------------------------------------------------------------
 * EMAIL ADMIN — LIGNE D'INFORMATION
 * --------------------------------------------------------------------------
 */

function infoRow(
  label: string,
  value: string,
  highlighted = false
) {
  return `
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        width: 100%;
        border-collapse: collapse;
        border-bottom: 1px solid rgba(23, 21, 18, 0.1);
      "
    >
      <tr>
        <td
          valign="top"
          style="
            width: 40%;
            padding: 16px 0;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: rgba(23, 21, 18, 0.42);
          "
        >
          ${label}
        </td>

        <td
          valign="top"
          style="
            padding: 16px 0;
            font-size: 13px;
            line-height: 1.5;
            color: ${
              highlighted
                ? "#815b3e"
                : "#171512"
            };
            font-weight: ${
              highlighted
                ? "600"
                : "400"
            };
          "
        >
          ${value}
        </td>
      </tr>
    </table>
  `;
}

/*
 * --------------------------------------------------------------------------
 * SÉCURISATION DU HTML
 * --------------------------------------------------------------------------
 */

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}