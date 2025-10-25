"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Button, Chip, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "solar:home-2-line-duotone" },
  { label: "Funcionários", href: "/dashboard/funcionarios", icon: "solar:users-group-rounded-line-duotone" },
  { label: "Estoque", href: "/dashboard/estoque", icon: "solar:box-minimalistic-line-duotone" },
  { label: "Fornecedores", href: "/dashboard/fornecedores", icon: "solar:hand-money-line-duotone" },
  { label: "Prazos", href: "/dashboard/prazos", icon: "solar:calendar-date-line-duotone" },
  { label: "Lançamentos", href: "/dashboard/lancamentos", icon: "solar:document-add-line-duotone" },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const session = typeof window !== "undefined" ? localStorage.getItem("pwa-auth") : null;

    if (!session) {
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(session);
      setUser(parsed);
    } catch (error) {
      console.error("Sessão inválida", error);
      localStorage.removeItem("pwa-auth");
      router.replace("/login");
      return;
    } finally {
      setHydrated(true);
    }
  }, [router]);

  const activeLabel = useMemo(() => {
    const current = NAV_ITEMS.find((item) => item.href === pathname);
    return current?.label ?? "";
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("pwa-auth");
    router.replace("/login");
  };

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-900">
        <div className="rounded-lg border border-slate-200 bg-white px-8 py-6 shadow-md">
          Preparando painel...
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 lg:flex-row">
      <aside className="flex w-full flex-col border-b border-slate-200 bg-white px-6 py-4 shadow-sm lg:h-auto lg:w-72 lg:border-b-0 lg:border-r lg:py-8">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">PWA</p>
          <h1 className="text-xl font-semibold">Gestão de EPIs</h1>
          <p className="text-xs text-slate-500">
            Operação contínua, mesmo offline.
          </p>
        </div>

        <Divider className="my-4 border-slate-200 lg:my-6" />

        <nav className="flex flex-wrap gap-2 lg:flex-1 lg:flex-col lg:gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon icon={item.icon} className="text-lg" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 lg:mt-8">
          <p className="font-medium text-slate-700">Modo offline inteligente</p>
          <p>
            Registre entregas sem conexão. Os dados são sincronizados automaticamente quando online.
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex flex-col gap-4 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <Avatar name={user?.name ?? "Gestor"} size="sm" className="bg-primary/10 text-primary" />
              <div className="text-sm">
                <p className="font-medium text-slate-900">{user?.name ?? "Gestor"}</p>
                <p className="text-xs text-slate-500">Segurança do Trabalho</p>
              </div>
            </div>
            <Button variant="flat" color="danger" onPress={handleLogout}>
              Sair
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{activeLabel}</h2>
              <p className="text-sm text-slate-500">
                Visualize e atualize informações críticas da operação.
              </p>
            </div>
            <Chip variant="flat" color="primary">
              Disponível offline
            </Chip>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-7xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
