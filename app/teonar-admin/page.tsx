import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { COOKIE_NAME, verifyAdminToken } from "../lib/adminAuth";
import AdminDashboard from "../components/AdminDashboard";

export const metadata = {
  title: "Administration — TEONAR EVENTUM",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

type RSVPRow = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  profession: string;
  reseau_social: string | null;
  conciergerie: boolean;
  regime_alimentaire: boolean;
  regime_commentaire: string | null;
  created_at: string | Date;
};

export default async function AdminPage() {
  const cookieStore = await cookies();

  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!verifyAdminToken(token)) {
    redirect("/admin/login");
  }

  const sql = neon(process.env.DATABASE_URL!);

  const rows = (await sql`
    SELECT
      id,
      nom,
      prenom,
      email,
      telephone,
      profession,
      reseau_social,
      conciergerie,
      regime_alimentaire,
      regime_commentaire,
      created_at
    FROM rsvp
    ORDER BY created_at DESC
  `) as RSVPRow[];

  const guests = rows.map((row) => ({
    ...row,
    created_at: new Date(row.created_at).toISOString(),
  }));

  return <AdminDashboard guests={guests} />;
}