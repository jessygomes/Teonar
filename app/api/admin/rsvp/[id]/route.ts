import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { COOKIE_NAME, verifyAdminToken } from "@/app/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    /*
     * ----------------------------------------------------------------------
     * 1. VÉRIFICATION DE LA SESSION ADMIN
     * ----------------------------------------------------------------------
     */

    const cookieStore = await cookies();

    const token =
      cookieStore.get(COOKIE_NAME)?.value;

    if (!verifyAdminToken(token)) {
      return NextResponse.json(
        {
          success: false,
          message: "Accès non autorisé.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * ----------------------------------------------------------------------
     * 2. RÉCUPÉRATION DE L'ID
     * ----------------------------------------------------------------------
     */

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Identifiant de l'invité manquant.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ----------------------------------------------------------------------
     * 3. SUPPRESSION DANS NEON
     * ----------------------------------------------------------------------
     */

    const deletedRows =
      await sql`
        DELETE FROM rsvp
        WHERE id = ${id}

        RETURNING
          id,
          prenom,
          nom
      `;

    /*
     * Aucun invité avec cet ID.
     */

    if (
      deletedRows.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invité introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    const deletedGuest =
      deletedRows[0];

    /*
     * ----------------------------------------------------------------------
     * 4. RÉPONSE
     * ----------------------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,

        message:
          "L'invité a bien été supprimé.",

        guest: {
          id:
            deletedGuest.id,

          prenom:
            deletedGuest.prenom,

          nom:
            deletedGuest.nom,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "ADMIN DELETE RSVP ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Impossible de supprimer cet invité.",
      },
      {
        status: 500,
      }
    );
  }
}