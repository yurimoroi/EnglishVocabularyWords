"use client";

import { useState } from "react";
import { Header } from "@/components/common/Header";
import { Sidebar } from "@/components/common/Sidebar";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} />
      <main
        className={`pt-16 transition-pl duration-300 ease-in-out ${
          isSidebarOpen ? "lg:pl-64" : "pl-0"
        }`}
      >
        <div className="px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
