import { Card, CardContent } from "@/components/ui/card";

export function CreatorsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <Card key={idx} className="card-hover h-full">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="aspect-video rounded-lg bg-muted animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
