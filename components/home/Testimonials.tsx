import Image from "next/image";
import { Quote, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { getFeaturedTestimonials } from "@/lib/data/testimonials";
import { localize } from "@/lib/localize";
import type { AppLocale } from "@/i18n/routing";

export async function Testimonials({ locale }: { locale: AppLocale }) {
  const [t, testimonials] = await Promise.all([
    getTranslations("home"),
    getFeaturedTestimonials(4),
  ]);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        <div className="mb-10 text-center">
          <span className="eyebrow">{t("testimonialsEyebrow")}</span>
          <h2 className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
            {t("testimonialsTitle")}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.id}
              className="flex flex-col gap-4 border border-border bg-card p-6"
            >
              <Quote className="h-5 w-5 text-accent-foreground" />
              <blockquote className="flex-1 font-accent text-base italic leading-relaxed text-foreground">
                {localize(testimonial.content_sq, testimonial.content_en, locale)}
              </blockquote>
              {testimonial.rating && (
                <div className="flex gap-0.5 text-accent">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              )}
              <figcaption className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-accent/10">
                  {testimonial.avatar_url && (
                    <Image
                      src={testimonial.avatar_url}
                      alt={testimonial.author_name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{testimonial.author_name}</p>
                  {testimonial.author_role && (
                    <p className="text-xs text-muted">{testimonial.author_role}</p>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
