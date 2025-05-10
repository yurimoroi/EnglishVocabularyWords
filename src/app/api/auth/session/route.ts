import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    // Firebase Admin SDKを使用してIDトークンを検証し、セッションCookieを作成
    const expiresIn = 30 * 60 * 1000; // 30分
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // セッションCookieを設定
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "development",
      path: "/",
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error setting session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  // セッションCookieを削除
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return NextResponse.json({ status: "success" });
}
