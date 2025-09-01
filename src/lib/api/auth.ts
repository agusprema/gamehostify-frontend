import { api, setAccessToken } from "./api";

export async function login(email: string, password: string) {
  const { data } = await api.post(
    "/api/auth/login",
    { email, password },
    { withCredentials: true }
  );
  const token: string | null = data?.data?.token ?? data?.token ?? null;
  const user = data?.data?.user ?? data?.user ?? null;
  if (token) setAccessToken(token);
  return { data, token, user } as { data: unknown; token: string | null; user: unknown };
}

export async function me() {
  const { data } = await api.get("/api/auth/me");
  return data;
}

export async function logout() {
  try {
    await api.post("/api/auth/logout", {}, { withCredentials: true });
  } finally {
    setAccessToken(null);
  }
}
