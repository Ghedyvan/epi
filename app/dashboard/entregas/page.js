import { redirect } from "next/navigation";

export default function EntregasRedirect() {
  redirect("/dashboard/lancamentos");
}
