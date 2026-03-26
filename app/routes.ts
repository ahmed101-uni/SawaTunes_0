import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("songs", "routes/songs.tsx"),
	route("artists", "routes/artists.tsx"),
	route("charity", "routes/charity.tsx"),
	route("admin/login", "routes/admin-login.tsx"),
	route("admin", "routes/admin-dashboard.tsx"),
] satisfies RouteConfig;
