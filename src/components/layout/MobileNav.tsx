import React, { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Package,
  TrendingUp,
  Users,
  Truck,
  DollarSign,
  ShoppingCart,
  Wallet,
  ChevronUp,
  ChevronDown,
  Package2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/Auth.Context";

/** NAV DATA */
const salesNavigation = [
  // { title: "Buat Pesanan", href: "/po-clients" },
  { title: "Penagihan Klien", href: "/po-client-collections" },
  { title: "Data Klien", href: "/clients" },
];

const adminNavigation = [
  { title: "Pesanan Klien", href: "/order-clients" },
  { title: "User Management", href: "/users" },
];

const driverNavigation = [{ title: "Aktivitas", href: "/activity-driver" }];

const warehouseNavigation = [
  { title: "Barang Masuk", href: "/incoming" },
  { title: "Barang Keluar", href: "/outgoing" },
];

const financeNavigation = [
  { title: "Uang Masuk", href: "/finance-in" },
  // { title: "Uang Keluar", href: "/finance-out" },
];

// const purchasingNavigation = [
//   { title: "Buat Pesanan", href: "/po-vendors" },
//   { title: "Vendor", href: "/vendors" },
// ];

export function MobileNav() {
  const { user } = useAuth();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const hasResponsibility = (code: string) =>
    user?.responsibilities?.some((r) => r.code === code);

  const isActive = (path: string) => location.pathname.startsWith(path);

  // Validasi responsibility untuk setiap menu
  const getAvailableMenus = useMemo(() => {
    const allMenus = [
      {
        key: "sales",
        title: "Sales",
        icon: Package2,
        items: salesNavigation,
        requiredResponsibility: "SALES",
      },
      {
        key: "admin",
        title: "Admin",
        icon: Users,
        items: adminNavigation,
        requiredResponsibility: "ADMIN",
      },
      {
        key: "logistik",
        title: "Logistik",
        icon: Truck,
        items: [],
        requiredResponsibility: ["DRIVER", "WAREHOUSE"], // Bisa DRIVER atau WAREHOUSE
      },
      {
        key: "finance",
        title: "Finance",
        icon: DollarSign,
        items: [],
        requiredResponsibility: ["FINANCE", "COLLECTION"], // Bisa FINANCE atau COLLECTION
      },
      // {
      //   key: "purchasing",
      //   title: "Purchasing",
      //   icon: ShoppingCart,
      //   items: purchasingNavigation,
      //   requiredResponsibility: "PURCHASING",
      // },
    ];

    // Filter menu berdasarkan responsibility user
    return allMenus.filter((menu) => {
      if (Array.isArray(menu.requiredResponsibility)) {
        // Jika requiredResponsibility adalah array, cek apakah user punya salah satu
        return menu.requiredResponsibility.some((resp) =>
          hasResponsibility(resp),
        );
      } else {
        // Jika requiredResponsibility adalah string, cek langsung
        return hasResponsibility(menu.requiredResponsibility);
      }
    });
  }, [user?.responsibilities]);

  // Cek parent active state
  const isParentActive = (menuKey: string) => {
    switch (menuKey) {
      case "sales":
        return salesNavigation.some((i) => isActive(i.href));
      case "admin":
        return adminNavigation.some((i) => isActive(i.href));
      case "logistik":
        return (
          driverNavigation.some((i) => isActive(i.href)) ||
          warehouseNavigation.some((i) => isActive(i.href))
        );
      case "finance":
        return financeNavigation.some((i) => isActive(i.href));
      // case "purchasing":
      //   return purchasingNavigation.some((i) => isActive(i.href));
      default:
        return false;
    }
  };

  // Dynamic grid columns berdasarkan jumlah menu yang tersedia
  const gridColsClass = useMemo(() => {
    const count = getAvailableMenus.length;
    switch (count) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-3";
      case 4:
        return "grid-cols-4";
      case 5:
        return "grid-cols-5";
      default:
        return "grid-cols-5";
    }
  }, [getAvailableMenus.length]);

  // Cek apakah user memiliki akses ke sub-menu tertentu
  const hasAccessToSubMenu = (menuKey: string, subMenuType?: string) => {
    switch (menuKey) {
      case "logistik":
        if (subMenuType === "driver") return hasResponsibility("DRIVER");
        if (subMenuType === "warehouse") return hasResponsibility("WAREHOUSE");
        return hasResponsibility("DRIVER") || hasResponsibility("WAREHOUSE");

      case "finance":
        if (subMenuType === "finance") return hasResponsibility("FINANCE");
        return hasResponsibility("FINANCE");

      default:
        return true;
    }
  };

  return (
    <>
      {/* Backdrop saat dropdown terbuka */}
      {openMenu && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-200"
          onClick={() => setOpenMenu(null)}
        />
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
        <div className={cn("grid gap-1 p-2", gridColsClass)}>
          {getAvailableMenus.map((menu) => {
            const parentActive = isParentActive(menu.key);

            return (
              <div key={menu.key} className="relative">
                <button
                  onClick={() =>
                    setOpenMenu(openMenu === menu.key ? null : menu.key)
                  }
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-1 w-full transition-all duration-200 rounded-lg group",
                    openMenu === menu.key || parentActive
                      ? "text-primary shadow-md"
                      : "text-muted-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "p-1.5 rounded-lg mb-1 transition-all duration-200",
                      openMenu === menu.key || parentActive
                        ? "bg-primary-foreground/20"
                        : "bg-muted group-hover:bg-accent",
                    )}
                  >
                    <menu.icon className="h-4 w-4" />
                  </div>

                  <span className="text-xs font-medium truncate max-w-[90%]">
                    {menu.title}
                  </span>

                  <div className="mt-0.5 transition-transform duration-200">
                    {openMenu === menu.key ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3 opacity-70" />
                    )}
                  </div>
                </button>

                {/* Dropdown */}
                {openMenu === menu.key && (
                  <div
                    className={cn(
                      "fixed bottom-28 left-1/2 -translate-x-1/2 z-[60]",
                      "w-[92%] max-w-md bg-popover border border-border rounded-xl shadow-xl",
                      "overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200",
                    )}
                  >
                    {/* Header */}
                    <div className="bg-primary/5 border-b border-border p-3">
                      <div className="flex items-center gap-2">
                        <menu.icon className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">
                          {menu.title}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {(() => {
                            if (menu.key === "logistik") {
                              const driverCount = hasAccessToSubMenu(
                                "logistik",
                                "driver",
                              )
                                ? driverNavigation.length
                                : 0;
                              const warehouseCount = hasAccessToSubMenu(
                                "logistik",
                                "warehouse",
                              )
                                ? warehouseNavigation.length
                                : 0;
                              return driverCount + warehouseCount;
                            } else if (menu.key === "finance") {
                              const financeCount = hasAccessToSubMenu(
                                "finance",
                                "finance",
                              )
                                ? financeNavigation.length
                                : 0;
                              return financeCount;
                            } else {
                              return menu.items.length;
                            }
                          })()}{" "}
                          items
                        </span>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-2 space-y-1">
                        {/* LOGISTIK: Driver + Warehouse dengan validasi */}
                        {menu.key === "logistik" && (
                          <>
                            {/* Driver Section - hanya tampil jika punya akses DRIVER */}
                            {hasAccessToSubMenu("logistik", "driver") && (
                              <div className="px-2 pt-2">
                                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
                                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                                  Driver
                                </div>
                                {driverNavigation.map((item) => (
                                  <NavLink
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setOpenMenu(null)}
                                    className={cn(
                                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px]",
                                      "hover:bg-accent hover:text-accent-foreground transition-all",
                                      isActive(item.href)
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-foreground",
                                    )}
                                  >
                                    <Truck className="h-3.5 w-3.5" />
                                    {item.title}
                                  </NavLink>
                                ))}
                              </div>
                            )}

                            {/* Warehouse Section - hanya tampil jika punya akses WAREHOUSE */}
                            {hasAccessToSubMenu("logistik", "warehouse") && (
                              <div className="px-2 pb-1">
                                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1 mt-2">
                                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                                  Warehouse
                                </div>
                                {warehouseNavigation.map((item) => (
                                  <NavLink
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setOpenMenu(null)}
                                    className={cn(
                                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px]",
                                      "hover:bg-accent hover:text-accent-foreground transition-all",
                                      isActive(item.href)
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-foreground",
                                    )}
                                  >
                                    <Package className="h-3.5 w-3.5" />
                                    {item.title}
                                  </NavLink>
                                ))}
                              </div>
                            )}
                          </>
                        )}

                        {/* FINANCE + COLLECTION digabung dengan validasi */}
                        {menu.key === "finance" && (
                          <>
                            {/* Finance Section - hanya tampil jika punya akses FINANCE */}
                            {hasAccessToSubMenu("finance", "finance") && (
                              <div className="px-2 pt-2">
                                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1">
                                  <div className="w-1 h-1 bg-yellow-500 rounded-full" />
                                  Finance
                                </div>
                                {financeNavigation.map((item) => (
                                  <NavLink
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setOpenMenu(null)}
                                    className={cn(
                                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px]",
                                      "hover:bg-accent hover:text-accent-foreground transition-all",
                                      isActive(item.href)
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-foreground",
                                    )}
                                  >
                                    <DollarSign className="h-3.5 w-3.5" />
                                    {item.title}
                                  </NavLink>
                                ))}
                              </div>
                            )}
                          </>
                        )}

                        {/* PURCHASING */}
                        {/* {menu.key === "purchasing" &&
                          purchasingNavigation.map((item) => (
                            <NavLink
                              key={item.href}
                              to={item.href}
                              onClick={() => setOpenMenu(null)}
                              className={cn(
                                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px]",
                                "hover:bg-accent hover:text-accent-foreground transition-all",
                                isActive(item.href)
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "text-foreground",
                              )}
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
                              {item.title}
                            </NavLink>
                          ))} */}

                        {/* DEFAULT: sales & admin items */}
                        {menu.key !== "logistik" &&
                          menu.key !== "finance" &&
                          menu.key !== "purchasing" &&
                          menu.items.map((item) => (
                            <NavLink
                              key={item.href}
                              to={item.href}
                              onClick={() => setOpenMenu(null)}
                              className={cn(
                                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px]",
                                "hover:bg-accent hover:text-accent-foreground transition-all",
                                isActive(item.href)
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "text-foreground",
                              )}
                            >
                              <menu.icon className="h-3.5 w-3.5" />
                              {item.title}
                            </NavLink>
                          ))}
                      </div>
                    </div>

                    <div className="border-t border-border p-2 bg-muted/20">
                      <button
                        onClick={() => setOpenMenu(null)}
                        className="w-full text-center text-xs text-muted-foreground py-1.5 hover:text-foreground transition-colors"
                      >
                        Tutup menu
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
}
