import Navbar from "@/components/Navbar";
import AmpForm from "@/components/AmpForm";

export default function NewAmpPage() {
  return (
    <>
      <Navbar />
      <main className="container">
        <div className="page-header">
          <h1>Add Amp</h1>
        </div>
        <AmpForm />
      </main>
    </>
  );
}
