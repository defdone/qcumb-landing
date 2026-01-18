export const queryKeys = {
  posts: {
    active: (limit: number, offset: number) => ["posts", "active", limit, offset] as const,
  },
  post: {
    byId: (id: string) => ["post", "byId", id] as const,
  },
  purchases: {
    user: (userId: string) => ["purchases", "user", userId] as const,
  },
};
