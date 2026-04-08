"use client";

import { useState, useRef, useTransition, useEffect } from "react";
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
  body: string | null;
  top: string | null;
  neck: string | null;
  fretboard: string | null;
  bridge: string | null;
  nut: string | null;
  neckPickup: string | null;
  middlePickup: string | null;
  bridgePickup: string | null;
  controls: string | null;
  madeIn: string | null;
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
      body: guitar?.body ?? "",
      top: guitar?.top ?? "",
      neck: guitar?.neck ?? "",
      fretboard: guitar?.fretboard ?? "",
      bridge: guitar?.bridge ?? "",
      nut: guitar?.nut ?? "",
      neckPickup: guitar?.neckPickup ?? "",
      middlePickup: guitar?.middlePickup ?? "",
      bridgePickup: guitar?.bridgePickup ?? "",
      controls: guitar?.controls ?? "",
      madeIn: guitar?.madeIn ?? "",
      notes: guitar?.notes ?? "",
    },
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{ id?: string; url: string; file?: File }[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [formError, setFormError] = useState("");

  const isLoading = isPending || loadingImage;

  // Load existing images on edit mount
  useEffect(() => {
    if (isEdit && guitar.id) {
      fetch(`/api/guitars/${guitar.id}/images`)
        .then(res => res.json())
        .then((data: any[]) => {
          if (data && data.length > 0) {
            setImagePreviews(data.map(img => ({ id: img.id, url: `/api/guitars/${guitar.id}/images/${img.id}` })));
          } else if (guitar.imageMimeType) {
            // fallback legacy single image
            setImagePreviews([{ id: "legacy", url: `/api/guitars/${guitar.id}/image` }]);
          }
        })
        .catch(console.error);
    }
  }, [isEdit, guitar]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setImageFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => {
      const url = URL.createObjectURL(file);
      return { url, file };
    });

    setImagePreviews(prev => [...prev, ...newPreviews]);

    // reset input so the same files can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleRemoveImage(index: number) {
    const target = imagePreviews[index];

    // If it's an existing image from DB
    if (target.id) {
      if (target.id === "legacy") {
        setImagesToDelete(prev => [...prev, "legacy"]);
      } else {
        setImagesToDelete(prev => [...prev, target.id!]);
      }
    } else if (target.file) {
      // If it's a new file, remove from imageFiles state
      setImageFiles(prev => prev.filter(f => f !== target.file));
    }

    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(data: GuitarFormValues) {
    setFormError("");
    setLoadingImage(true);

    startTransition(async () => {
      // 1. Save guitar data
      const res = isEdit
        ? await updateGuitar(guitar.id, data)
        : await createGuitar(data);

      if (res.error) {
        setFormError(res.error);
        setLoadingImage(false);
        return;
      }

      const guitarId = isEdit ? guitar.id : (res as any).id;

      // 2. Handle image uploads/deletions
      try {
        // Delete requested existing images
        for (const idToRemove of imagesToDelete) {
          if (idToRemove === "legacy") {
            await fetch(`/api/guitars/${guitarId}/image`, { method: "DELETE" }); // Assuming we made a legacy delete or just ignore it for now
          } else {
            await fetch(`/api/guitars/${guitarId}/images/${idToRemove}`, { method: "DELETE" });
          }
        }

        // Upload new files
        if (imageFiles.length > 0) {
          const formData = new FormData();
          imageFiles.forEach(file => formData.append("image", file));

          const imgRes = await fetch(`/api/guitars/${guitarId}/images`, {
            method: "POST",
            body: formData,
          });

          if (!imgRes.ok) {
            setFormError("Failed to upload some images.");
            setLoadingImage(false);
            if (!isEdit) router.push(`/guitars/${guitarId}/edit`);
            return;
          }
        }
      } catch (e) {
        setFormError("Image synchronization error.");
        setLoadingImage(false);
        if (!isEdit) router.push(`/guitars/${guitarId}/edit`);
        return;
      }

      setLoadingImage(false);
      router.push(`/guitars/${guitarId}`);
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
          <label htmlFor="madeIn">Made In</label>
          <input id="madeIn" {...register("madeIn")} placeholder="e.g. USA, Japan" />
          {errors.madeIn && <span className="form-error-inline">{errors.madeIn.message}</span>}
        </div>
      </div>

      <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Construction</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="body">Body Wood</label>
          <input id="body" {...register("body")} placeholder="e.g. Mahogany" />
          {errors.body && <span className="form-error-inline">{errors.body.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="top">Top Wood</label>
          <input id="top" {...register("top")} placeholder="e.g. Maple" />
          {errors.top && <span className="form-error-inline">{errors.top.message}</span>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="neck">Neck Wood</label>
          <input id="neck" {...register("neck")} placeholder="e.g. Mahogany" />
          {errors.neck && <span className="form-error-inline">{errors.neck.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="fretboard">Fretboard</label>
          <input id="fretboard" {...register("fretboard")} placeholder="e.g. Rosewood" />
          {errors.fretboard && <span className="form-error-inline">{errors.fretboard.message}</span>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="bridge">Bridge</label>
          <input id="bridge" {...register("bridge")} placeholder="e.g. Tune-o-matic" />
          {errors.bridge && <span className="form-error-inline">{errors.bridge.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="nut">Nut</label>
          <input id="nut" {...register("nut")} placeholder="e.g. Bone" />
          {errors.nut && <span className="form-error-inline">{errors.nut.message}</span>}
        </div>
      </div>

      <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Electronics</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="neckPickup">Neck Pickup</label>
          <input id="neckPickup" {...register("neckPickup")} placeholder="e.g. Seymour Duncan '59" />
          {errors.neckPickup && <span className="form-error-inline">{errors.neckPickup.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="middlePickup">Middle Pickup</label>
          <input id="middlePickup" {...register("middlePickup")} placeholder="e.g. Custom Single Coil" />
          {errors.middlePickup && <span className="form-error-inline">{errors.middlePickup.message}</span>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="bridgePickup">Bridge Pickup</label>
          <input id="bridgePickup" {...register("bridgePickup")} placeholder="e.g. Seymour Duncan JB" />
          {errors.bridgePickup && <span className="form-error-inline">{errors.bridgePickup.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="controls">Controls</label>
          <input id="controls" {...register("controls")} placeholder="e.g. 2 Vol, 2 Tone" />
          {errors.controls && <span className="form-error-inline">{errors.controls.message}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="image">Photos</label>

        {imagePreviews.length > 0 && (
          <div className="image-preview-wrap" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
            {imagePreviews.map((preview, index) => (
              <div key={index} style={{ position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.url}
                  alt={`Preview ${index + 1}`}
                  className="image-preview"
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm image-remove-btn"
                  onClick={() => handleRemoveImage(index)}
                  style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.5)', padding: '2px 6px' }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          capture="environment"
          multiple
          onChange={handleFileChange}
        />
        <span className="form-hint">JPEG, PNG, WebP or GIF — max 10 MB per file</span>
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
