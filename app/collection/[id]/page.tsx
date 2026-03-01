import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { Guitar } from "@/entities/Guitar";
import Navbar from "@/components/Navbar";
import DeleteButton from "./DeleteButton";

type Props = { params: Promise<{ id: string }> };

export default async function GuitarDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const ds = await getDataSource();
  const guitar = await ds.getRepository(Guitar).findOne({
    where: { id, userId: session!.user.id },
  });

  if (!guitar) notFound();

  return (
    <>
      <Navbar />
      <main className="container">
        <div className="page-header">
          <Link href="/collection" className="btn btn-ghost btn-sm">
            ← Back to collection
          </Link>
          <div className="page-header-actions">
            <Link href={`/collection/${guitar.id}/edit`} className="btn btn-secondary btn-sm">
              Edit
            </Link>
            <DeleteButton id={guitar.id} />
          </div>
        </div>

        <div className="guitar-detail">
          {guitar.imageMimeType && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/guitars/${guitar.id}/image`} alt={`${guitar.brand} ${guitar.model}`} className="guitar-detail-img" />
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
              {guitar.purchasePrice != null && (
                <>
                  <dt>Purchase Price</dt>
                  <dd>${Number(guitar.purchasePrice).toFixed(2)}</dd>
                </>
              )}
              {guitar.currentValue != null && (
                <>
                  <dt>Current Value</dt>
                  <dd>${Number(guitar.currentValue).toFixed(2)}</dd>
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
