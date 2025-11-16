"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/student", label: "Dashboard" },
  { href: "/student/vocabulary", label: "Vocabulary" },
  //   { href: "/student/tasks", label: "Tasks" },
  //   { href: "/progress", label: "Progress" },
];

export default function StudentNavbar() {
  const path = usePathname();

  return (
    <nav className="bg-white shadow p-3 flex gap-4">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-1 rounded ${
            path.startsWith(item.href)
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
