import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { Guitar } from "@/entities/Guitar";
import GuitarCard from "@/components/GuitarCard";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default async function CollectionPage() {
  const session = await getServerSession(authOptions);
  const ds = await getDataSource();
  const guitars = await ds.getRepository(Guitar).find({
    where: { userId: session!.user.id },
    order: { createdAt: "DESC" },
  });

  return (
    <>
      <Navbar />
      <main className="container">
        <div className="page-header">
          <h1>My Collection</h1>
          <Link href="/collection/new" className="btn btn-primary">
            + Add Guitar
          </Link>
        </div>

        {guitars.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">🎸</p>
            <h2>No guitars yet</h2>
            <p>Start building your collection by adding your first guitar.</p>
            <Link href="/collection/new" className="btn btn-primary">
              Add your first guitar
            </Link>
          </div>
        ) : (
          <div className="guitar-grid">
            {guitars.map((g) => (
              <GuitarCard key={g.id} guitar={g} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
