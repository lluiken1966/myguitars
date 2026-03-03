"use client";

import { useState } from "react";

type ImageSlideshowProps = {
    images: { id: string; url: string }[];
    alt?: string;
    isCard?: boolean;
};

export default function ImageSlideshow({ images, alt = "Guitar", isCard = false }: ImageSlideshowProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return null;
    }

    const currentImage = images[currentIndex];
    const hasMultiple = images.length > 1;

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    return (
        <div className="slideshow-container" style={{ position: "relative", width: "100%", height: isCard ? "200px" : "auto", borderRadius: isCard ? "12px 12px 0 0" : "8px", overflow: "hidden", backgroundColor: "var(--surface)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={currentImage.url}
                alt={`${alt} image ${currentIndex + 1}`}
                className="guitar-detail-img slideshow-img"
                style={{ width: "100%", height: isCard ? "200px" : "400px", objectFit: isCard ? "cover" : "contain", display: "block" }}
            />

            {hasMultiple && (
                <>
                    <button
                        onClick={handlePrev}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "10px",
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
                        }}
                        aria-label="Previous image"
                    >
                        ←
                    </button>

                    <button
                        onClick={handleNext}
                        style={{
                            position: "absolute",
                            top: "50%",
                            right: "10px",
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
                        }}
                        aria-label="Next image"
                    >
                        →
                    </button>

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
    );
}
