"use client";

import { DashboardCard } from "@/components/DashboardCard";

const menuItems = [
  {
    title: "Question",
    description: "問題を解いて、単語を覚えよう",
    href: "/question",
  },
  {
    title: "statistics",
    description: "過去の統計を確認できます",
    href: "/statistics",
  },
  {
    title: "Settings",
    description: "設定を変更できます",
    href: "/settings",
  },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <div key={item.title}>
            <DashboardCard title={item.title} description={item.description} href={item.href} />
          </div>
        ))}
      </div>
    </div>
  );
}

