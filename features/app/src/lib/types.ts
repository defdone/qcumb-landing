import type { Post, User } from "@shared/schema";

export type PostWithCreator = Post & {
  creator: User;
  mediaType: "video" | "image";
  createdAt?: string;
};

export type PostWithMedia = Post & {
  mediaType: "video" | "image";
  createdAt?: string;
};

export type CreatorWithStats = User & {
  postCount: number;
  premiumCount: number;
  mediaCount: number;
  latestPost?: Post;
};
