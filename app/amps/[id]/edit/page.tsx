import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { Amp } from "@/entities/Amp";
import Navbar from "@/components/Navbar";
import AmpForm, { AmpData } from "@/components/AmpForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditAmpPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) notFound();

  const ds = await getDataSource();
  const amp = await ds.getRepository(Amp).findOne({
    where: { id, userId: session.user.id },
  });

  if (!amp) notFound();

  // Convert TypeORM entity to plain object before passing to a client component
  const data: AmpData = {
    id: amp.id,
    brand: amp.brand,
    model: amp.model,
    year: amp.year,
    type: amp.type,
    color: amp.color,
    serialNumber: amp.serialNumber,
    condition: amp.condition,
    wattage: amp.wattage,
    channels: amp.channels,
    preampTubes: amp.preampTubes,
    powerTubes: amp.powerTubes,
    rectifier: amp.rectifier,
    outputTransformer: amp.outputTransformer,
    speakerBrand: amp.speakerBrand,
    speakerModel: amp.speakerModel,
    speakerSize: amp.speakerSize,
    speakerCount: amp.speakerCount,
    impedance: amp.impedance,
    cabinetMaterial: amp.cabinetMaterial,
    baffle: amp.baffle,
    finishType: amp.finishType,
    madeIn: amp.madeIn,
    controls: amp.controls,
    builtInEffects: amp.builtInEffects,
    effectsLoop: amp.effectsLoop,
    footswitch: amp.footswitch,
    inputs: amp.inputs,
    outputs: amp.outputs,
    notes: amp.notes,
  };

  return (
    <>
      <Navbar />
      <main className="container">
        <div className="page-header">
          <h1>Edit Amp</h1>
        </div>
        <AmpForm amp={data} />
      </main>
    </>
  );
}
