import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/loginPage.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("api/builder-ai", "routes/api.builder-ai.ts"),
  route("configure/:appId", "routes/configure.$appId.tsx"),
  route("configure/header", "routes/configure.header.tsx"),
  route("configure/footer", "routes/configure.footer.tsx"),
  route("configure/sidebar-left", "routes/configure.sidebar-left.tsx"),
  route("configure/sidebar-right", "routes/configure.sidebar-right.tsx"),
  route("builder", "routes/builder.tsx"),
  route("builder/preview", "routes/builder.preview.tsx"),
] satisfies RouteConfig;
