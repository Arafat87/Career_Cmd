"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import ToastContainer from "@/components/ToastContainer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page gets full screen — no sidebar/header
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="w-screen min-h-screen flex overflow-x-hidden">
      <aside className="w-64 shrink-0">
        <Sidebar />
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto flex flex-col">
        <Header />
        <div className="flex-1">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
