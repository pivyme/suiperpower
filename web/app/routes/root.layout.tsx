import { Outlet } from "react-router";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Suiperpower" },
    { name: "description", content: "All SUI skills in one command" },
  ];
}

export default function RootLayout() {
  return <Outlet />;
}
