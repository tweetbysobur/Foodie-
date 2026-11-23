import { Suspense } from "react";
import { Skeleton } from "@/components/ui";
import { Tracking } from "./tracking";

/** Order ids are created on the device, so the param is runtime data and is read inside Suspense. */
export default function Page({ params }: PageProps<"/orders/[id]">) {
  return (
    <Suspense fallback={<div className="px-5 pt-16"><Skeleton className="h-72 w-full" /></div>}>
      <Tracking params={params} />
    </Suspense>
  );
}
