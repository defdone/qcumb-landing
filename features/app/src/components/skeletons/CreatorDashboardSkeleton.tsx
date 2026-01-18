import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CreatorDashboardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="space-y-2">
              <div className="h-4 w-40 bg-muted animate-pulse rounded" />
              <div className="h-3 w-56 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-6 w-20 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
