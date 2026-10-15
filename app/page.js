import { redirect } from "next/navigation";

// "/" has no page of its own: send people to the login page.
// (The login page forwards already-signed-in users to the dashboard.)
export default function Home() {
  redirect("/login");
}