import { useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchPosts, type FeedPost } from "@/lib/posts-api";
import { t } from "@/lib/strings";
import { formatPrice } from "@/lib/formatters";
import { queryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Crown } from "lucide-react";
import { CreatorDashboardSkeleton } from "@/components/skeletons/CreatorDashboardSkeleton";

export default function CreatorDashboard() {
  const { currentUser } = useAuth();
  const postsQuery = useQuery({
    queryKey: queryKeys.posts.active(100, 0),
    queryFn: () => fetchPosts({ active: true, limit: 100, offset: 0 }),
    enabled: !!currentUser,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  const posts = useMemo<FeedPost[]>(
    () => (postsQuery.data ?? []).filter((p) => (p.creatorWallet || "unknown") === currentUser?.id),
    [postsQuery.data, currentUser?.id]
  );

  if (!currentUser) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.dashboard.manageAccount}</h1>
            <p className="text-muted-foreground mt-2">
              Creator tools are connected to the backend. Uploading and editing are coming next.
            </p>
                    </div>
          <Button disabled className="gap-2">
                <Plus className="h-4 w-4" />
                {t.dashboard.newPost}
              </Button>
          </div>
          
        {postsQuery.isLoading ? (
          <CreatorDashboardSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t.dashboard.yourPosts}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {posts.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.dashboard.noPosts}</p>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between border-b border-border/50 pb-3">
                    <div>
                      <p className="font-medium">{post.title}</p>
                      <p className="text-sm text-muted-foreground">{post.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.pricing?.["24h"]?.price ? (
                        <Badge variant="secondary" className="gap-1">
                          <Crown className="h-3 w-3 text-amber-500" />
                          {formatPrice(post.pricing["24h"].price)}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Free</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
