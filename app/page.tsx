import { getDataSource } from "@/lib/db";
import { User } from "@/entities/User";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default async function Home() {
  const ds = await getDataSource();
  const users = await ds.getRepository(User).find({
    order: { name: "ASC", email: "ASC" },
  });

  return (
    <>
      <Navbar />
      <main className="container">
        <div className="landing-hero" style={{ paddingBottom: '2rem' }}>
          <h1 className="landing-title">🎸 My Guitars Directory</h1>
          <p className="landing-subtitle">Browse guitar collections from players around the world.</p>
        </div>

        <div className="users-list">
          <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>
            Collectors
          </h2>
          {users.length === 0 ? (
            <p>No collectors found.</p>
          ) : (
            <ul className="user-list-grid">
              {users.map((user) => (
                <li key={user.id}>
                  <Link href={`/users/${user.id}`} className="user-card-link">
                    <h3>{user.name || user.email.split('@')[0]}</h3>
                    <p className="user-card-subtitle">View their guitar collection</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
