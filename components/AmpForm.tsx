"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AmpType, AmpCondition, AmpSchema, AmpInput as AmpFormValues, AMP_TYPES, AMP_CONDITIONS } from "@/lib/schemas";
import { createAmp, updateAmp } from "@/app/actions/amps";

export type AmpData = {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  type: AmpType;
  color: string | null;
  serialNumber: string | null;
  condition: AmpCondition;
  wattage: string | null;
  channels: string | null;
  preampTubes: string | null;
  powerTubes: string | null;
  rectifier: string | null;
  outputTransformer: string | null;
  speakerBrand: string | null;
  speakerModel: string | null;
  speakerSize: string | null;
  speakerCount: string | null;
  impedance: string | null;
  cabinetMaterial: string | null;
  baffle: string | null;
  finishType: string | null;
  madeIn: string | null;
  controls: string | null;
  builtInEffects: string | null;
  effectsLoop: string | null;
  footswitch: string | null;
  inputs: string | null;
  outputs: string | null;
  notes: string | null;
};

type Props = {
  amp?: AmpData;
};

export default function AmpForm({ amp }: Props) {
  const router = useRouter();
  const isEdit = !!amp;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();
  const [loadingImage, setLoadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(AmpSchema),
    defaultValues: {
      brand: amp?.brand ?? "",
      model: amp?.model ?? "",
      year: amp?.year ?? ("" as any),
      type: amp?.type ?? "combo",
      color: amp?.color ?? "",
      serialNumber: amp?.serialNumber ?? "",
      condition: amp?.condition ?? "good",
      wattage: amp?.wattage ?? "",
      channels: amp?.channels ?? "",
      preampTubes: amp?.preampTubes ?? "",
      powerTubes: amp?.powerTubes ?? "",
      rectifier: amp?.rectifier ?? "",
      outputTransformer: amp?.outputTransformer ?? "",
      speakerBrand: amp?.speakerBrand ?? "",
      speakerModel: amp?.speakerModel ?? "",
      speakerSize: amp?.speakerSize ?? "",
      speakerCount: amp?.speakerCount ?? "",
      impedance: amp?.impedance ?? "",
      cabinetMaterial: amp?.cabinetMaterial ?? "",
      baffle: amp?.baffle ?? "",
      finishType: amp?.finishType ?? "",
      madeIn: amp?.madeIn ?? "",
      controls: amp?.controls ?? "",
      builtInEffects: amp?.builtInEffects ?? "",
      effectsLoop: amp?.effectsLoop ?? "",
      footswitch: amp?.footswitch ?? "",
      inputs: amp?.inputs ?? "",
      outputs: amp?.outputs ?? "",
      notes: amp?.notes ?? "",
    },
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{ id?: string; url: string; file?: File }[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [formError, setFormError] = useState("");

  const isLoading = isPending || loadingImage;

  useEffect(() => {
    if (isEdit && amp.id) {
      fetch(`/api/amps/${amp.id}/images`)
        .then(res => res.json())
        .then((data: any[]) => {
          if (data && data.length > 0) {
            setImagePreviews(data.map(img => ({ id: img.id, url: `/api/amps/${amp.id}/images/${img.id}` })));
          }
        })
        .catch(console.error);
    }
  }, [isEdit, amp]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(file => ({ url: URL.createObjectURL(file), file }))]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleRemoveImage(index: number) {
    const target = imagePreviews[index];
    if (target.id) {
      setImagesToDelete(prev => [...prev, target.id!]);
    } else if (target.file) {
      setImageFiles(prev => prev.filter(f => f !== target.file));
    }
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(data: AmpFormValues) {
    setFormError("");
    setLoadingImage(true);

    startTransition(async () => {
      const res = isEdit
        ? await updateAmp(amp.id, data)
        : await createAmp(data);

      if (res.error) {
        setFormError(res.error);
        setLoadingImage(false);
        return;
      }

      const ampId = isEdit ? amp.id : (res as any).id;

      try {
        for (const idToRemove of imagesToDelete) {
          const delRes = await fetch(`/api/amps/${ampId}/images/${idToRemove}`, { method: "DELETE" });
          if (!delRes.ok) {
            setFormError("Failed to remove one or more images.");
            setLoadingImage(false);
            if (!isEdit) router.push(`/amps/${ampId}/edit`);
            return;
          }
        }

        if (imageFiles.length > 0) {
          const formData = new FormData();
          imageFiles.forEach(file => formData.append("image", file));
          const imgRes = await fetch(`/api/amps/${ampId}/images`, { method: "POST", body: formData });
          if (!imgRes.ok) {
            setFormError("Failed to upload some images.");
            setLoadingImage(false);
            if (!isEdit) router.push(`/amps/${ampId}/edit`);
            return;
          }
        }
      } catch {
        setFormError("Image synchronization error.");
        setLoadingImage(false);
        if (!isEdit) router.push(`/amps/${ampId}/edit`);
        return;
      }

      setLoadingImage(false);
      router.push(`/amps/${ampId}`);
    });
  }

  return (
    <form className="guitar-form" onSubmit={handleSubmit(onSubmit)}>
      {formError && <p className="form-error">{formError}</p>}

      {/* ── Basic Info ─────────────────────────────────────────────────────── */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="brand">Brand *</label>
          <input id="brand" {...register("brand")} placeholder="e.g. Fender" />
          {errors.brand && <span className="form-error-inline">{errors.brand.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="model">Model *</label>
          <input id="model" {...register("model")} placeholder="e.g. Deluxe Reverb" />
          {errors.model && <span className="form-error-inline">{errors.model.message}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="type">Type *</label>
          <select id="type" {...register("type")}>
            {AMP_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          {errors.type && <span className="form-error-inline">{errors.type.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="condition">Condition *</label>
          <select id="condition" {...register("condition")}>
            {AMP_CONDITIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
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
          <label htmlFor="color">Color / Tolex</label>
          <input id="color" {...register("color")} placeholder="e.g. Tweed, Black" />
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
          <input id="madeIn" {...register("madeIn")} placeholder="e.g. USA, UK" />
          {errors.madeIn && <span className="form-error-inline">{errors.madeIn.message}</span>}
        </div>
      </div>

      {/* ── Power & Electronics ───────────────────────────────────────────── */}
      <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>Power &amp; Electronics</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="wattage">Wattage</label>
          <input id="wattage" {...register("wattage")} placeholder="e.g. 22W, 100W" />
          {errors.wattage && <span className="form-error-inline">{errors.wattage.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="channels">Channels</label>
          <input id="channels" {...register("channels")} placeholder="e.g. 2, Clean + Drive" />
          {errors.channels && <span className="form-error-inline">{errors.channels.message}</span>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="preampTubes">Preamp Tubes</label>
          <input id="preampTubes" {...register("preampTubes")} placeholder="e.g. 3x 12AX7" />
          {errors.preampTubes && <span className="form-error-inline">{errors.preampTubes.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="powerTubes">Power Tubes</label>
          <input id="powerTubes" {...register("powerTubes")} placeholder="e.g. 2x EL84, 4x 6L6" />
          {errors.powerTubes && <span className="form-error-inline">{errors.powerTubes.message}</span>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="rectifier">Rectifier</label>
          <input id="rectifier" {...register("rectifier")} placeholder="e.g. Tube (GZ34), Solid State" />
          {errors.rectifier && <span className="form-error-inline">{errors.rectifier.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="outputTransformer">Output Transformer</label>
          <input id="outputTransformer" {...register("outputTransformer")} placeholder="e.g. Schumacher" />
          {errors.outputTransformer && <span className="form-error-inline">{errors.outputTransformer.message}</span>}
        </div>
      </div>

      {/* ── Speaker ───────────────────────────────────────────────────────── */}
      <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>Speaker</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="speakerBrand">Speaker Brand</label>
          <input id="speakerBrand" {...register("speakerBrand")} placeholder="e.g. Celestion, Jensen" />
          {errors.speakerBrand && <span className="form-error-inline">{errors.speakerBrand.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="speakerModel">Speaker Model</label>
          <input id="speakerModel" {...register("speakerModel")} placeholder='e.g. Greenback, P12R' />
          {errors.speakerModel && <span className="form-error-inline">{errors.speakerModel.message}</span>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="speakerSize">Speaker Size</label>
          <input id="speakerSize" {...register("speakerSize")} placeholder='e.g. 12", 10"' />
          {errors.speakerSize && <span className="form-error-inline">{errors.speakerSize.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="speakerCount">Configuration</label>
          <input id="speakerCount" {...register("speakerCount")} placeholder="e.g. 1x12, 4x10" />
          {errors.speakerCount && <span className="form-error-inline">{errors.speakerCount.message}</span>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="impedance">Impedance</label>
          <input id="impedance" {...register("impedance")} placeholder="e.g. 8 ohm, 16 ohm" />
          {errors.impedance && <span className="form-error-inline">{errors.impedance.message}</span>}
        </div>
      </div>

      {/* ── Cabinet ───────────────────────────────────────────────────────── */}
      <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>Cabinet</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cabinetMaterial">Cabinet Material</label>
          <input id="cabinetMaterial" {...register("cabinetMaterial")} placeholder="e.g. Pine, Birch plywood" />
          {errors.cabinetMaterial && <span className="form-error-inline">{errors.cabinetMaterial.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="baffle">Baffle</label>
          <input id="baffle" {...register("baffle")} placeholder="e.g. Birch" />
          {errors.baffle && <span className="form-error-inline">{errors.baffle.message}</span>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="finishType">Covering / Finish</label>
          <input id="finishType" {...register("finishType")} placeholder="e.g. Tweed, Black Tolex" />
          {errors.finishType && <span className="form-error-inline">{errors.finishType.message}</span>}
        </div>
      </div>

      {/* ── Controls & Effects ────────────────────────────────────────────── */}
      <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>Controls &amp; Effects</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="controls">Controls</label>
          <input id="controls" {...register("controls")} placeholder="e.g. Volume, Bass, Mid, Treble, Presence" />
          {errors.controls && <span className="form-error-inline">{errors.controls.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="builtInEffects">Built-in Effects</label>
          <input id="builtInEffects" {...register("builtInEffects")} placeholder="e.g. Spring Reverb, Tremolo" />
          {errors.builtInEffects && <span className="form-error-inline">{errors.builtInEffects.message}</span>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="effectsLoop">Effects Loop</label>
          <input id="effectsLoop" {...register("effectsLoop")} placeholder="e.g. Serial, Parallel, None" />
          {errors.effectsLoop && <span className="form-error-inline">{errors.effectsLoop.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="footswitch">Footswitch</label>
          <input id="footswitch" {...register("footswitch")} placeholder="e.g. 2-button channel switch" />
          {errors.footswitch && <span className="form-error-inline">{errors.footswitch.message}</span>}
        </div>
      </div>

      {/* ── Connections ───────────────────────────────────────────────────── */}
      <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>Connections</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="inputs">Inputs</label>
          <input id="inputs" {...register("inputs")} placeholder='e.g. High / Low gain, 1/4"' />
          {errors.inputs && <span className="form-error-inline">{errors.inputs.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="outputs">Outputs</label>
          <input id="outputs" {...register("outputs")} placeholder='e.g. Speaker out, DI, Headphone' />
          {errors.outputs && <span className="form-error-inline">{errors.outputs.message}</span>}
        </div>
      </div>

      {/* ── Photos ────────────────────────────────────────────────────────── */}
      <div className="form-group" style={{ marginTop: "20px" }}>
        <label htmlFor="image">Photos</label>

        {imagePreviews.length > 0 && (
          <div className="image-preview-wrap" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
            {imagePreviews.map((preview, index) => (
              <div key={index} style={{ position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.url}
                  alt={`Preview ${index + 1}`}
                  className="image-preview"
                  style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "4px" }}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm image-remove-btn"
                  onClick={() => handleRemoveImage(index)}
                  style={{ position: "absolute", top: 0, right: 0, background: "rgba(0,0,0,0.5)", padding: "2px 6px" }}
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
          {isLoading ? "Saving..." : isEdit ? "Save Changes" : "Add Amp"}
        </button>
      </div>
    </form>
  );
}
