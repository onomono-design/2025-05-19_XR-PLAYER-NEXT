import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to the main player page
  redirect("/main-player")
}
