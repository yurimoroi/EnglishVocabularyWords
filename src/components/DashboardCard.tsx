import { FiGrid, FiBookOpen, FiActivity, FiSettings } from "react-icons/fi";
import Link from "next/link";
import { IconType } from "react-icons";

type DashboardCardProps = {
  title: string;
  description: string;
  href: string;
};

const iconMap: { [key: string]: IconType } = {
  "/": FiGrid,
  "/question": FiBookOpen,
  "/statictics": FiActivity,
  "/settings": FiSettings,
};

export function DashboardCard({ title, description, href }: DashboardCardProps) {
  const Icon = iconMap[href] || FiGrid;

  return (
    <Link
      href={href}
      className="group block bg-white rounded-lg border-2 border-violet-200 p-6 hover:border-violet-400 transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="text-violet-400 group-hover:text-violet-500">
          <Icon className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
}
