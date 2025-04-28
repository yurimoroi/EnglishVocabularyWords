import { auth } from "@/lib/firebase/firebase";
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { FirebaseError } from "firebase/app";

// ユーザーID/パスワードでログイン
export const loginWithUserId = async (email: string, password: string) => {
  try {
    // Firebase認証でログイン
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          throw new Error("メールアドレスまたはパスワードが間違っています");
        default:
          throw new Error("ログインに失敗しました");
      }
    }
    throw error;
  }
};

// ログアウト
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("ログアウトに失敗しました");
  }
};
