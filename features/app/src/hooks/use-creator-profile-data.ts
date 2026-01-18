import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@shared/schema";
import type { PostWithMedia } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPosts, fetchPurchases, type FeedPost } from "@/lib/posts-api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { t, translatePost } from "@/lib/strings";
import { toCreatorFromWallet, toPostWithMedia } from "@/lib/feed-mappers";
import { queryKeys } from "@/lib/query-keys";

type ViewMode = "grid" | "list";
type FilterType = "all" | "free" | "premium";

export function useCreatorProfileData(id?: string) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [creator, setCreator] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostWithMedia[]>([]);
  const [purchasedPosts, setPurchasedPosts] = useState<Set<string>>(new Set());
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [x402Modal, setX402Modal] = useState<{
    isOpen: boolean;
    postId: string;
    postTitle: string;
    postPrice: number;
    creatorName: string;
    mediaType: "video" | "image";
  } | null>(null);

  const postsQuery = useQuery({
    queryKey: queryKeys.posts.active(100, 0),
    queryFn: () => fetchPosts({ active: true, limit: 100, offset: 0 }),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    enabled: !!id,
  });

  useEffect(() => {
    const feed = postsQuery.data as FeedPost[] | undefined;
    if (!feed || !id) return;
    const creatorWallet = id;
    setCreator(toCreatorFromWallet(creatorWallet));
    const creatorPosts = feed
      .filter((p) => (p.creatorWallet || "unknown") === creatorWallet)
      .map((p) => toPostWithMedia(p));
    setPosts(creatorPosts);
  }, [postsQuery.data, id]);

  const purchasesQuery = useQuery({
    queryKey: queryKeys.purchases.user(currentUser?.id ?? "anon"),
    queryFn: fetchPurchases,
    enabled: !!currentUser,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  useEffect(() => {
    const activeIds = purchasesQuery.data?.active.map((p) => p.assetId) ?? [];
    setPurchasedPosts(new Set(activeIds));
  }, [purchasesQuery.data]);

  const filteredPosts = useMemo(() => {
    switch (filter) {
      case "free":
        return posts.filter((p) => !p.isPremium);
      case "premium":
        return posts.filter((p) => p.isPremium);
      default:
        return posts;
    }
  }, [posts, filter]);

  const openX402Payment = useCallback(
    (post: PostWithMedia) => {
      if (!creator) return;
      setX402Modal({
        isOpen: true,
        postId: post.id,
        postTitle: translatePost(post.title, post.description).title,
        postPrice: post.postPrice || 5,
        creatorName: creator.username,
        mediaType: post.mediaType,
      });
      setUnlocking(post.id);
    },
    [creator]
  );

  const closeX402Modal = () => {
    setX402Modal(null);
    setUnlocking(null);
  };

  const handleX402Success = () => {
    if (x402Modal && currentUser) {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.user(currentUser?.id ?? "anon") });
      toast({
        title: t.fanHome.unlocked,
        description: t.fanHome.unlockedAccess,
      });
      setUnlocking(null);
    }
  };

  const isUnlocked = useCallback(
    (post: PostWithMedia) => {
      if (!post.isPremium) return true;
      return purchasedPosts.has(post.id);
    },
    [purchasedPosts]
  );

  const freeCount = posts.filter((p) => !p.isPremium).length;
  const premiumCount = posts.filter((p) => p.isPremium).length;
  const postsWithMedia = posts.filter((p) => p.mediaUrl).length;

  return {
    creator,
    posts,
    filteredPosts,
    viewMode,
    setViewMode,
    filter,
    setFilter,
    freeCount,
    premiumCount,
    postsWithMedia,
    unlocking,
    x402Modal,
    openX402Payment,
    closeX402Modal,
    handleX402Success,
    isUnlocked,
    isLoading: postsQuery.isLoading,
  };
}
