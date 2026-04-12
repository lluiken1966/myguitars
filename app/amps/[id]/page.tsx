import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { Amp } from "@/entities/Amp";
import Navbar from "@/components/Navbar";
import DeleteAmpButton from "./DeleteButton";
import ImageSlideshow from "@/components/ImageSlideshow";

type Props = { params: Promise<{ id: string }> };

export default async function AmpDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const ds = await getDataSource();
  const amp = await ds.getRepository(Amp).findOne({
    where: { id },
    relations: ["images"],
  });

  if (!amp) notFound();

  const isOwner = session?.user?.id === amp.userId;

  const urls =
    amp.images && amp.images.length > 0
      ? amp.images
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(img => ({ id: img.id, url: `/api/amps/${amp.id}/images/${img.id}` }))
      : [];

  return (
    <>
      <Navbar />
      <main className="container">
        <div className="page-header">
          <Link href={`/users/${amp.userId}`} className="btn btn-ghost btn-sm">
            ← Back to collection
          </Link>
          {isOwner && (
            <div className="page-header-actions">
              <Link href={`/amps/${amp.id}/edit`} className="btn btn-secondary btn-sm">
                Edit
              </Link>
              <DeleteAmpButton id={amp.id} />
            </div>
          )}
        </div>

        <div className="guitar-detail">
          {urls.length > 0 && (
            <div style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}>
              <ImageSlideshow images={urls} alt={`${amp.brand} ${amp.model}`} />
            </div>
          )}

          <div className="guitar-detail-info">
            <h1 className="guitar-detail-title">
              {amp.brand} {amp.model}
            </h1>

            <div className="guitar-detail-badges">
              <span className={`badge badge-type badge-${amp.type}`}>{amp.type}</span>
              <span className={`badge badge-condition badge-${amp.condition}`}>{amp.condition}</span>
            </div>

            <div className="guitar-detail-section">
              <h3>General</h3>
              <dl className="guitar-detail-specs">
                <dt>Year</dt>
                <dd>{amp.year || "-"}</dd>
                <dt>Color / Tolex</dt>
                <dd>{amp.color || "-"}</dd>
                <dt>Serial Number</dt>
                <dd>{amp.serialNumber || "-"}</dd>
                <dt>Made In</dt>
                <dd>{amp.madeIn || "-"}</dd>
              </dl>
            </div>

            <div className="guitar-detail-section">
              <h3>Power &amp; Electronics</h3>
              <dl className="guitar-detail-specs">
                <dt>Wattage</dt>
                <dd>{amp.wattage || "-"}</dd>
                <dt>Channels</dt>
                <dd>{amp.channels || "-"}</dd>
                <dt>Preamp Tubes</dt>
                <dd>{amp.preampTubes || "-"}</dd>
                <dt>Power Tubes</dt>
                <dd>{amp.powerTubes || "-"}</dd>
                <dt>Rectifier</dt>
                <dd>{amp.rectifier || "-"}</dd>
                <dt>Output Transformer</dt>
                <dd>{amp.outputTransformer || "-"}</dd>
              </dl>
            </div>

            <div className="guitar-detail-section">
              <h3>Speaker</h3>
              <dl className="guitar-detail-specs">
                <dt>Speaker Brand</dt>
                <dd>{amp.speakerBrand || "-"}</dd>
                <dt>Speaker Model</dt>
                <dd>{amp.speakerModel || "-"}</dd>
                <dt>Speaker Size</dt>
                <dd>{amp.speakerSize || "-"}</dd>
                <dt>Configuration</dt>
                <dd>{amp.speakerCount || "-"}</dd>
                <dt>Impedance</dt>
                <dd>{amp.impedance || "-"}</dd>
              </dl>
            </div>

            <div className="guitar-detail-section">
              <h3>Cabinet</h3>
              <dl className="guitar-detail-specs">
                <dt>Cabinet Material</dt>
                <dd>{amp.cabinetMaterial || "-"}</dd>
                <dt>Baffle</dt>
                <dd>{amp.baffle || "-"}</dd>
                <dt>Covering / Finish</dt>
                <dd>{amp.finishType || "-"}</dd>
              </dl>
            </div>

            <div className="guitar-detail-section">
              <h3>Controls &amp; Effects</h3>
              <dl className="guitar-detail-specs">
                <dt>Controls</dt>
                <dd>{amp.controls || "-"}</dd>
                <dt>Built-in Effects</dt>
                <dd>{amp.builtInEffects || "-"}</dd>
                <dt>Effects Loop</dt>
                <dd>{amp.effectsLoop || "-"}</dd>
                <dt>Footswitch</dt>
                <dd>{amp.footswitch || "-"}</dd>
              </dl>
            </div>

            <div className="guitar-detail-section">
              <h3>Connections</h3>
              <dl className="guitar-detail-specs">
                <dt>Inputs</dt>
                <dd>{amp.inputs || "-"}</dd>
                <dt>Outputs</dt>
                <dd>{amp.outputs || "-"}</dd>
              </dl>
            </div>

            <div className="guitar-detail-notes">
              <h3>Notes</h3>
              <p>{amp.notes || "-"}</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
