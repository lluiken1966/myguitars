"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GuitarType, GuitarCondition, GuitarSchema, GuitarInput as GuitarFormValues, GUITAR_TYPES, GUITAR_CONDITIONS } from "@/lib/schemas";
import { createGuitar, updateGuitar } from "@/app/actions/guitars";

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

type Props = {
  guitar?: GuitarData;
};

export default function GuitarForm({ guitar }: Props) {
  const router = useRouter();
  const isEdit = !!guitar;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();
  const [loadingImage, setLoadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(GuitarSchema),
    defaultValues: {
      brand: guitar?.brand ?? "",
      model: guitar?.model ?? "",
      year: guitar?.year ?? ("" as any),
      type: guitar?.type ?? "electric",
      color: guitar?.color ?? "",
      serialNumber: guitar?.serialNumber ?? "",
      condition: guitar?.condition ?? "good",
      purchasePrice: guitar?.purchasePrice ?? ("" as any),
      currentValue: guitar?.currentValue ?? ("" as any),
      notes: guitar?.notes ?? "",
    },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const hasExistingImage = isEdit && !!guitar.imageMimeType && !removeImage;
  const existingImageSrc = guitar ? `/api/guitars/${guitar.id}/image` : undefined;

  const [formError, setFormError] = useState("");

  const isLoading = isPending || loadingImage;

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

  async function onSubmit(data: GuitarFormValues) {
    setFormError("");
    setLoadingImage(true);

    startTransition(async () => {
      // 1. Save data via server action
      const res = isEdit
        ? await updateGuitar(guitar.id, data)
        : await createGuitar(data);

      if (res.error) {
        setFormError(res.error);
        setLoadingImage(false);
        return;
      }

      const guitarId = isEdit ? guitar.id : (res as any).id;

      // 2. Handle image upload if needed
      try {
        if (imageFile) {
          const formData = new FormData();
          formData.append("image", imageFile);
          const imgRes = await fetch(`/api/guitars/${guitarId}/image`, {
            method: "POST",
            body: formData,
          });
          if (!imgRes.ok) {
            setFormError("Image upload failed. Please try again.");
            setLoadingImage(false);
            if (!isEdit) router.push(`/collection/${guitarId}/edit`);
            return;
          }
        } else if (removeImage && isEdit) {
          await fetch(`/api/guitars/${guitarId}/image`, { method: "DELETE" });
        }
      } catch {
        setFormError("Image upload error.");
        setLoadingImage(false);
        if (!isEdit) router.push(`/collection/${guitarId}/edit`);
        return;
      }

      setLoadingImage(false);
      router.push(`/collection/${guitarId}`);
    });
  }

  return (
    <form className="guitar-form" onSubmit={handleSubmit(onSubmit)}>
      {formError && <p className="form-error">{formError}</p>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="brand">Brand *</label>
          <input id="brand" {...register("brand")} placeholder="e.g. Fender" />
          {errors.brand && <span className="form-error-inline">{errors.brand.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="model">Model *</label>
          <input id="model" {...register("model")} placeholder="e.g. Stratocaster" />
          {errors.model && <span className="form-error-inline">{errors.model.message}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="type">Type *</label>
          <select id="type" {...register("type")}>
            {GUITAR_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          {errors.type && <span className="form-error-inline">{errors.type.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="condition">Condition *</label>
          <select id="condition" {...register("condition")}>
            {GUITAR_CONDITIONS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          {errors.condition && <span className="form-error-inline">{errors.condition.message}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="year">Year</label>
          <input id="year" type="number" {...register("year")} placeholder="e.g. 1965" min="1900" max="2100" />
          {errors.year && <span className="form-error-inline">{errors.year.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="color">Color</label>
          <input id="color" {...register("color")} placeholder="e.g. Sunburst" />
          {errors.color && <span className="form-error-inline">{errors.color.message}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="serialNumber">Serial Number</label>
          <input id="serialNumber" {...register("serialNumber")} placeholder="Optional" />
          {errors.serialNumber && <span className="form-error-inline">{errors.serialNumber.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="purchasePrice">Purchase Price ($)</label>
          <input id="purchasePrice" type="number" step="0.01" {...register("purchasePrice")} placeholder="0.00" />
          {errors.purchasePrice && <span className="form-error-inline">{errors.purchasePrice.message}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="currentValue">Current Value ($)</label>
          <input id="currentValue" type="number" step="0.01" {...register("currentValue")} placeholder="0.00" />
          {errors.currentValue && <span className="form-error-inline">{errors.currentValue.message}</span>}
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
        <textarea id="notes" {...register("notes")} rows={4} placeholder="Any additional notes..." />
        {errors.notes && <span className="form-error-inline">{errors.notes.message}</span>}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={() => router.back()}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Saving..." : isEdit ? "Save Changes" : "Add Guitar"}
        </button>
      </div>
    </form>
  );
}
