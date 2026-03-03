"use client";

import Link from "next/link";
import { Guitar } from "@/entities/Guitar";
import ImageSlideshow from "./ImageSlideshow";

export default function GuitarCard({ guitar }: { guitar: Guitar }) {
  let urls: { id: string; url: string }[] = [];
  if (guitar.images && guitar.images.length > 0) {
    urls = [...guitar.images]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(img => ({ id: img.id, url: `/api/guitars/${guitar.id}/images/${img.id}` }));
  } else if (guitar.imageMimeType) {
    urls = [{ id: "legacy", url: `/api/guitars/${guitar.id}/image` }];
  }

  return (
    <Link href={`/guitars/${guitar.id}`} className="guitar-card">
      <div
        className="guitar-card-img-wrapper"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--surface)" }}
        onClick={(e) => {
          // If the user clicks on the slideshow arrows, don't trigger the Link
          if ((e.target as HTMLElement).tagName.toLowerCase() === 'button') {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {urls.length > 0 ? (
          <ImageSlideshow images={urls} alt={`${guitar.brand} ${guitar.model}`} isCard={true} />
        ) : (
          <div className="guitar-card-img guitar-card-img-placeholder">🎸</div>
        )}
      </div>
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
