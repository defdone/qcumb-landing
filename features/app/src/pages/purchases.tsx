import { useMemo, useState } from "react";
import { Link } from "wouter";
import { fetchPosts, fetchPurchases, type FeedPost } from "@/lib/posts-api";
import { useAuth } from "@/lib/auth-context";
import { t, translatePost } from "@/lib/strings";
import { getInitials } from "@/lib/formatters";
import { toCreatorFromWallet, toPostFromFeed } from "@/lib/feed-mappers";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Crown, Unlock, ExternalLink, Star } from "lucide-react";
import type { Post, User } from "@shared/schema";

interface PurchasedPost extends Post {
  creator: User;
}

// SubscribedCreator usunięte - zgodnie z PDF: "No subscriptions"

type TabType = "purchased";

export default function Purchases() {
  const { currentUser } = useAuth();
  useScrollRestoration("scroll:purchases");
  // Subskrypcje usunięte
  const [activeTab, setActiveTab] = useState<TabType>("purchased");

  const postsQuery = useQuery({
    queryKey: queryKeys.posts.active(100, 0),
    queryFn: () => fetchPosts({ active: true, limit: 100, offset: 0 }),
    enabled: !!currentUser,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  const purchasesQuery = useQuery({
    queryKey: queryKeys.purchases.user(currentUser?.id ?? "anon"),
    queryFn: fetchPurchases,
    enabled: !!currentUser,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  const purchasedPosts = useMemo(() => {
    const feed = postsQuery.data ?? [];
    const purchases = purchasesQuery.data;
    if (!purchases) return [];
    const postsById = new Map(feed.map((p) => [p.id, p]));
    const activeIds = purchases.active.map((p) => p.assetId);

    return activeIds
      .map((id) => postsById.get(id))
      .filter((p): p is FeedPost => !!p)
      .map((p) => ({
        ...toPostFromFeed(p),
        creator: toCreatorFromWallet(p.creatorWallet),
      }));
  }, [postsQuery.data, purchasesQuery.data]);


  if (!currentUser) return null;

  const isLoading = postsQuery.isLoading || purchasesQuery.isLoading;
  const hasContent = purchasedPosts.length > 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-purchases-title">
            <ShoppingBag className="h-8 w-8 text-primary" />
            {t.purchases.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t.purchases.subtitle}
          </p>
        </div>

        {isLoading ? (
          <Card className="glass">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{t.common.loading}</h3>
            </CardContent>
          </Card>
        ) : !hasContent ? (
          <Card className="glass">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{t.purchases.noContent}</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-4">
                {t.purchases.noContentDesc}
              </p>
              <Link href="/explore">
                <Button data-testid="button-discover" className="glow-primary">
                  {t.purchases.discoverCreators}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
              <TabsList>
                <TabsTrigger value="purchased" data-testid="tab-purchased">
                  {t.purchases.purchased} ({purchasedPosts.length})
                </TabsTrigger>
              </TabsList>

              {activeTab === "purchased" && (
                <div className="space-y-4 mt-6">
                  {purchasedPosts.length === 0 ? (
                    <Card className="glass">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="rounded-full bg-muted p-4 mb-4">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{t.purchases.noPurchased}</h3>
                        <p className="text-muted-foreground text-center max-w-sm">
                          {t.purchases.noPurchasedDesc}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {purchasedPosts.length} {t.purchases.postsPurchased}
                      </p>
                      {purchasedPosts.map((post) => {
                        const translated = translatePost(post.title, post.description);
                        return (
                          <Card key={post.id} className="glass card-hover" data-testid={`card-purchase-${post.id}`}>
                            <CardContent className="p-6">
                              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                <Link href={`/creator/${post.creator.id}`}>
                                  <Avatar className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity">
                                    {post.creator.avatarUrl ? (
                                      <AvatarImage src={post.creator.avatarUrl} alt={post.creator.username} className="object-cover" />
                                    ) : null}
                                    <AvatarFallback className="bg-primary/20 text-primary font-medium">
                                      {getInitials(post.creator.username)}
                                    </AvatarFallback>
                                  </Avatar>
                                </Link>

                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                      <Unlock className="h-3 w-3 mr-1" />
                                      {t.purchases.purchasedBadge}
                                    </Badge>
                                    {post.isPremium && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Crown className="h-3 w-3 mr-1 text-amber-500" />
                                        Premium
                                      </Badge>
                                    )}
                                  </div>

                                  <h3 className="font-semibold text-lg" data-testid={`text-purchase-title-${post.id}`}>
                                    {translated.title}
                                  </h3>
                                  
                                  <Link href={`/creator/${post.creator.id}`}>
                                    <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                                      {t.purchases.by} {post.creator.username}
                                    </span>
                                  </Link>

                                  <p className="text-muted-foreground mt-2 line-clamp-2" data-testid={`text-purchase-preview-${post.id}`}>
                                    {translated.description}
                                  </p>
                                </div>

                                <Link href={`/post/${post.id}`}>
                                  <Button variant="outline" size="sm" data-testid={`button-view-${post.id}`}>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    {t.purchases.view}
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </>
                  )}
                </div>
              )}

              {/* Sekcja subskrypcji usunięta - zgodnie z PDF: "No subscriptions" */}

            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
