import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDataSource } from "@/lib/db";
import { Guitar } from "@/entities/Guitar";
import Navbar from "@/components/Navbar";
import GuitarForm, { GuitarData } from "@/components/GuitarForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditGuitarPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const ds = await getDataSource();
  const guitar = await ds.getRepository(Guitar).findOne({
    where: { id, userId: session!.user.id },
  });

  if (!guitar) notFound();

  // Convert TypeORM entity to plain object before passing to a client component
  const data: GuitarData = {
    id: guitar.id,
    brand: guitar.brand,
    model: guitar.model,
    year: guitar.year,
    type: guitar.type,
    color: guitar.color,
    serialNumber: guitar.serialNumber,
    condition: guitar.condition,
    purchasePrice: guitar.purchasePrice,
    currentValue: guitar.currentValue,
    notes: guitar.notes,
    imageMimeType: guitar.imageMimeType,
  };

  return (
    <>
      <Navbar />
      <main className="container">
        <div className="page-header">
          <h1>Edit Guitar</h1>
        </div>
        <GuitarForm guitar={data} />
      </main>
    </>
  );
}
