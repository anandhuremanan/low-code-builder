import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/_public.tsx", [index("routes/home.tsx")]),
  layout("routes/_auth.tsx", [route("login", "routes/loginPage.tsx")]),
  layout("routes/_app.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
  ]),
  layout("routes/_builder.tsx", [
    route("configure", "routes/configure.tsx"),
    route("configure/:appId", "routes/configure.$appId.tsx"),
    route("builder", "routes/builder.tsx"),
    route("builder/preview", "routes/builder.preview.tsx"),
    route("configure/header", "routes/configure.header.tsx"),
    route("configure/footer", "routes/configure.footer.tsx"),
    route("configure/sidebar-left", "routes/configure.sidebar-left.tsx"),
    route("configure/sidebar-right", "routes/configure.sidebar-right.tsx"),
  ]),
  route("api/builder-ai", "routes/api.builder-ai.ts"),
] satisfies RouteConfig;
