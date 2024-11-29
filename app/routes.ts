import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("/", "routes/home.tsx"),
  route("/payment", "routes/payment/route.tsx")
] satisfies RouteConfig;
