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
  FileText,
  Settings,
  LogOut,
  Car,
  Landmark,
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
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview & Analytics",
  },
  {
    title: "Inventori Barang",
    href: "/stock-list",
    icon: Package,
    description: "Kelola Inventori",
  },
];

const warehouseNavigation = [
  {
    title: "Barang Masuk",
    href: "/incoming",
    icon: TrendingUp,
    description: "Supply Management",
  },
  {
    title: "Barang Keluar",
    href: "/outgoing",
    icon: TrendingDown,
    description: "Demand Management",
  },
  // {
  //   title: "Produk Distribusi",
  //   href: "/product-distributions",
  //   icon: TrendingDown,
  //   description: "Product Distributions",
  // },
];
// const salesNavigation = [
//   {
//     title: "Buat Pesanan",
//     href: "/po-clients",
//     icon: TrendingUp,
//     description: "Clients Order",
//   },
//   {
//     title: "Penagihan Klien",
//     href: "/po-client-collections",
//     icon: Users,
//     description: "Client Collections",
//   },
//   {
//     title: "Data Klien",
//     href: "/clients",
//     icon: Users,
//     description: "Client Management",
//   },
// ];
const adminNavigation = [
  {
    title: "Pesanan Klien",
    href: "/order-clients",
    icon: TrendingUp,
    description: "Clients Order",
  },
  {
    title: "User Management",
    href: "/users",
    icon: Users,
    description: "Kelola Pengguna",
  },
  {
    title: "Pengaturan",
    href: "/settings",
    icon: Settings,
    description: "System Settings",
  },
];

const financeNavigation = [
  {
    title: "Uang Masuk",
    href: "/finance-in",
    icon: DollarSign,
    description: "Revenue Tracking",
  },
  {
    title: "Uang Keluar",
    href: "/finance-out",
    icon: CreditCard,
    description: "Expense Tracking",
  },
  {
    title: "Bank",
    href: "/manage-banks",
    icon: Landmark,
    description: "Kelola Rekening Bank",
  },
  // {
  //   title: "Pesanan Perusahaan",
  //   href: "/po-vendors-received",
  //   icon: TrendingUp,
  //   description: "Vendor Order received",
  // },
];
// const purchasingNavigation = [
//   {
//     title: "Buat Pesanan",
//     href: "/po-vendors",
//     icon: TrendingUp,
//     description: "Vendor Order",
//   },
//   {
//     title: "supplier",
//     href: "/vendors",
//     icon: TrendingUp,
//     description: "Data Vendor",
//   },
//   {
//     title: "Inventori Barang",
//     href: "/stock-list",
//     icon: Package,
//     description: "Kelola Inventori",
//   },
// ];

