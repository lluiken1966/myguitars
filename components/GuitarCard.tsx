import Link from "next/link";
import { Guitar } from "@/entities/Guitar";

export default function GuitarCard({ guitar }: { guitar: Guitar }) {
  return (
    <Link href={`/collection/${guitar.id}`} className="guitar-card">
      {guitar.imageMimeType ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/guitars/${guitar.id}/image`} alt={`${guitar.brand} ${guitar.model}`} className="guitar-card-img" />
      ) : (
        <div className="guitar-card-img guitar-card-img-placeholder">🎸</div>
      )}
      <div className="guitar-card-body">
        <h3 className="guitar-card-title">
          {guitar.brand} {guitar.model}
        </h3>
        {guitar.year && <p className="guitar-card-year">{guitar.year}</p>}
        <div className="guitar-card-badges">
          <span className={`badge badge-type badge-${guitar.type}`}>{guitar.type}</span>
          <span className={`badge badge-condition badge-${guitar.condition}`}>{guitar.condition}</span>
        </div>
      </div>
    </Link>
  );
}
