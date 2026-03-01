"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { GuitarType, GuitarCondition } from "@/entities/Guitar";

export type GuitarData = {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  type: GuitarType;
  color: string | null;
  serialNumber: string | null;
  condition: GuitarCondition;
  purchasePrice: number | null;
  currentValue: number | null;
  notes: string | null;
  imageMimeType: string | null;
};

type GuitarFormData = {
  brand: string;
  model: string;
  year: string;
  type: GuitarType;
  color: string;
  serialNumber: string;
  condition: GuitarCondition;
  purchasePrice: string;
  currentValue: string;
  notes: string;
};

type Props = {
  guitar?: GuitarData;
};

const TYPES: GuitarType[] = ["electric", "acoustic", "bass", "classical", "other"];
const CONDITIONS: GuitarCondition[] = ["mint", "excellent", "good", "fair", "poor"];

export default function GuitarForm({ guitar }: Props) {
  const router = useRouter();
  const isEdit = !!guitar;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<GuitarFormData>({
    brand: guitar?.brand ?? "",
    model: guitar?.model ?? "",
    year: guitar?.year?.toString() ?? "",
    type: guitar?.type ?? "electric",
    color: guitar?.color ?? "",
    serialNumber: guitar?.serialNumber ?? "",
    condition: guitar?.condition ?? "good",
    purchasePrice: guitar?.purchasePrice?.toString() ?? "",
    currentValue: guitar?.currentValue?.toString() ?? "",
    notes: guitar?.notes ?? "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const hasExistingImage = isEdit && !!guitar.imageMimeType && !removeImage;
  const existingImageSrc = guitar ? `/api/guitars/${guitar.id}/image` : undefined;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setRemoveImage(false);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      brand: form.brand,
      model: form.model,
      year: form.year !== "" ? Number(form.year) : null,
      type: form.type,
      color: form.color || null,
      serialNumber: form.serialNumber || null,
      condition: form.condition,
      purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : null,
      currentValue: form.currentValue ? Number(form.currentValue) : null,
      notes: form.notes || null,
    };

    const url = isEdit ? `/api/guitars/${guitar.id}` : "/api/guitars";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }

      const saved: { id: string } = await res.json();
      const guitarId = saved.id;

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const imgRes = await fetch(`/api/guitars/${guitarId}/image`, {
          method: "POST",
          body: formData,
        });
        if (!imgRes.ok) {
          const data = await imgRes.json();
          setLoading(false);
          if (!isEdit) {
            // Guitar was created — go to its edit page so a retry doesn't create a duplicate
            router.push(`/collection/${guitarId}/edit`);
          } else {
            setError(data.error ?? "Image upload failed. Please try again.");
          }
          return;
        }
      } else if (removeImage && isEdit) {
        await fetch(`/api/guitars/${guitarId}/image`, { method: "DELETE" });
      }

      setLoading(false);
      router.push(`/collection/${guitarId}`);
      router.refresh();
    } catch {
      setLoading(false);
      setError("Network error. Please check your connection and try again.");
    }
  }

  return (
    <form className="guitar-form" onSubmit={handleSubmit}>
      {error && <p className="form-error">{error}</p>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="brand">Brand *</label>
          <input id="brand" name="brand" value={form.brand} onChange={handleChange} required placeholder="e.g. Fender" />
        </div>
        <div className="form-group">
          <label htmlFor="model">Model *</label>
          <input id="model" name="model" value={form.model} onChange={handleChange} required placeholder="e.g. Stratocaster" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="type">Type *</label>
          <select id="type" name="type" value={form.type} onChange={handleChange} required>
            {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="condition">Condition *</label>
          <select id="condition" name="condition" value={form.condition} onChange={handleChange} required>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="year">Year</label>
          <input id="year" name="year" type="number" value={form.year} onChange={handleChange} placeholder="e.g. 1965" min="1900" max="2100" />
        </div>
        <div className="form-group">
          <label htmlFor="color">Color</label>
          <input id="color" name="color" value={form.color} onChange={handleChange} placeholder="e.g. Sunburst" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="serialNumber">Serial Number</label>
          <input id="serialNumber" name="serialNumber" value={form.serialNumber} onChange={handleChange} placeholder="Optional" />
        </div>
        <div className="form-group">
          <label htmlFor="purchasePrice">Purchase Price ($)</label>
          <input id="purchasePrice" name="purchasePrice" type="number" step="0.01" value={form.purchasePrice} onChange={handleChange} placeholder="0.00" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="currentValue">Current Value ($)</label>
          <input id="currentValue" name="currentValue" type="number" step="0.01" value={form.currentValue} onChange={handleChange} placeholder="0.00" />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="image">Photo</label>
        {(imagePreview || hasExistingImage) && (
          <div className="image-preview-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview ?? existingImageSrc}
              alt="Guitar preview"
              className="image-preview"
            />
            <button type="button" className="btn btn-ghost btn-sm image-remove-btn" onClick={handleRemoveImage}>
              Remove photo
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
        />
        <span className="form-hint">JPEG, PNG, WebP or GIF — max 10 MB</span>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} rows={4} placeholder="Any additional notes..." />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={() => router.back()}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Guitar"}
        </button>
      </div>
    </form>
  );
}
