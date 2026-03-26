import { useRouteLoaderData } from "react-router";

type RootAuthData = {
  isAuthenticated?: boolean;
};

export function useIsAuthenticated() {
  const data = useRouteLoaderData("root") as RootAuthData | undefined;
  return Boolean(data?.isAuthenticated);
}
