"use client";

import { usePathname } from "next/navigation";
import SiteMenu from "./SiteMenu";

const HIDE_MENU_PATHS = new Set(["/login", "/signup"]);

export default function ConditionalSiteMenu() {
  const pathname = usePathname();
  if (HIDE_MENU_PATHS.has(pathname)) return null;
  return <SiteMenu />;
}
