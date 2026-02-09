import jwt from "jsonwebtoken";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  tenantSlug: string;
  role: string;
  permissions: string[];
}

export function validateToken(token: string): AuthUser {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set");
  }

  try {
    const decoded = jwt.verify(token, secret) as Record<string, unknown>;
    return {
      id: decoded.sub as string,
      email: decoded.email as string,
      name: decoded.name as string,
      tenantId: decoded.tenantId as string,
      tenantSlug: decoded.tenantSlug as string,
      role: decoded.role as string,
      permissions: (decoded.permissions as string[]) || [],
    };
  } catch {
    throw new Error("Invalid or expired token");
  }
}

export function extractToken(authHeader: string | undefined): string {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }
  return authHeader.slice(7);
}

export function requirePermission(user: AuthUser, permission: string): void {
  if (user.role === "SUPER_ADMIN" || user.role === "OWNER") return;
  if (!user.permissions.includes(permission)) {
    throw new Error(`Missing permission: ${permission}`);
  }
}
