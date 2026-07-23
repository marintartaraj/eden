import { getTranslations } from "next-intl/server";
import type { PropertyDetail } from "@/lib/data/properties";

export async function VideoSection({ videos }: { videos: PropertyDetail["videos"] }) {
  if (videos.length === 0) return null;
  const t = await getTranslations("detail");
  const video = videos[0];

  return (
    <section>
      <h2 className="mb-4 font-serif text-xl text-foreground">{t("video")}</h2>
      <div className="aspect-video overflow-hidden rounded-2xl bg-border">
        <iframe
          src={video.url}
          title={t("video")}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
}
