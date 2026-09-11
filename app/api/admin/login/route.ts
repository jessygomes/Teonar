import { COOKIE_NAME, createAdminToken } from "@/app/lib/adminAuth";
import { NextResponse } from "next/server";;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const password = body?.password;

    if (!password) {
      return NextResponse.json(
        { message: "Mot de passe requis." },
        { status: 400 }
      );
    }

    if (!process.env.ADMIN_PASSWORD) {
      console.error("ADMIN_PASSWORD est manquant.");

      return NextResponse.json(
        { message: "Configuration administrateur incorrecte." },
        { status: 500 }
      );
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { message: "Mot de passe incorrect." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: createAdminToken(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return NextResponse.json(
      { message: "Une erreur est survenue." },
      { status: 500 }
    );
  }
}