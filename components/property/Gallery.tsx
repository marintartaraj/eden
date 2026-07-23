"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function Gallery({
  images,
  title,
}: {
  images: { url: string }[];
  title: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return <div className="aspect-[16/9] w-full rounded-2xl bg-border" />;
  }

  const main = images[0];
  const thumbs = images.slice(1, 5);

  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="relative col-span-1 row-span-2 aspect-[4/3] overflow-hidden rounded-2xl bg-border sm:col-span-2 sm:aspect-auto"
        >
          <Image
            src={main.url}
            alt={title}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            priority
            className="object-cover"
          />
        </button>
        {thumbs.map((image, index) => (
          <button
            key={image.url}
            type="button"
            onClick={() => setLightboxIndex(index + 1)}
            className="relative hidden aspect-square overflow-hidden rounded-2xl bg-border sm:block"
          >
            <Image src={image.url} alt={title} fill sizes="25vw" className="object-cover" />
            {index === 3 && images.length > 5 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white">
                +{images.length - 5}
              </span>
            )}
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative flex-1">
            <Image
              src={images[lightboxIndex].url}
              alt={title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((i) => (i === null ? 0 : (i - 1 + images.length) % images.length))
                }
                aria-label="Previous"
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex((i) => (i === null ? 0 : (i + 1) % images.length))}
                aria-label="Next"
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          <div className="flex justify-center gap-1 p-4 text-sm text-white/70">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
