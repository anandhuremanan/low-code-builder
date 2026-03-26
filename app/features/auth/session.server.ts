import { createCookieSessionStorage, redirect } from "react-router";

type SessionUser = {
  username: string;
  role?: string;
};

type AuthSessionData = {
  accessToken?: string;
  refreshToken?: string;
  user?: SessionUser;
};

const authSessionStorage = createCookieSessionStorage<AuthSessionData>({
  cookie: {
    name: "__auth",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    secrets: [process.env.SESSION_SECRET || "dev-session-secret"],
    maxAge: 60 * 60 * 24 * 7,
  },
});

export async function getAuthSession(request: Request) {
  return authSessionStorage.getSession(request.headers.get("cookie"));
}

export async function createUserSession({
  request,
  accessToken,
  refreshToken,
  user,
  redirectTo,
}: {
  request: Request;
  accessToken: string;
  refreshToken?: string;
  user?: SessionUser;
  redirectTo: string;
}) {
  const session = await getAuthSession(request);
  session.set("accessToken", accessToken);

  if (refreshToken) {
    session.set("refreshToken", refreshToken);
  } else {
    session.unset("refreshToken");
  }

  if (user) {
    session.set("user", user);
  } else {
    session.unset("user");
  }

  throw redirect(redirectTo, {
    headers: {
      "Set-Cookie": await authSessionStorage.commitSession(session),
    },
  });
}

export async function destroyUserSession(request: Request, redirectTo = "/login") {
  const session = await getAuthSession(request);

  throw redirect(redirectTo, {
    headers: {
      "Set-Cookie": await authSessionStorage.destroySession(session),
    },
  });
}

export async function getAccessToken(request: Request) {
  const session = await getAuthSession(request);
  return session.get("accessToken") ?? null;
}

export async function getRefreshToken(request: Request) {
  const session = await getAuthSession(request);
  return session.get("refreshToken") ?? null;
}

export async function getSessionUser(request: Request) {
  const session = await getAuthSession(request);
  return (session.get("user") as SessionUser | undefined) ?? null;
}

export async function isAuthenticated(request: Request) {
  return Boolean(await getAccessToken(request));
}

export async function requireAuthenticatedUser(request: Request) {
  const accessToken = await getAccessToken(request);

  if (!accessToken) {
    throw redirect("/login");
  }

  return {
    accessToken,
    user: await getSessionUser(request),
  };
}

export async function redirectIfAuthenticated(request: Request) {
  if (await isAuthenticated(request)) {
    throw redirect("/dashboard");
  }

  return null;
}
