export type UserRole = "SUPER_ADMIN" | "ADMIN" | "PROVIDER" | "CUSTOMER";

export const authRoutes = ["/login", "/register"];

export const isAuthRoute = (pathname: string): boolean => {
  return authRoutes.includes(pathname);
};

type RouteConfig = {
  exact: string[];
  pattern: RegExp[];
};

const adminProtectedRoutes: RouteConfig = {
  exact: ["/admin"],
  pattern: [/^\/admin\/.+/],
};

const providerProtectedRoutes: RouteConfig = {
  exact: ["/provider"],
  pattern: [/^\/provider\/.+/],
};

const customerProtectedRoutes: RouteConfig = {
  exact: ["/customer", "/checkout"],
  pattern: [/^\/customer\/.+/, /^\/checkout\/.+/],
};

const isRouteMatches = (pathname: string, routes: RouteConfig): boolean => {
  if (routes.exact.includes(pathname)) {
    return true;
  }

  return routes.pattern.some((pattern) => pattern.test(pathname));
};

export const getRouteOwner = (
  pathname: string
): "ADMIN" | "PROVIDER" | "CUSTOMER" | null => {
  if (isRouteMatches(pathname, adminProtectedRoutes)) {
    return "ADMIN";
  }

  if (isRouteMatches(pathname, providerProtectedRoutes)) {
    return "PROVIDER";
  }

  if (isRouteMatches(pathname, customerProtectedRoutes)) {
    return "CUSTOMER";
  }

  return null;
};

export const getDefaultDashboardRoute = (role: UserRole): string => {
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    return "/admin";
  }

  if (role === "PROVIDER") {
    return "/provider/orders";
  }

  if (role === "CUSTOMER") {
    return "/customer/orders";
  }

  return "/";
};

export const isValidRedirectForRole = (
  redirectPath: string,
  role: UserRole | null | undefined
): boolean => {
  if (!role) {
    return false;
  }

  const unifiedRole = role === "SUPER_ADMIN" ? "ADMIN" : role;
  const routeOwner = getRouteOwner(redirectPath.split("?")[0] || redirectPath);

  if (routeOwner === null) {
    return true;
  }

  return routeOwner === unifiedRole;
};
