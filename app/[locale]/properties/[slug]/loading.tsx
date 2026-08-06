import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

// Roughly mirrors the real page's shape (breadcrumb, title/badges, gallery,
// two-column specs+sidebar) instead of a generic centered spinner — this
// route's real layout is tall and asymmetric enough that the shared
// app/[locale]/loading.tsx spinner caused a jarring layout shift once the
// actual content mounted.
export default function Loading() {
  return (
    <Container className="py-8 sm:py-12">
      <Skeleton className="h-4 w-64 rounded-md" />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-8 w-72 rounded-md" />
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>
        <Skeleton className="h-11 w-24 rounded-full" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2">
        <Skeleton className="col-span-1 row-span-2 aspect-[4/3] rounded-2xl sm:col-span-2 sm:aspect-auto" />
        <Skeleton className="hidden aspect-square rounded-2xl sm:block" />
        <Skeleton className="hidden aspect-square rounded-2xl sm:block" />
        <Skeleton className="hidden aspect-square rounded-2xl sm:block" />
        <Skeleton className="hidden aspect-square rounded-2xl sm:block" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="order-first flex flex-col gap-6 lg:order-none">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    </Container>
  );
}
