"use client";

import { usePathname } from "next/navigation";
import { ClientLayout } from "./ClientLayout";

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname === "/signup";

  return isLoginPage ? children : <ClientLayout>{children}</ClientLayout>;
}
