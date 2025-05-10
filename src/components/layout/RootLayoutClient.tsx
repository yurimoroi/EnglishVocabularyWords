"use client";

import { usePathname } from "next/navigation";
import { ClientLayout } from "./ClientLayout";
import { useAuth } from "@/contexts/AuthContext";

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const publicPaths = ["/login", "/signup"];
  const isPublicPage = publicPaths.includes(pathname);

  if (!user && !isPublicPage) {
    return null; // ログインしていない場合は何も表示しない
  }

  return isPublicPage ? children : <ClientLayout>{children}</ClientLayout>;
}
