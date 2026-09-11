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

const sql = neon(process.env.DATABASE_URL!);

type InvitationGuest = {
  prenom: string;
  nom: string;
};

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    /*
     * 1. RÉCUPÉRATION DE L'INVITÉ
     */

    const rows = (await sql`
      SELECT
        prenom,
        nom
      FROM rsvp
      WHERE id = ${id}
      LIMIT 1
    `) as InvitationGuest[];

    if (!rows.length) {
      return new Response("Invitation introuvable.", {
        status: 404,
      });
    }

    const guest = rows[0];

    /*
     * 2. CHARGEMENT DU PDF DE BASE
     */

    const pdfPath = path.join(
      process.cwd(),
      "public",
      "documents",
      "teonar-faire-part-base.pdf"
    );

    const basePdf = await readFile(pdfPath);

    const pdfDocument = await PDFDocument.load(basePdf);

    /*
     * 3. POLICE DU NOM
     *
     * HelveticaBold donne ici un rendu proche
     * d'un SemiBold.
     */

    const nameFont = await pdfDocument.embedFont(
      StandardFonts.HelveticaBold
    );

    /*
     * 4. TEXTE
     */

    const fullName = `${guest.prenom} ${guest.nom}`
      .trim()
      .toUpperCase();

    const pages = pdfDocument.getPages();
    const page = pages[0];

    /*
     * 5. STYLE / POSITION
     */

    const fontSize = 11;

    // Espacement premium entre les caractères.
    const tracking = 1.35;

    /*
     * Position verticale du nom :
     * sous "Votre présence est confirmée"
     * et au-dessus de la ligne bronze.
     */
    const y = 536;

    /*
     * 6. NOM PARFAITEMENT CENTRÉ
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
     * 7. GÉNÉRATION DU PDF
     */

    const pdfBytes = await pdfDocument.save();

    /*
     * 8. NOM DU FICHIER
     */

    const safeFirstName = sanitizeFilename(
      guest.prenom
    );

    const safeLastName = sanitizeFilename(
      guest.nom
    );

    const filename =
      `TEONAR-Invitation-${safeFirstName}-${safeLastName}.pdf`;

    /*
     * 9. TÉLÉCHARGEMENT
     */

    return new Response(
      Buffer.from(pdfBytes),
      {
        status: 200,

        headers: {
          "Content-Type": "application/pdf",

          "Content-Disposition":
            `attachment; filename="${filename}"`,

          "Cache-Control":
            "private, no-store, max-age=0",
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
 * Le texte est dessiné caractère par caractère.
 *
 * Ça permet de connaître sa largeur RÉELLE,
 * tracking compris, et donc de le centrer
 * exactement sur la page.
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
  const { width: pageWidth } =
    page.getSize();

  /*
   * Largeur de chaque caractère.
   */

  const characterWidths = Array.from(
    text
  ).map((character) =>
    font.widthOfTextAtSize(
      character,
      fontSize
    )
  );

  /*
   * Largeur réelle du texte :
   *
   * caractères
   * +
   * espaces entre chaque caractère.
   */

  const charactersWidth =
    characterWidths.reduce(
      (total, width) =>
        total + width,
      0
    );

  const trackingWidth =
    Math.max(text.length - 1, 0) *
    tracking;

  const totalWidth =
    charactersWidth +
    trackingWidth;

  /*
   * X EXACT pour centrer le texte
   * au milieu physique de la page.
   */

  let currentX =
    (pageWidth - totalWidth) / 2;

  /*
   * Dessin caractère par caractère.
   */

  Array.from(text).forEach(
    (character, index) => {
      page.drawText(
        character,
        {
          x: currentX,
          y,

          size: fontSize,
          font,

          color: rgb(
            23 / 255,
            21 / 255,
            18 / 255
          ),
        }
      );

      currentX +=
        characterWidths[index] +
        tracking;
    }
  );
}

/*
 * ==========================================================================
 * NOM DU FICHIER
 * ==========================================================================
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