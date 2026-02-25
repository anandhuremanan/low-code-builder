import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("configure", "routes/configure.tsx"),
  route("configure/header", "routes/configure.header.tsx"),
  route("configure/footer", "routes/configure.footer.tsx"),
  route("builder", "routes/builder.tsx"),
  route("builder/preview", "routes/builder.preview.tsx"),
] satisfies RouteConfig;
