import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PARENT_AUTH_COOKIE } from "@/lib/auth";
import { ParentCatalogManager } from "./catalog-manager";

export default async function ParentCatalogPage() {
  const cookieStore = await cookies();
  const authed = cookieStore.get(PARENT_AUTH_COOKIE)?.value === "1";

  if (!authed) {
    redirect("/parent");
  }

  return <ParentCatalogManager />;
}
