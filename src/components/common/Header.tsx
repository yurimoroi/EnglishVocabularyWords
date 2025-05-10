"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { UserInfo, HeaderProps } from "@/types/header";

export function Header({ onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (user?.uid) {
        const userData = sessionStorage.getItem("user");
        if (userData) {
          const { name } = JSON.parse(userData);
          setUserInfo({
            name,
          });
        }
      }
    };

    fetchUserInfo();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      // ログアウト後、少し待ってからリダイレクト
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-violet-500 fixed w-full top-0 z-50">
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md text-violet-100 hover:bg-violet-600 hover:text-white focus:outline-none hover:cursor-pointer"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <Link
            href="/"
            className="ml-4 text-white text-xl font-bold hover:text-violet-100 transition-colors"
          >
            EVW
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-violet-100">
            <div className="text-sm">{`${userInfo?.name} さん` || "Loading..."}</div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-violet-100 hover:bg-violet-600 hover:text-white rounded-md transition-colors hover:cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
