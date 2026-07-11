import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { HealthService } from "../types";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import Card from "./ui/Card";

import {
  LayoutDashboard,
  Database,
  Users,
  Cable,
  Shield,
  MessageSquare,
  Globe,
  Activity,
  Bell,
  BarChart3,
  CloudOff,
  History,
  Menu,
  X,
  Network,
  KeySquare,
  ChevronDown,
  ChevronRight,
  Eye,
  Server,
  Settings,
} from "lucide-react";

type NavItem = {
  key: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = {
  title: string;
  titleKey: string;
  items: NavItem[];
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Monitoring",
    titleKey: "nav.groups.monitoring",
    icon: Eye,
    items: [
      { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
      { key: "metrics", href: "/metrics", icon: BarChart3 },
      { key: "alerts", href: "/alerts", icon: Bell },
      { key: "visualStreamGraph", href: "/visual-stream-graph", icon: Network },
    ],
  },
  {
    title: "NATS Entities",
    titleKey: "nav.groups.natsEntities",
    icon: Database,
    items: [
      { key: "streams", href: "/streams", icon: Database },
      { key: "consumers", href: "/consumers", icon: Users },
      { key: "messages", href: "/messages", icon: MessageSquare },
      { key: "subjects", href: "/subjects", icon: Globe },
      { key: "kvStore", href: "/kv-store", icon: KeySquare },
    ],
  },
  {
    title: "System",
    titleKey: "nav.groups.system",
    icon: Server,
    items: [
      { key: "cluster", href: "/cluster", icon: Activity },
      { key: "connections", href: "/connections", icon: Cable },
      { key: "history", href: "/history", icon: History },
    ],
  },
  {
    title: "Administration",
    titleKey: "nav.groups.administration",
    icon: Settings,
    items: [
      { key: "security", href: "/security", icon: Shield },
      { key: "tenancy", href: "/tenancy", icon: Globe },
    ],
  },
] as const;

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const { t } = useTranslation();

  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: () => HealthService.getHealth(),
    refetchInterval: 30000,
  });

  const connected = health?.nats === "connected";

  const toggleGroup = (groupTitleKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupTitleKey)) {
        next.delete(groupTitleKey);
      } else {
        next.add(groupTitleKey);
      }
      return next;
    });
  };

  const isGroupActive = (group: NavGroup) =>
    group.items.some(
      (item) =>
        location.pathname === item.href ||
        location.pathname.startsWith(item.href + "/")
    );

  return (
    <div className="flex h-screen overflow-hidden bg-surface-primary">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-display-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        {t("common.skipToContent")}
      </a>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? t("common.closeMenu") : t("common.openMenu")}
        aria-expanded={sidebarOpen}
        className="fixed start-3 top-3 z-[60] flex h-10 w-10 items-center justify-center rounded-lg border border-border-default bg-surface-secondary text-content-primary shadow-lg transition-colors hover:bg-surface-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary md:hidden"
      >
        {sidebarOpen ? <X className="icon-md" /> : <Menu className="icon-md" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed z-50 flex h-full w-64 flex-shrink-0 flex-col border-e border-border-default/70 bg-surface-secondary/80 shadow-2xl shadow-black/20 backdrop-blur-xl transition-transform duration-300 ease-out md:relative md:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        aria-label={t("nav.title")}
      >
        {/* Logo */}
        <div className="border-b border-border-default/70 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-500/20 text-primary-300 ring-1 ring-primary-400/30">
              <Activity className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-display-sm font-bold tracking-tight text-content-primary">
                {t("app.title")}
              </h1>
              <p className="truncate text-display-xs text-content-tertiary">
                {t("app.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3 scrollbar-thin">
          {NAV_GROUPS.map((group) => {
            const isCollapsed = collapsedGroups.has(group.titleKey);
            const groupActive = isGroupActive(group);

            return (
              <div key={group.titleKey} className="space-y-0.5">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.titleKey)}
                  aria-expanded={!isCollapsed}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-display-xs font-semibold uppercase tracking-wider transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    groupActive
                      ? "bg-primary-500/10 text-primary-400"
                      : "text-content-tertiary hover:bg-surface-primary/60 hover:text-content-primary"
                  }`}
                >
                  <group.icon
                    className={`h-3.5 w-3.5 shrink-0 ${
                      groupActive ? "text-primary-400" : "text-content-tertiary"
                    }`}
                  />
                  <span className="flex-1 truncate text-start">
                    {t(group.titleKey)}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 rtl:rotate-180" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                  )}
                </button>

                {/* Group Items */}
                <div
                  className={`grid transition-all duration-200 ease-in-out ${
                    isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-0.5 py-0.5 pe-1 ps-5">
                      {group.items.map((item) => {
                        const isActive =
                          location.pathname === item.href ||
                          location.pathname.startsWith(item.href + "/");
                        return (
                          <Link
                            key={item.key}
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            aria-current={isActive ? "page" : undefined}
                            className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-display-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                              isActive
                                ? "bg-primary-600/15 text-content-primary"
                                : "text-content-tertiary hover:bg-surface-primary/60 hover:text-content-primary"
                            }`}
                          >
                            {isActive && (
                              <span className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-primary-500" />
                            )}
                            <item.icon
                              className={`h-4 w-4 shrink-0 ${
                                isActive
                                  ? "text-primary-400"
                                  : "text-content-tertiary group-hover:text-content-primary"
                              }`}
                            />
                            <span className="truncate">{t(`nav.${item.key}`)}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="space-y-2 border-t border-border-default/70 p-3">
          <LanguageSwitcher />
          <Card variant="stat" className="flex items-center gap-2">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                connected
                  ? "animate-pulse-glow bg-status-success text-status-success"
                  : "bg-status-error"
              }`}
            />
            <span className="truncate text-display-xs text-content-tertiary">
              {connected ? t("common.connected") : t("common.disconnected")}
            </span>
            {!connected && (
              <CloudOff className="ms-auto h-3.5 w-3.5 shrink-0 text-status-error" />
            )}
          </Card>
        </div>
      </aside>

      {/* Main content */}
      <main
        id="main-content"
        className="min-w-0 flex-1 overflow-hidden pt-12 md:pt-0"
      >
        <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin">
          {children}
        </div>
      </main>
    </div>
  );
}
