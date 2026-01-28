import type { FeedPost } from "@/lib/posts-api";
import type { Post, User } from "@shared/schema";
import type { PostWithMedia } from "@/lib/types";

export const toCreatorFromWallet = (wallet?: string | null): User => ({
  id: wallet || "unknown",
  username: wallet ? `wallet_${wallet.slice(2, 8)}` : "Creator",
  role: "creator",
  bio: "",
  tags: [],
  avatarUrl: undefined,
  walletAddress: wallet || undefined,
});

export const toPostFromFeed = (post: FeedPost): Post => ({
  id: post.id,
  creatorId: post.creatorWallet || "unknown",
  title: post.title,
  description: post.description ?? "",
  mediaUrl: post.previewUrl,
  isPremium: (post.pricing?.["24h"]?.price ?? 0) > 0,
  postPrice: post.pricing?.["24h"]?.price ?? 0,
  tags: [],
  moderationStatus: "approved",
  moderationApprovals: 2,
});

export const toPostWithMedia = (post: FeedPost): PostWithMedia => ({
  ...toPostFromFeed(post),
  mediaType: post.mediaType,
  createdAt: post.createdAt,
});
