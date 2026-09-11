import { neon } from "@neondatabase/serverless";
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  StandardFonts,
  rgb,
} from "pdf-lib";

import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

type InvitationGuest = {
  prenom: string;
  nom: string;
};

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    /*
     * ----------------------------------------------------------------------
     * 1. RÉCUPÉRATION DE L'INVITÉ
     * ----------------------------------------------------------------------
     */

    const { id } = await params;

    if (!id) {
      return new Response(
        "Identifiant manquant.",
        {
          status: 400,
        }
      );
    }

    const rows = (await sql`
      SELECT
        prenom,
        nom
      FROM rsvp
      WHERE id = ${id}
      LIMIT 1
    `) as InvitationGuest[];

    if (!rows.length) {
      return new Response(
        "Invitation introuvable.",
        {
          status: 404,
        }
      );
    }

    const guest = rows[0];

    /*
     * ----------------------------------------------------------------------
     * 2. CHARGEMENT DU PDF DE BASE
     * ----------------------------------------------------------------------
     *
     * Mets le nouveau PDF compact ici :
     *
     * public/documents/teonar-faire-part-base.pdf
     */

    const pdfPath = path.join(
      process.cwd(),
      "public",
      "documents",
      "teonar-faire-part-base.pdf"
    );

    const basePdf =
      await readFile(pdfPath);

    const pdfDocument =
      await PDFDocument.load(basePdf);

    /*
     * ----------------------------------------------------------------------
     * 3. POLICE DU NOM
     * ----------------------------------------------------------------------
     *
     * HelveticaBold donne ici un résultat
     * proche du SemiBold recherché.
     */

    const nameFont =
      await pdfDocument.embedFont(
        StandardFonts.HelveticaBold
      );

    /*
     * ----------------------------------------------------------------------
     * 4. PRÉNOM + NOM
     * ----------------------------------------------------------------------
     */

    const fullName =
      `${guest.prenom} ${guest.nom}`
        .trim()
        .toUpperCase();

    const pages =
      pdfDocument.getPages();

    if (!pages.length) {
      throw new Error(
        "Le PDF ne contient aucune page."
      );
    }

    const page =
      pages[0];

    /*
     * ----------------------------------------------------------------------
     * 5. STYLE DU NOM
     * ----------------------------------------------------------------------
     */

    const fontSize = 11;

    /*
     * Espacement entre les caractères
     * pour rester cohérent avec la DA TEONAR.
     */

    const tracking = 1.35;

    /*
     * NOUVELLE POSITION POUR LE PDF COMPACT.
     *
     * Le nom est maintenant placé dans l'espace :
     *
     * VOTRE PRÉSENCE EST CONFIRMÉE
     *
     *        PRÉNOM NOM
     *        ──────────
     *
     * La Maison TEONAR...
     */

    const y = 458;

    /*
     * ----------------------------------------------------------------------
     * 6. DESSIN DU NOM PARFAITEMENT CENTRÉ
     * ----------------------------------------------------------------------
     */

    drawCenteredTrackedText({
      page,
      text: fullName,
      font: nameFont,
      fontSize,
      tracking,
      y,
    });

    /*
     * ----------------------------------------------------------------------
     * 7. GÉNÉRATION DU PDF
     * ----------------------------------------------------------------------
     */

    const pdfBytes =
      await pdfDocument.save();

    /*
     * ----------------------------------------------------------------------
     * 8. NOM DU FICHIER
     * ----------------------------------------------------------------------
     */

    const safeFirstName =
      sanitizeFilename(
        guest.prenom
      );

    const safeLastName =
      sanitizeFilename(
        guest.nom
      );

    const filename =
      `TEONAR-Invitation-${safeFirstName}-${safeLastName}.pdf`;

    /*
     * ----------------------------------------------------------------------
     * 9. TÉLÉCHARGEMENT
     * ----------------------------------------------------------------------
     */

    return new Response(
      Buffer.from(pdfBytes),
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="${filename}"`,

          /*
           * Important pour éviter que Vercel / navigateur
           * renvoie une ancienne version personnalisée.
           */

          "Cache-Control":
            "private, no-store, no-cache, max-age=0, must-revalidate",

          Pragma:
            "no-cache",

          Expires:
            "0",
        },
      }
    );
  } catch (error) {
    console.error(
      "INVITATION PDF ERROR:",
      error
    );

    return new Response(
      "Impossible de générer l'invitation.",
      {
        status: 500,
      }
    );
  }
}

/*
 * ==========================================================================
 * TEXTE CENTRÉ AVEC TRACKING
 * ==========================================================================
 *
 * On dessine les caractères individuellement plutôt que d'utiliser
 * simplement characterSpacing.
 *
 * Ça permet de calculer :
 *
 * largeur des lettres
 * +
 * largeur du tracking
 *
 * puis de centrer exactement l'ensemble sur la page.
 */

function drawCenteredTrackedText({
  page,
  text,
  font,
  fontSize,
  tracking,
  y,
}: {
  page: PDFPage;
  text: string;
  font: PDFFont;
  fontSize: number;
  tracking: number;
  y: number;
}) {
  /*
   * Largeur physique de la page.
   */

  const {
    width: pageWidth,
  } = page.getSize();

  /*
   * On convertit correctement le texte
   * en tableau de caractères.
   */

  const characters =
    Array.from(text);

  /*
   * Largeur individuelle de chaque caractère.
   */

  const characterWidths =
    characters.map(
      (character) =>
        font.widthOfTextAtSize(
          character,
          fontSize
        )
    );

  /*
   * Largeur cumulée des lettres.
   */

  const lettersWidth =
    characterWidths.reduce(
      (
        total,
        characterWidth
      ) =>
        total +
        characterWidth,
      0
    );

  /*
   * Largeur ajoutée par le tracking.
   *
   * Exemple :
   *
   * TEONAR
   *
   * 6 caractères
   * = 5 espaces de tracking.
   */

  const trackingWidth =
    Math.max(
      characters.length - 1,
      0
    ) * tracking;

  /*
   * Largeur finale réellement affichée.
   */

  const totalWidth =
    lettersWidth +
    trackingWidth;

  /*
   * Point de départ exact permettant
   * de centrer le texte sur la page.
   */

  let currentX =
    (pageWidth - totalWidth) / 2;

  /*
   * Dessin caractère par caractère.
   */

  characters.forEach(
    (
      character,
      index
    ) => {
      page.drawText(
        character,
        {
          x: currentX,
          y,

          size:
            fontSize,

          font,

          color: rgb(
            23 / 255,
            21 / 255,
            18 / 255
          ),
        }
      );

      /*
       * Déplacement pour la prochaine lettre.
       */

      currentX +=
        characterWidths[index];

      /*
       * Pas besoin de tracking après
       * le dernier caractère.
       */

      if (
        index <
        characters.length - 1
      ) {
        currentX +=
          tracking;
      }
    }
  );
}

/*
 * ==========================================================================
 * NETTOYAGE DU NOM DU FICHIER
 * ==========================================================================
 *
 * Exemple :
 *
 * "Léa" → "Lea"
 * "De Saint Martin" → "De-Saint-Martin"
 */

function sanitizeFilename(
  value: string
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-zA-Z0-9-_]/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .replace(
      /^-|-$/g,
      ""
    );
}