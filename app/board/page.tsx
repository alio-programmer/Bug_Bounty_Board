import { Suspense } from "react";
import { BoardView } from "@/components/board/board-view";
import { PageLoadingSkeleton } from "@/components/ui/skeleton";

export default function BoardPage() {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <BoardView />
    </Suspense>
  );
}
