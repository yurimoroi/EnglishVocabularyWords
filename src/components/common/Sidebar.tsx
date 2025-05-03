"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiGrid, FiBookOpen, FiActivity, FiSettings } from "react-icons/fi";

type SidebarProps = {
  isOpen: boolean;
};

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/", label: "Dashboard", icon: FiGrid },
    { href: "/question", label: "Question", icon: FiBookOpen },
    { href: "/statistics", label: "Statistics", icon: FiActivity },
    { href: "/settings", label: "Settings", icon: FiSettings },
  ];

  const handleMenuClick = (href: string, e: React.MouseEvent) => {
    if (href === "#") {
      e.preventDefault();
    }
  };

  return (
    <>
      {/* オーバーレイ */}
      {/* {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose} />
      )} */}

      {/* サイドバー */}
      <div
        className={`fixed top-[64px] left-0 h-[calc(100vh-64px)] w-64 bg-violet-500 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0 md:translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="h-full">
          <ul className="py-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-white hover:bg-violet-600 ${
                    pathname === item.href ? "bg-violet-600" : ""
                  }`}
                  onClick={(e) => handleMenuClick(item.href, e)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
