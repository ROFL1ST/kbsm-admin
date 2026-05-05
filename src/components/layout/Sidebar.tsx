import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Users,
  Settings,
  LogOut,
  Landmark,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/Auth.Context";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import ksmLogo from "../../assets/ksm_1.png";
import { useCompany } from "@/contexts/Company.Context";

const mainNavigation = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "Overview & Analytics" },
  { title: "Inventori Barang", href: "/stock-list", icon: Package, description: "Kelola Inventori" },
  { title: "Blog", href: "/blog", icon: BookOpen, description: "Kelola Artikel & Konten" },
];

const warehouseNavigation = [
  { title: "Barang Masuk", href: "/incoming", icon: TrendingUp, description: "Supply Management" },
  { title: "Barang Keluar", href: "/outgoing", icon: TrendingDown, description: "Demand Management" },
];

const adminNavigation = [
  { title: "Pesanan Klien", href: "/order-clients", icon: TrendingUp, description: "Clients Order" },
  { title: "User Management", href: "/users", icon: Users, description: "Kelola Pengguna" },
  { title: "Pengaturan", href: "/settings", icon: Settings, description: "System Settings" },
];

const financeNavigation = [
  { title: "Uang Masuk", href: "/finance-in", icon: DollarSign, description: "Revenue Tracking" },
  { title: "Uang Keluar", href: "/finance-out", icon: CreditCard, description: "Expense Tracking" },
  { title: "Bank", href: "/manage-banks", icon: Landmark, description: "Kelola Rekening Bank" },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const getNavLinkClass = ({ isActive }: NavLinkRenderProps) =>
    cn(
      "flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-normal",
      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      isActive ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" : "text-sidebar-foreground",
    );

  const hasResponsibility = (code: string) => user?.responsibilities?.some((r) => r.code === code);

  const navigate = useNavigate();
  const leave = async () => { logout(); navigate("/login"); };
  const { company } = useCompany();

  return (
    <Sidebar className={cn("transition-all duration-normal border-r border-sidebar-border bg-sidebar", collapsed ? "w-14" : "w-64")}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg">
                <img src={company?.image || ksmLogo} className="w-12" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">{company?.name}</h1>
                <p className="text-xs text-sidebar-foreground/60">v1.0.1</p>
              </div>
            </div>
          )}
          <SidebarTrigger className="h-8 w-8" />
        </div>

        <SidebarContent className="flex-1 px-3 py-4">
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel>Main</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavigation.map((item) => (
                  <NavLink key={item.href} to={item.href} className={getNavLinkClass}>
                    <item.icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{item.title}</p>
                        <p className="text-xs truncate">{item.description}</p>
                      </div>
                    )}
                  </NavLink>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {hasResponsibility("WAREHOUSE") && (
            <SidebarGroup>
              {!collapsed && <SidebarGroupLabel>Gudang</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {warehouseNavigation.map((item) => (
                    <NavLink key={item.href} to={item.href} className={getNavLinkClass}>
                      <item.icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{item.title}</p>
                          <p className="text-xs truncate">{item.description}</p>
                        </div>
                      )}
                    </NavLink>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {hasResponsibility("FINANCE") && (
            <SidebarGroup>
              {!collapsed && <SidebarGroupLabel>Keuangan</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {financeNavigation.map((item) => (
                    <NavLink key={item.href} to={item.href} className={getNavLinkClass}>
                      <item.icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{item.title}</p>
                          <p className="text-xs truncate">{item.description}</p>
                        </div>
                      )}
                    </NavLink>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {hasResponsibility("ADMIN") && (
            <SidebarGroup>
              {!collapsed && <SidebarGroupLabel>Admin</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavigation.map((item) => (
                    <NavLink key={item.href} to={item.href} className={getNavLinkClass}>
                      <item.icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{item.title}</p>
                          <p className="text-xs truncate">{item.description}</p>
                        </div>
                      )}
                    </NavLink>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={leave}
            className={cn("w-full text-destructive hover:text-destructive hover:bg-destructive/10", collapsed ? "h-8 w-8" : "justify-start")}
          >
            <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && "Logout"}
          </Button>
        </div>
      </div>
    </Sidebar>
  );
}
