"use client";

import { useState, useEffect, useRef } from "react";

type ImageSlideshowProps = {
    images: { id: string; url: string }[];
    alt?: string;
    isCard?: boolean;
};

const NAV_BTN: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.5)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    zIndex: 1,
};

const CTRL_BTN: React.CSSProperties = {
    background: "rgba(255,255,255,0.15)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "6px",
    width: "36px",
    height: "36px",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

export default function ImageSlideshow({ images, alt = "Guitar", isCard = false }: ImageSlideshowProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragOrigin = useRef({ mouseX: 0, mouseY: 0, panX: 0, panY: 0 });

    if (!images || images.length === 0) return null;

    const current = images[currentIndex];
    const hasMultiple = images.length > 1;

    const resetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const go = (dir: 1 | -1) => {
        setCurrentIndex((prev) => (prev + dir + images.length) % images.length);
        resetView();
    };

    const adjustZoom = (delta: number) => {
        setZoom((prev) => {
            const next = Math.min(5, Math.max(1, prev + delta));
            if (next === 1) setPan({ x: 0, y: 0 });
            return next;
        });
    };

    // Keyboard nav + ESC
    useEffect(() => {
        if (!lightboxOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") { setLightboxOpen(false); resetView(); }
            if (e.key === "ArrowRight") { setCurrentIndex((p) => (p + 1) % images.length); resetView(); }
            if (e.key === "ArrowLeft") { setCurrentIndex((p) => (p - 1 + images.length) % images.length); resetView(); }
            if (e.key === "+" || e.key === "=") adjustZoom(0.5);
            if (e.key === "-") adjustZoom(-0.5);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [lightboxOpen, images.length]);

    // Mouse wheel zoom inside lightbox
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        adjustZoom(e.deltaY < 0 ? 0.25 : -0.25);
    };

    // Drag-to-pan handlers
    const onDragStart = (e: React.MouseEvent) => {
        if (zoom <= 1) return;
        e.preventDefault();
        setIsDragging(true);
        dragOrigin.current = { mouseX: e.clientX, mouseY: e.clientY, panX: pan.x, panY: pan.y };
    };

    const onDragMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPan({
            x: dragOrigin.current.panX + (e.clientX - dragOrigin.current.mouseX),
            y: dragOrigin.current.panY + (e.clientY - dragOrigin.current.mouseY),
        });
    };

    const onDragEnd = () => setIsDragging(false);

    return (
        <>
            {/* Slideshow thumbnail */}
            <div
                className="slideshow-container"
                style={{
                    position: "relative",
                    width: "100%",
                    height: isCard ? "200px" : "auto",
                    borderRadius: isCard ? "12px 12px 0 0" : "8px",
                    overflow: "hidden",
                    backgroundColor: "var(--surface)",
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={current.url}
                    alt={`${alt} image ${currentIndex + 1}`}
                    className="guitar-detail-img slideshow-img"
                    style={{
                        width: "100%",
                        height: isCard ? "200px" : "400px",
                        objectFit: isCard ? "cover" : "contain",
                        display: "block",
                        cursor: isCard ? "default" : "zoom-in",
                    }}
                    onClick={!isCard ? () => setLightboxOpen(true) : undefined}
                />

                {!isCard && (
                    <div
                        style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            background: "rgba(0,0,0,0.5)",
                            color: "white",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "0.75rem",
                            pointerEvents: "none",
                        }}
                    >
                        Click to zoom
                    </div>
                )}

                {hasMultiple && (
                    <>
                        <button onClick={() => go(-1)} style={{ ...NAV_BTN, left: "10px" }} aria-label="Previous image">←</button>
                        <button onClick={() => go(1)} style={{ ...NAV_BTN, right: "10px" }} aria-label="Next image">→</button>
                        <div
                            style={{
                                position: "absolute",
                                bottom: "10px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                background: "rgba(0,0,0,0.6)",
                                color: "white",
                                padding: "4px 12px",
                                borderRadius: "12px",
                                fontSize: "0.8rem",
                            }}
                        >
                            {currentIndex + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>

            {/* Lightbox overlay */}
            {lightboxOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.92)",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {/* Zoom controls + close */}
                    <div
                        style={{
                            position: "absolute",
                            top: "16px",
                            right: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            zIndex: 1,
                        }}
                    >
                        <button style={CTRL_BTN} onClick={() => adjustZoom(-0.5)} aria-label="Zoom out">−</button>
                        <span style={{ color: "white", minWidth: "48px", textAlign: "center", fontSize: "0.85rem" }}>
                            {Math.round(zoom * 100)}%
                        </span>
                        <button style={CTRL_BTN} onClick={() => adjustZoom(0.5)} aria-label="Zoom in">+</button>
                        <button
                            style={{ ...CTRL_BTN, marginLeft: "8px" }}
                            onClick={() => { setLightboxOpen(false); resetView(); }}
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Hint */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: hasMultiple ? "56px" : "16px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            color: "rgba(255,255,255,0.4)",
                            fontSize: "0.75rem",
                            pointerEvents: "none",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Scroll to zoom · Drag to pan · ESC to close
                    </div>

                    {/* Image + drag area */}
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-out",
                        }}
                        onWheel={handleWheel}
                        onMouseDown={onDragStart}
                        onMouseMove={onDragMove}
                        onMouseUp={onDragEnd}
                        onMouseLeave={onDragEnd}
                        onClick={zoom <= 1 ? () => { setLightboxOpen(false); resetView(); } : undefined}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={current.url}
                            alt={`${alt} image ${currentIndex + 1}`}
                            style={{
                                maxWidth: "90vw",
                                maxHeight: "90vh",
                                objectFit: "contain",
                                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                                transformOrigin: "center",
                                transition: isDragging ? "none" : "transform 0.15s ease",
                                userSelect: "none",
                                pointerEvents: "none",
                                borderRadius: "4px",
                            }}
                            draggable={false}
                        />
                    </div>

                    {/* Nav arrows in lightbox */}
                    {hasMultiple && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); go(-1); }}
                                style={{ ...NAV_BTN, left: "16px", width: "48px", height: "48px", fontSize: "24px" }}
                                aria-label="Previous image"
                            >
                                ←
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); go(1); }}
                                style={{ ...NAV_BTN, right: "16px", width: "48px", height: "48px", fontSize: "24px" }}
                                aria-label="Next image"
                            >
                                →
                            </button>
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "16px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    background: "rgba(0,0,0,0.6)",
                                    color: "white",
                                    padding: "6px 16px",
                                    borderRadius: "12px",
                                    fontSize: "0.9rem",
                                    zIndex: 1,
                                }}
                            >
                                {currentIndex + 1} / {images.length}
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
