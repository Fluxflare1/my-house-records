import { adminLogout } from "@/app/actions/admin-auth";
import { redirect } from "next/navigation";

export default async function LogoutPage() {
  await adminLogout();
  redirect("/");
}
