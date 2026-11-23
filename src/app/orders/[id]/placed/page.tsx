import { Suspense } from "react";
import { Skeleton } from "@/components/ui";
import { Placed } from "./placed";

export default function Page({ params }: PageProps<"/orders/[id]/placed">) {
  return (
    <Suspense fallback={<div className="px-5 pt-16"><Skeleton className="h-80 w-full" /></div>}>
      <Placed params={params} />
    </Suspense>
  );
}
