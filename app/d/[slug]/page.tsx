import { Suspense } from "react";
import { Portal } from "./portal";

async function DealPortalLoader({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <Portal slug={slug} />;
}

export default function DealPortalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
          Loading deal room...
        </div>
      }
    >
      <DealPortalLoader params={params} />
    </Suspense>
  );
}