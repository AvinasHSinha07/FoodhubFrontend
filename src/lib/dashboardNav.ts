export type DashboardNavItem = {
  href: string;
  label: string;
};

const ADMIN_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/admin", label: "Admin Console" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/providers", label: "Providers" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/orders", label: "Orders" },
];

const PROVIDER_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/provider/analytics", label: "Analytics" },
  { href: "/provider/orders", label: "Orders" },
  { href: "/provider/meals", label: "Meals" },
  { href: "/provider/profile", label: "Profile" },
];

const CUSTOMER_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/customer/orders", label: "Orders" },
  { href: "/customer/favorites", label: "Favorites" },
  { href: "/customer/profile", label: "Profile" },
];

export const getDashboardNavItems = (pathname: string): DashboardNavItem[] => {
  if (pathname.startsWith("/admin")) {
    return ADMIN_NAV_ITEMS;
  }

  if (pathname.startsWith("/provider")) {
    return PROVIDER_NAV_ITEMS;
  }

  return CUSTOMER_NAV_ITEMS;
};

export const isNavItemActive = (pathname: string, href: string): boolean => {
  if (pathname === href) {
    return true;
  }

  if (href === "/admin" || href === "/provider" || href === "/customer") {
    return pathname === href;
  }

  return pathname.startsWith(`${href}/`);
};
