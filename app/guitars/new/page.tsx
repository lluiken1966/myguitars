import Navbar from "@/components/Navbar";
import GuitarForm from "@/components/GuitarForm";

export default function NewGuitarPage() {
  return (
    <>
      <Navbar />
      <main className="container">
        <div className="page-header">
          <h1>Add Guitar</h1>
        </div>
        <GuitarForm />
      </main>
    </>
  );
}
