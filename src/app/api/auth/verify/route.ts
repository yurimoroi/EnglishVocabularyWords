import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

// Firebase Admin の初期化（まだ初期化されていない場合）
if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    // セッションCookieの検証
    const decodedToken = await admin.auth().verifySessionCookie(token, true);
    const uid = decodedToken.uid;

    // Firestoreからユーザーの権限を取得（ドキュメントIDとしてuidを使用）
    const usersRef = admin.firestore().collection("users");
    const userDoc = await usersRef.doc(uid).get();

    if (!userDoc.exists) {
      throw new Error("User document not found");
    }

    const userData = userDoc.data();

    return NextResponse.json({
      role: userData?.role,
      userId: userData?.userId,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
