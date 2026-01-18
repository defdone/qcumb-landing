import { useEffect, useMemo, useState } from "react";
import type { Post } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPost, fetchPurchases } from "@/lib/posts-api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { t } from "@/lib/strings";
import { toCreatorFromWallet, toPostFromFeed } from "@/lib/feed-mappers";
import { queryKeys } from "@/lib/query-keys";

export function usePostViewData(id?: string) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [post, setPost] = useState<Post | null>(null);
  const [creator, setCreator] = useState<ReturnType<typeof toCreatorFromWallet> | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [mediaType, setMediaType] = useState<"video" | "image">("image");
  const [unlocking] = useState(false);
  const [showX402Modal, setShowX402Modal] = useState(false);

  const purchasesQuery = useQuery({
    queryKey: queryKeys.purchases.user(currentUser?.id ?? "anon"),
    queryFn: fetchPurchases,
    enabled: !!currentUser,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  const postQuery = useQuery({
    queryKey: id ? queryKeys.post.byId(id) : ["post", "byId", "missing"],
    queryFn: () => fetchPost(id as string),
    enabled: !!id,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  useEffect(() => {
    const data = postQuery.data;
    if (!data) return;
    const creatorWallet = data.creatorWallet || "unknown";
    setCreator(toCreatorFromWallet(creatorWallet));
    setPost(toPostFromFeed(data));
    setMediaType(data.mediaType);
  }, [postQuery.data]);

  useEffect(() => {
    if (!id) return;
    const activeIds = purchasesQuery.data?.active.map((p) => p.assetId) ?? [];
    setIsUnlocked(activeIds.includes(id));
  }, [id, purchasesQuery.data]);

  const openPaymentModal = () => setShowX402Modal(true);
  const closePaymentModal = () => setShowX402Modal(false);

  const handlePaymentSuccess = () => {
    if (!post) return;
    queryClient.invalidateQueries({ queryKey: queryKeys.purchases.user(currentUser?.id ?? "anon") });
    toast({
      title: t.fanHome.unlocked,
      description: t.fanHome.enjoyContent,
    });
  };

  const unlocked = useMemo(() => !!post && (isUnlocked || !post.isPremium), [post, isUnlocked]);

  return {
    post,
    creator,
    mediaType,
    unlocked,
    isLoading: postQuery.isLoading,
    unlocking,
    isBookmarked,
    setIsBookmarked,
    showX402Modal,
    openPaymentModal,
    closePaymentModal,
    handlePaymentSuccess,
  };
}