// const managementNavigation = [
//   {
//     title: "Laporan",
//     href: "/reports",
//     icon: FileText,
//     description: "Export & Analytics",
//   },
// ];
// const driverNavigation = [
//   {
//     title: "Pengiriman",
//     href: "/activity-driver",
//     icon: Car,
//     description: "Activity Delivery",
//   },
// ];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const getNavLinkClass = ({ isActive }: NavLinkRenderProps) =>
    cn(
      "flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-normal",
      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      isActive
        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
        : "text-sidebar-foreground",
    );

  const hasResponsibility = (code: string) =>
    user?.responsibilities?.some((r) => r.code === code);

  const navigate = useNavigate();
  const leave = async () => {
    logout();
    navigate("/login");
  };
  const { company } = useCompany();
  return (
    <Sidebar
      className={cn(
        "transition-all duration-normal border-r border-sidebar-border bg-sidebar",
        collapsed ? "w-14" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg">
                <img src={company?.image || ksmLogo} className="w-12" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">
                  {company?.name}
                </h1>
                <p className="text-xs text-sidebar-foreground/60">v1.0.1</p>
              </div>
            </div>
          )}
          <SidebarTrigger className="h-8 w-8" />
        </div>

        <SidebarContent className="flex-1 px-3 py-4">
          {/* Main Navigation */}
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel>Main</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavigation.map((item) => (
                  <NavLink to={item.href} className={getNavLinkClass}>
                    <item.icon
                      className={cn("h-4 w-4", !collapsed && "mr-3")}
                    />
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
          {/* Warehouse */}
          {hasResponsibility("WAREHOUSE") && (
            <SidebarGroup>
              {!collapsed && <SidebarGroupLabel>Gudang</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {warehouseNavigation.map((item) => (
                    <NavLink to={item.href} className={getNavLinkClass}>
                      <item.icon
                        className={cn("h-4 w-4", !collapsed && "mr-3")}
                      />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{item.title}</p>
                          <p className="text-xs  truncate">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </NavLink>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
          {/* Finance */}
          {hasResponsibility("FINANCE") && (
            <SidebarGroup>
              {!collapsed && <SidebarGroupLabel>Keuangan</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {financeNavigation.map((item) => (
                    <NavLink to={item.href} className={getNavLinkClass}>
                      <item.icon
                        className={cn("h-4 w-4", !collapsed && "mr-3")}
                      />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{item.title}</p>
                          <p className="text-xs  truncate">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </NavLink>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
          {/* Finance */}
          {/* {hasResponsibility("PURCHASING") && (
            <SidebarGroup>
              {!collapsed && <SidebarGroupLabel>Purchasing</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {purchasingNavigation.map((item) => (
                    <NavLink to={item.href} className={getNavLinkClass}>
                      <item.icon
                        className={cn("h-4 w-4", !collapsed && "mr-3")}
                      />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{item.title}</p>
                          <p className="text-xs  truncate">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </NavLink>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )} */}
          {/* Management - Only for admin/manager */}
          {/* {(user?.role === "admin" || user?.role === "manager") && ( */}
          {/* <SidebarGroup>
            {!collapsed && <SidebarGroupLabel>Manajemen</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {managementNavigation.map((item) => (
                  <NavLink to={item.href} className={getNavLinkClass}>
                    <item.icon
                      className={cn("h-4 w-4", !collapsed && "mr-3")}
                    />
                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{item.title}</p>
                        <p className="text-xs  truncate">{item.description}</p>
                      </div>
                    )}
                  </NavLink>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup> */}
          {/* )} */}
          {/* {(user?.role === "admin" || user?.role === "manager") && ( */}
          {/* driver */}
          {/* {hasResponsibility("DRIVER") && (
            <SidebarGroup>
              {!collapsed && <SidebarGroupLabel>Driver</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {driverNavigation.map((item) => (
                    <NavLink to={item.href} className={getNavLinkClass}>
                      <item.icon
                        className={cn("h-4 w-4", !collapsed && "mr-3")}
                      />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{item.title}</p>
                          <p className="text-xs  truncate">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </NavLink>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )} */}
          {/* Sales */}
          {/* {hasResponsibility("SALES") && (
            <SidebarGroup>
              {!collapsed && <SidebarGroupLabel>Sales</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {salesNavigation.map((item) => (
                    <NavLink to={item.href} className={getNavLinkClass}>
                      <item.icon
                        className={cn("h-4 w-4", !collapsed && "mr-3")}
                      />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{item.title}</p>
                          <p className="text-xs  truncate">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </NavLink>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )} */}
          {/* )} */}
          {/* {(user?.role === "admin" || user?.role === "manager") && ( */}
          {/* Admin */}
          {hasResponsibility("ADMIN") && (
            <SidebarGroup>
              {!collapsed && <SidebarGroupLabel>Admin</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavigation.map((item) => (
                    <NavLink to={item.href} className={getNavLinkClass}>
                      <item.icon
                        className={cn("h-4 w-4", !collapsed && "mr-3")}
                      />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{item.title}</p>
                          <p className="text-xs  truncate">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </NavLink>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
          {/* )} */}
        </SidebarContent>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-sidebar-border">
          {/* {!collapsed && user && (
            <div className="mb-3 p-3 bg-sidebar-accent rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 capitalize truncate">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          )} */}

          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={leave}
            className={cn(
              "w-full text-destructive hover:text-destructive hover:bg-destructive/10",
              collapsed ? "h-8 w-8" : "justify-start",
            )}
          >
            <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && "Logout"}
          </Button>
        </div>
      </div>
    </Sidebar>
  );
}
