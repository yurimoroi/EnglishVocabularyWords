"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const userCredential = await signIn(email, password);

      if (userCredential.user) {
        // usersコレクションからユーザー情報を取得
        const userDocRef = doc(db, "users", userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          // セッションストレージにユーザー情報を保存
          sessionStorage.setItem(
            "user",
            JSON.stringify({
              uid: userCredential.user.uid,
              email: userCredential.user.email,
              ...userData,
            })
          );
        } else {
          // ユーザードキュメントが存在しない場合は基本的な情報のみ保存
          sessionStorage.setItem(
            "user",
            JSON.stringify({
              uid: userCredential.user.uid,
              email: userCredential.user.email,
            })
          );
        }

        router.push("/");
      }
    } catch (error) {
      console.error("ログインに失敗しました:", error);
      setErrors({
        email: "メールアドレスまたはパスワードが正しくありません",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            English Vocabulary Words
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let&apos;s learn English vocabulary words!
          </p>
        </div>
        {errors.email && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {errors.email}
          </div>
        )}
        {errors.password && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {errors.password}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-violet-500 sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-violet-500 sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <Link
              href="/signup"
              className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-violet-600 hover:bg-gray-50 border border-violet-600"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
