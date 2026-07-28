import { Loader2 } from "lucide-react";

// Loading UI components accept no props in this Next.js version.
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-accent" />
    </div>
  );
}
