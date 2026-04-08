import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { Guitar } from "@/entities/Guitar";
import Navbar from "@/components/Navbar";
import DeleteButton from "./DeleteButton";
import ImageSlideshow from "@/components/ImageSlideshow";

type Props = { params: Promise<{ id: string }> };

export default async function GuitarDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const ds = await getDataSource();
  const guitar = await ds.getRepository(Guitar).findOne({
    where: { id },
    relations: ["images"]
  });

  if (!guitar) notFound();

  const isOwner = session?.user?.id === guitar.userId;

  let urls: { id: string; url: string }[] = [];
  if (guitar.images && guitar.images.length > 0) {
    urls = guitar.images
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(img => ({ id: img.id, url: `/api/guitars/${guitar.id}/images/${img.id}` }));
  } else if (guitar.imageMimeType) {
    urls = [{ id: "legacy", url: `/api/guitars/${guitar.id}/image` }];
  }

  return (
    <>
      <Navbar />
      <main className="container">
        <div className="page-header">
          <Link href={`/users/${guitar.userId}`} className="btn btn-ghost btn-sm">
            ← Back to collection
          </Link>
          {isOwner && (
            <div className="page-header-actions">
              <Link href={`/guitars/${guitar.id}/edit`} className="btn btn-secondary btn-sm">
                Edit
              </Link>
              <DeleteButton id={guitar.id} />
            </div>
          )}
        </div>

        <div className="guitar-detail">
          {urls.length > 0 && (
            <div style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}>
              <ImageSlideshow images={urls} alt={`${guitar.brand} ${guitar.model}`} />
            </div>
          )}

          <div className="guitar-detail-info">
            <h1 className="guitar-detail-title">
              {guitar.brand} {guitar.model}
            </h1>

            <div className="guitar-detail-badges">
              <span className={`badge badge-type badge-${guitar.type}`}>{guitar.type}</span>
              <span className={`badge badge-condition badge-${guitar.condition}`}>{guitar.condition}</span>
            </div>

            <dl className="guitar-detail-specs">
              {guitar.year && (
                <>
                  <dt>Year</dt>
                  <dd>{guitar.year}</dd>
                </>
              )}
              {guitar.color && (
                <>
                  <dt>Color</dt>
                  <dd>{guitar.color}</dd>
                </>
              )}
              {guitar.serialNumber && (
                <>
                  <dt>Serial Number</dt>
                  <dd>{guitar.serialNumber}</dd>
                </>
              )}
              {guitar.madeIn && (
                <>
                  <dt>Made In</dt>
                  <dd>{guitar.madeIn}</dd>
                </>
              )}
              {guitar.body && (
                <>
                  <dt>Body Wood</dt>
                  <dd>{guitar.body}</dd>
                </>
              )}
              {guitar.top && (
                <>
                  <dt>Top Wood</dt>
                  <dd>{guitar.top}</dd>
                </>
              )}
              {guitar.neck && (
                <>
                  <dt>Neck Wood</dt>
                  <dd>{guitar.neck}</dd>
                </>
              )}
              {guitar.fretboard && (
                <>
                  <dt>Fretboard</dt>
                  <dd>{guitar.fretboard}</dd>
                </>
              )}
              {guitar.bridge && (
                <>
                  <dt>Bridge</dt>
                  <dd>{guitar.bridge}</dd>
                </>
              )}
              {guitar.nut && (
                <>
                  <dt>Nut</dt>
                  <dd>{guitar.nut}</dd>
                </>
              )}
              {guitar.neckPickup && (
                <>
                  <dt>Neck Pickup</dt>
                  <dd>{guitar.neckPickup}</dd>
                </>
              )}
              {guitar.middlePickup && (
                <>
                  <dt>Middle Pickup</dt>
                  <dd>{guitar.middlePickup}</dd>
                </>
              )}
              {guitar.bridgePickup && (
                <>
                  <dt>Bridge Pickup</dt>
                  <dd>{guitar.bridgePickup}</dd>
                </>
              )}
              {guitar.controls && (
                <>
                  <dt>Controls</dt>
                  <dd>{guitar.controls}</dd>
                </>
              )}
            </dl>

            {guitar.notes && (
              <div className="guitar-detail-notes">
                <h3>Notes</h3>
                <p>{guitar.notes}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
