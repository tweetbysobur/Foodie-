import { ALL_ITEM_IDS } from "@/lib/api";
import { FoodDetail } from "./food-detail";

export function generateStaticParams() {
  return ALL_ITEM_IDS.map((id) => ({ id }));
}

export default async function Page({ params }: PageProps<"/food/[id]">) {
  const { id } = await params;
  return <FoodDetail id={id} />;
}
