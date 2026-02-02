"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { checkSession, getMe } from "@/lib/api/clientApi";

const privateRoutes = ["/notes", "/profile"];

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, setUser, clearIsAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    const verifySession = async () => {
      try {
        const session = await checkSession();
        if (session.success) {
          const user = await getMe();
          setUser(user);
        } else {
          clearIsAuthenticated();
          if (isPrivateRoute) {
            router.push("/sign-in");
          }
        }
      } catch {
        clearIsAuthenticated();
        if (isPrivateRoute) {
          router.push("/sign-in");
        }
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [pathname, isPrivateRoute, router, setUser, clearIsAuthenticated]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  if (isPrivateRoute && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
