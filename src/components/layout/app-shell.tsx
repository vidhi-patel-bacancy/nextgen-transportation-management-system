import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1 bg-gradient-to-b from-white/45 to-transparent">
        <TopNavbar />
        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
