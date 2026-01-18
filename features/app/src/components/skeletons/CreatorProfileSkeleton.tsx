import { Card, CardContent } from "@/components/ui/card";

export function CreatorProfileSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="relative h-48 sm:h-64 md:h-80 bg-muted animate-pulse" />

      <div className="relative max-w-4xl mx-auto px-4">
        <div className="relative -mt-20 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-muted animate-pulse border-4 border-background" />
            <div className="flex-1 space-y-3 pb-2">
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="flex gap-6">
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>

        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="aspect-square rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
