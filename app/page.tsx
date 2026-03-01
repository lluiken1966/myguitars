import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/collection");
  }

  return (
    <main className="landing">
      <div className="landing-hero">
        <h1 className="landing-title">🎸 My Guitars</h1>
        <p className="landing-subtitle">Track and manage your guitar collection in one place.</p>
        <Link href="/auth/signin" className="btn btn-primary btn-lg">
          Sign in to get started
        </Link>
      </div>
    </main>
  );
}
