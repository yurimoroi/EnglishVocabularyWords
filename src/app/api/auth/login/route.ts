import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

// Firebase Admin の初期化（まだ初期化されていない場合）
if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    // セッションCookieの有効期限（5日）
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // セッションCookieを作成
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    // IDトークンを検証
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Firestoreからユーザーの権限を取得（ドキュメントIDとしてuidを使用）
    const usersRef = admin.firestore().collection("users");
    const userDoc = await usersRef.doc(uid).get();

    if (!userDoc.exists) {
      throw new Error("User document not found");
    }

    const userData = userDoc.data();

    // レスポンスの作成
    const response = NextResponse.json({
      status: "success",
      user: {
        name: userData?.name,
      },
    });

    // セッションCookieを設定
    response.cookies.set({
      name: "session",
      value: sessionCookie,
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "development",
      sameSite: "strict",
      path: "/",
      maxAge: expiresIn / 1000, // 秒単位に変換
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
