import { Card, CardContent } from "@/components/ui/card";

export function PostViewSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          <div className="h-5 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="mt-4 h-3 w-2/3 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>

        <Card className="glass overflow-hidden">
          <div className="aspect-video bg-muted animate-pulse" />
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            </div>
            <div className="h-5 w-1/2 bg-muted animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
