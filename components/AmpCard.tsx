"use client";

import Link from "next/link";
import { Amp } from "@/entities/Amp";
import ImageSlideshow from "./ImageSlideshow";

export default function AmpCard({ amp }: { amp: Amp }) {
  const urls =
    amp.images && amp.images.length > 0
      ? [...amp.images]
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(img => ({ id: img.id, url: `/api/amps/${amp.id}/images/${img.id}` }))
      : [];

  return (
    <Link href={`/amps/${amp.id}`} className="guitar-card">
      <div
        className="guitar-card-img-wrapper"
        onClick={(e) => {
          if ((e.target as HTMLElement).tagName.toLowerCase() === "button") {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {urls.length > 0 ? (
          <ImageSlideshow images={urls} alt={`${amp.brand} ${amp.model}`} isCard={true} />
        ) : (
          <div className="guitar-card-img guitar-card-img-placeholder">🎛️</div>
        )}
      </div>
      <div className="guitar-card-body">
        <h3 className="guitar-card-title">
          {amp.brand} {amp.model}
        </h3>
        {amp.year && <p className="guitar-card-year">{amp.year}</p>}
        <div className="guitar-card-badges">
          <span className={`badge badge-type badge-${amp.type}`}>{amp.type}</span>
          <span className={`badge badge-condition badge-${amp.condition}`}>{amp.condition}</span>
        </div>
        {amp.wattage && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>{amp.wattage}</p>}
      </div>
    </Link>
  );
}
