import { Suspense } from "react";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { PageLoadingSkeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <DashboardView />
    </Suspense>
  );
}
