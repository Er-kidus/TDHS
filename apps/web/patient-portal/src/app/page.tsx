import { redirect } from "next/navigation";
import { getPatientToken } from "@/lib/auth";

export default async function Home() {
  const token = await getPatientToken();
  redirect(token ? "/dashboard" : "/login");
}
