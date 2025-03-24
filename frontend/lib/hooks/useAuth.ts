import { useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";

export function useAuth() {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authenticationError, setAuthenticationError] = useState<string | null>(
    null
  );

  const login = async (credentials: { username: string; password: string }) => {
    setIsAuthenticating(true);
    setAuthenticationError(null);
    try {
      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthenticationError(data.error);
        return;
      }

      const { access, refresh } = data;
      Cookies.set("access", access);
      Cookies.set("refresh", refresh);
      router.push("/dashboard");
    } catch (error) {
      setAuthenticationError("Authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = Cookies.get("refresh");
      if (refreshToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
    } catch (error) {
      console.error("Token blacklist failed:", error);
    } finally {
      Cookies.remove("access");
      Cookies.remove("refresh");
      router.push("/login");
    }
  };

  return { isAuthenticating, login, authenticationError, logout };
}
