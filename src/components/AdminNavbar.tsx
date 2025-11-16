"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/vocabulary", label: "Vocabulary" },
  { href: "/admin/templates", label: "Templates" },
];

export default function AdminNavbar() {
  const path = usePathname();

  return (
    <nav className="bg-gray-900 text-white p-3 flex gap-4">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-1 rounded ${
            path.startsWith(item.href) ? "bg-blue-600" : "hover:bg-gray-700"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
