import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { fetchPosts, fetchPurchases, type FeedPost } from "@/lib/posts-api";
import { useAuth } from "@/lib/auth-context";
import { t, translatePost } from "@/lib/strings";
import { formatPrice, formatTimeAgo } from "@/lib/formatters";
import { toCreatorFromWallet, toPostFromFeed } from "@/lib/feed-mappers";
import { queryKeys } from "@/lib/query-keys";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Compass, Filter, Sparkles, X } from "lucide-react";
import { FeedSkeletonList } from "@/components/fan-home/FeedSkeletonList";
import { StoriesStrip } from "@/components/fan-home/StoriesStrip";
import { LeftSidebar } from "@/components/fan-home/LeftSidebar";
import { RightSidebar } from "@/components/fan-home/RightSidebar";
import { PostCard } from "@/components/fan-home/PostCard";
import type { CreatorWithStats, PostWithCreator } from "@/lib/types";
import { X402PaymentModal } from "@/components/x402-payment-modal";
import type { Post, User } from "@shared/schema";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";

type PostCore = Omit<PostWithCreator, "creator">;

const toPost = (post: FeedPost): PostCore => ({
  ...toPostFromFeed(post),
  mediaType: post.mediaType,
  createdAt: post.createdAt,
});

export default function FanHome() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  useScrollRestoration("scroll:feed");
  const [posts, setPosts] = useState<PostWithCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasedPosts, setPurchasedPosts] = useState<Set<string>>(new Set());
  const [suggestedCreators, setSuggestedCreators] = useState<CreatorWithStats[]>([]);
  const storiesScrollRef = useRef<HTMLDivElement>(null);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [allTags, setAllTags] = useState<string[]>([]);
  const [justUnlocked, setJustUnlocked] = useState<Set<string>>(new Set());
  const unlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();
  
  // x402 Payment Modal
  const [x402Modal, setX402Modal] = useState<{
    isOpen: boolean;
    postId: string;
    postTitle: string;
    postPrice: number;
    creatorName: string;
    mediaType: "video" | "image";
  } | null>(null);

  const scrollStories = (direction: 'left' | 'right') => {
    if (storiesScrollRef.current) {
      const scrollAmount = 200;
      storiesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newTags = new Set(prev);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return newTags;
    });
  };

  const clearAllTags = () => {
    setSelectedTags(new Set());
  };

  const purchasesQuery = useQuery({
    queryKey: queryKeys.purchases.user(currentUser?.id ?? "anon"),
    queryFn: fetchPurchases,
    enabled: !!currentUser,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  // Filtruj posty na podstawie wybranych tagów
  const filteredPosts = useMemo(() => {
    if (selectedTags.size === 0) return posts;
    return posts.filter((post) => {
      const postTags = post.tags || [];
      const creatorTags = post.creator.tags || [];
      const allPostTags = [...postTags, ...creatorTags];
      return [...selectedTags].some((tag) => allPostTags.includes(tag));
    });
  }, [posts, selectedTags]);

  const postsQuery = useQuery({
    queryKey: queryKeys.posts.active(50, 0),
    queryFn: () => fetchPosts({ active: true, limit: 50, offset: 0 }),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    placeholderData: () =>
      queryClient.getQueryData(queryKeys.posts.active(50, 0)) as FeedPost[] | undefined,
  });

  useEffect(() => {
    const feed = postsQuery.data;
    if (!feed) {
      setIsLoading(postsQuery.isLoading);
      return;
    }

    const postsWithCreators: PostWithCreator[] = feed
      .map((post) => ({
        ...toPost(post),
            creator: toCreatorFromWallet(post.creatorWallet),
      }))
      .sort((a, b) => (b.id > a.id ? 1 : -1));

    setPosts(postsWithCreators);

    const creatorsMap = new Map<string, CreatorWithStats>();
    postsWithCreators.forEach((post) => {
      if (!creatorsMap.has(post.creator.id)) {
        creatorsMap.set(post.creator.id, {
          ...post.creator,
          postCount: 0,
          premiumCount: 0,
          mediaCount: 0,
        });
      }
      creatorsMap.get(post.creator.id)!.postCount += 1;
    });
    setSuggestedCreators(Array.from(creatorsMap.values()));

    // Tags (backend feed doesn't provide tags yet)
    setAllTags([]);
    setIsLoading(false);
  }, [postsQuery.data, postsQuery.isLoading]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("filters:feed:tags");
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        setSelectedTags(new Set(parsed));
      }
      const show = sessionStorage.getItem("filters:feed:showTags");
      if (show) {
        setShowTagFilter(show === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("filters:feed:tags", JSON.stringify(Array.from(selectedTags)));
    sessionStorage.setItem("filters:feed:showTags", String(showTagFilter));
  }, [selectedTags, showTagFilter]);

  useEffect(() => {
    const activeIds = purchasesQuery.data?.active.map((p) => p.assetId) ?? [];
    setPurchasedPosts(new Set(activeIds));
  }, [purchasesQuery.data]);

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.posts.active(100, 0),
      queryFn: () => fetchPosts({ active: true, limit: 100, offset: 0 }),
      staleTime: 60_000,
    });
    if (currentUser) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.purchases.user(currentUser.id),
        queryFn: fetchPurchases,
        staleTime: 60_000,
      });
    }
  }, [queryClient, currentUser]);

  // Otwórz modal x402
  const openX402Payment = (post: PostWithCreator) => {
    setX402Modal({
      isOpen: true,
      postId: post.id,
      postTitle: translatePost(post.title, post.description).title,
      postPrice: post.postPrice || 5,
      creatorName: post.creator.username,
      mediaType: post.mediaType,
    });
  };

  // Zamknij modal x402
  const closeX402Modal = () => {
    setX402Modal(null);
  };

  // Sukces płatności x402
  const handleX402Success = () => {
    if (x402Modal && currentUser) {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.user(currentUser?.id ?? "anon") });
      
      // Dodaj do justUnlocked i usuń po 2 sekundach (animacja)
      setJustUnlocked(prev => new Set(prev).add(x402Modal.postId));
      if (unlockTimeoutRef.current) {
        clearTimeout(unlockTimeoutRef.current);
      }
      unlockTimeoutRef.current = setTimeout(() => {
        setJustUnlocked(prev => {
          const newSet = new Set(prev);
          newSet.delete(x402Modal.postId);
          return newSet;
        });
      }, 2000);
      
      toast({
        title: t.fanHome.unlocked,
        description: t.fanHome.enjoyContent,
      });
    }
  };

  useEffect(() => {
    return () => {
      if (unlockTimeoutRef.current) {
        clearTimeout(unlockTimeoutRef.current);
      }
    };
  }, []);


  const isUnlocked = (post: PostWithCreator) => {
    if (!post.isPremium) return true;
    // Subskrypcje usunięte
    return purchasedPosts.has(post.id);
  };

  const timeAgo = (createdAt?: string) => formatTimeAgo(createdAt, t.fanHome.hoursAgo);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="feed-layout px-4 py-6">
        <LeftSidebar
          currentUser={currentUser}
          selectedTags={selectedTags}
          showTagFilter={showTagFilter}
          allTags={allTags}
          onToggleTagFilter={() => setShowTagFilter(!showTagFilter)}
          onToggleTag={toggleTag}
          onClearAllTags={clearAllTags}
        />

        {/* Main Feed */}
        <main className="min-w-0">
          {/* Stories/Featured Section */}
          <StoriesStrip
            creators={suggestedCreators}
            storiesScrollRef={storiesScrollRef}
            onScroll={scrollStories}
          />

          {/* Posts Feed */}
          {isLoading ? (
            <FeedSkeletonList />
          ) : posts.length === 0 ? (
            <Card className="glass">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t.fanHome.noContent}</h3>
                <p className="text-muted-foreground text-center max-w-sm mb-6">
                  {t.fanHome.noContentDesc}
                </p>
                <Link href="/explore">
                  <Button className="gap-2">
                    <Compass className="h-4 w-4" />
                    {t.fanHome.discoverCreators}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : filteredPosts.length === 0 ? (
            <Card className="glass">
              <CardContent className="p-8 text-center">
                <div className="p-4 rounded-full bg-muted mb-4 inline-block">
                  <Filter className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t.fanHome.noFilterResults || "Brak wyników"}</h3>
                <p className="text-muted-foreground text-center max-w-sm mb-6 mx-auto">
                  {t.fanHome.noFilterResultsDesc || "Nie znaleziono postów z wybranymi tagami. Spróbuj zmienić filtry."}
                </p>
                <Button variant="outline" onClick={clearAllTags} className="gap-2">
                  <X className="h-4 w-4" />
                  {t.fanHome.clearFilters || "Wyczyść filtry"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Active filters indicator */}
              {selectedTags.size > 0 && (
                <div className="flex items-center gap-2 flex-wrap p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">{t.fanHome.activeFilters || "Aktywne filtry"}:</span>
                  {[...selectedTags].map(tag => (
                    <Badge 
                      key={tag} 
                      className="cursor-pointer gap-1"
                      onClick={() => toggleTag(tag)}
                    >
                      #{tag}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs ml-auto"
                    onClick={clearAllTags}
                  >
                    {t.fanHome.clearAll || "Wyczyść wszystko"}
                  </Button>
                </div>
              )}

              {filteredPosts.map((post) => {
                const unlocked = isUnlocked(post);
                return (
                  <PostCard
                    key={post.id}
                    post={post}
                    unlocked={unlocked}
                    justUnlocked={post.isPremium && justUnlocked.has(post.id)}
                    onUnlock={openX402Payment}
                    formatTimeAgo={timeAgo}
                  />
                );
              })}
            </div>
          )}
        </main>

        <RightSidebar creators={suggestedCreators} />
      </div>

      {/* x402 Payment Modal */}
      {x402Modal && (
        <X402PaymentModal
          isOpen={x402Modal.isOpen}
          onClose={closeX402Modal}
          onSuccess={handleX402Success}
          contentId={x402Modal.postId}
          contentTitle={x402Modal.postTitle}
          mediaType={x402Modal.mediaType}
          priceUSD={x402Modal.postPrice}
          creatorName={x402Modal.creatorName}
        />
      )}
    </div>
  );
}
