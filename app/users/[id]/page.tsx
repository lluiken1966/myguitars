import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { Guitar } from "@/entities/Guitar";
import { Amp } from "@/entities/Amp";
import { User } from "@/entities/User";
import GuitarCard from "@/components/GuitarCard";
import AmpCard from "@/components/AmpCard";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function UserOverviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: userId } = await params;
    const session = await getServerSession(authOptions);
    const ds = await getDataSource();

    const user = await ds.getRepository(User).findOne({ where: { id: userId } });

    if (!user) {
        notFound();
    }

    const guitarsRaw = await ds.getRepository(Guitar).find({
        where: { userId },
        order: { createdAt: "DESC" },
        relations: ["images"]
    });
    const guitars = JSON.parse(JSON.stringify(guitarsRaw)) as Guitar[];

    const ampsRaw = await ds.getRepository(Amp).find({
        where: { userId },
        order: { createdAt: "DESC" },
        relations: ["images"]
    });
    const amps = JSON.parse(JSON.stringify(ampsRaw)) as Amp[];

    const isOwner = session?.user?.id === userId;

    return (
        <>
            <Navbar />
            <main className="container">
                <div className="page-header">
                    <h1>{isOwner ? "My Collection" : `${user.name || user.email.split('@')[0]}'s Collection`}</h1>
                    {isOwner && (
                        <div style={{ display: "flex", gap: "8px" }}>
                            <Link href="/guitars/new" className="btn btn-primary">
                                + Add Guitar
                            </Link>
                            <Link href="/amps/new" className="btn btn-primary">
                                + Add Amp
                            </Link>
                        </div>
                    )}
                </div>

                {/* ── Guitars ───────────────────────────────────────────── */}
                <h2 style={{ marginTop: "2rem", marginBottom: "1.25rem" }}>Guitars</h2>
                {guitars.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-icon">🎸</p>
                        <h2>No guitars yet</h2>
                        {isOwner ? (
                            <>
                                <p>Start building your collection by adding your first guitar.</p>
                                <Link href="/guitars/new" className="btn btn-primary">
                                    Add your first guitar
                                </Link>
                            </>
                        ) : (
                            <p>This user hasn't added any guitars to their collection.</p>
                        )}
                    </div>
                ) : (
                    <div className="guitar-grid">
                        {guitars.map((g) => (
                            <GuitarCard key={g.id} guitar={g} />
                        ))}
                    </div>
                )}

                {/* ── Amps ──────────────────────────────────────────────── */}
                <h2 style={{ marginTop: "3rem", marginBottom: "1.25rem" }}>Amps</h2>
                {amps.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-icon">🎛️</p>
                        <h2>No amps yet</h2>
                        {isOwner ? (
                            <>
                                <p>Add your first amp to the collection.</p>
                                <Link href="/amps/new" className="btn btn-primary">
                                    Add your first amp
                                </Link>
                            </>
                        ) : (
                            <p>This user hasn't added any amps to their collection.</p>
                        )}
                    </div>
                ) : (
                    <div className="guitar-grid">
                        {amps.map((a) => (
                            <AmpCard key={a.id} amp={a} />
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
