import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { fetchPosts, type FeedPost } from "@/lib/posts-api";
import { useAuth } from "@/lib/auth-context";
import { t, translateBio } from "@/lib/strings";
import { formatPricePerMonth } from "@/lib/formatters";
import { queryKeys } from "@/lib/query-keys";
import { toCreatorFromWallet, toPostFromFeed } from "@/lib/feed-mappers";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, Sparkles, Users } from "lucide-react";
import { FeaturedCreators } from "@/components/fan-view/FeaturedCreators";
import { CreatorsGrid } from "@/components/fan-view/CreatorsGrid";
import { CreatorsGridSkeleton } from "@/components/skeletons/CreatorsGridSkeleton";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import type { CreatorWithStats } from "@/lib/types";
import type { Post } from "@shared/schema";

const toPost = (post: FeedPost): Post => toPostFromFeed(post);

export default function FanView() {
  const { currentUser } = useAuth();
  useScrollRestoration("scroll:explore");
  const [creators, setCreators] = useState<CreatorWithStats[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  // Subskrypcje usunięte

  const postsQuery = useQuery({
    queryKey: queryKeys.posts.active(100, 0),
    queryFn: () => fetchPosts({ active: true, limit: 100, offset: 0 }),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    placeholderData: () =>
      queryClient.getQueryData(queryKeys.posts.active(100, 0)) as FeedPost[] | undefined,
  });

  useEffect(() => {
    const feed = postsQuery.data;
    if (!feed) return;

    const creatorsMap = new Map<string, CreatorWithStats>();
    feed.forEach((post) => {
      const creatorWallet = post.creatorWallet || "unknown";
          const creator = creatorsMap.get(creatorWallet) || {
            ...toCreatorFromWallet(post.creatorWallet),
        postCount: 0,
        premiumCount: 0,
        mediaCount: 0,
        latestPost: undefined,
      };
      creator.postCount += 1;
      if ((post.pricing?.["24h"]?.price ?? 0) > 0) creator.premiumCount += 1;
      if (post.previewUrl) creator.mediaCount += 1;
      if (!creator.latestPost) creator.latestPost = toPost(post);
      creatorsMap.set(creatorWallet, creator);
    });
    setCreators(Array.from(creatorsMap.values()));
  }, [postsQuery.data]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem("filters:explore:search");
    if (saved) setSearchQuery(saved);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("filters:explore:search", searchQuery);
  }, [searchQuery]);

  const filteredCreators = useMemo(() => {
    if (!searchQuery.trim()) return creators;
    
    const query = searchQuery.toLowerCase();
    return creators.filter((creator) =>
      creator.username.toLowerCase().includes(query)
    );
  }, [creators, searchQuery]);


  const featuredCreators = creators.filter(c => c.postCount > 0).slice(0, 3);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/20 via-secondary/10 to-background border-b border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {t.explore.title} <span className="text-gradient-premium">{t.explore.creators}</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            {t.explore.subtitle}
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.explore.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card/50 backdrop-blur-sm border-border/50 text-base"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Featured Creators */}
        {postsQuery.isLoading ? (
          <CreatorsGridSkeleton count={3} />
        ) : featuredCreators.length > 0 && !searchQuery ? (
          <FeaturedCreators creators={featuredCreators} />
        ) : null}

        {/* All Creators */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {searchQuery ? `${t.explore.resultsFor} "${searchQuery}"` : t.explore.allCreators}
            </h2>
            <Badge variant="secondary" className="ml-2">
              {filteredCreators.length}
            </Badge>
          </div>

          {postsQuery.isLoading ? (
            <CreatorsGridSkeleton count={6} />
          ) : creators.length === 0 ? (
            <Card className="glass">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{t.explore.noCreators}</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  {t.explore.noCreatorsDesc}
                </p>
              </CardContent>
            </Card>
          ) : filteredCreators.length === 0 ? (
            <Card className="glass">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{t.explore.noResults}</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  {t.explore.noResultsDesc} "{searchQuery}".
                </p>
              </CardContent>
            </Card>
          ) : (
            <CreatorsGrid creators={filteredCreators} />
          )}
        </section>
      </div>
    </div>
  );
}
