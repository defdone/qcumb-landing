import { z } from "zod";

export const userRoles = ["creator", "fan", "admin"] as const;
export type UserRole = typeof userRoles[number];

export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().optional(), // Wallet login - no password required
  role: z.enum(userRoles),
  bio: z.string().optional(),
  tags: z.array(z.string()).optional(),
  walletAddress: z.string().optional(), // Crypto wallet address (e.g., MetaMask)
  avatarUrl: z.string().optional(), // Profile picture (base64 or URL)
  payoutWalletAddress: z.string().optional(), // Payout wallet address for creators
});

// Predefined tags for adult content
export const ADULT_CONTENT_TAGS = [
  "softcore",
  "hardcore",
  "solo",
  "couples",
  "lesbian",
  "gay",
  "bisexual",
  "trans",
  "bdsm",
  "bondage",
  "domination",
  "fetish",
  "feet",
  "lingerie",
  "cosplay",
  "roleplay",
  "amateur",
  "professional",
  "pov",
  "anal",
  "oral",
  "toys",
  "outdoor",
  "public",
  "voyeur",
  "massage",
  "tattoos",
  "piercing",
  "curvy",
  "petite",
  "milf",
  "teen",
  "mature",
  "bbw",
  "fitness",
  "asian",
  "latina",
  "ebony",
  "redhead",
  "blonde",
  "brunette",
] as const;

export type AdultContentTag = typeof ADULT_CONTENT_TAGS[number];

export type User = z.infer<typeof userSchema>;

export const insertUserSchema = userSchema.omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;

// ============================================
// CONTENT MODERATION SYSTEM
// ============================================

// Moderation statuses - requires 2 admin approvals
export const moderationStatuses = ['pending', 'approved', 'reported', 'deleted'] as const;
export type ModerationStatus = typeof moderationStatuses[number];

export const postSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  mediaUrl: z.string().optional(),
  isPremium: z.boolean().default(false),
  postPrice: z.number().default(5),
  tags: z.array(z.string()).optional(),
  // Moderation fields
  moderationStatus: z.enum(moderationStatuses).default('pending'),
  moderationApprovals: z.number().default(0), // Number of admin approvals (requires 2)
  moderationNote: z.string().optional(), // Admin moderation note
  moderatedAt: z.number().optional(), // Timestamp of last moderation
  moderatedBy: z.string().optional(), // ID of admin who moderated
});

export type Post = z.infer<typeof postSchema>;

export const insertPostSchema = postSchema.omit({ id: true });
export type InsertPost = z.infer<typeof insertPostSchema>;

// ============================================
// RENTAL / ACCESS GRANT SYSTEM
// ============================================

export const accessTypes = ['rental_24h', 'rental_7d', 'rental_30d', 'purchase'] as const;
export type AccessType = typeof accessTypes[number];

// Rental duration configuration (in milliseconds)
export const RENTAL_DURATIONS: Record<AccessType, number> = {
  'rental_24h': 24 * 60 * 60 * 1000,      // 24 hours
  'rental_7d': 7 * 24 * 60 * 60 * 1000,   // 7 days
  'rental_30d': 30 * 24 * 60 * 60 * 1000, // 30 days
  'purchase': Infinity,                    // Permanent access
};

// Price multipliers for different access types
export const RENTAL_PRICE_MULTIPLIERS: Record<AccessType, number> = {
  'rental_24h': 0.3,  // 30% of base price
  'rental_7d': 0.5,   // 50% of base price
  'rental_30d': 0.75, // 75% of base price
  'purchase': 1.0,    // 100% of base price
};

export const accessGrantSchema = z.object({
  id: z.string(),
  userId: z.string(),
  postId: z.string(),
  accessType: z.enum(accessTypes),
  createdAt: z.number(), // Unix timestamp
  expiresAt: z.number().nullable(), // Unix timestamp, null means never expires
  txHash: z.string().optional(), // Transaction hash for x402 payments
  price: z.number(), // Price paid in USD
});

export type AccessGrant = z.infer<typeof accessGrantSchema>;

// Legacy format for backward compatibility
export const purchaseSchema = z.object({
  postId: z.string(),
  userId: z.string(),
});

export type Purchase = z.infer<typeof purchaseSchema>;

// Subscriptions removed per requirements: "No subscriptions"

export const currentUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.enum(userRoles),
});

export type CurrentUser = z.infer<typeof currentUserSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

export type LoginData = z.infer<typeof loginSchema>;

export const registerSchema = insertUserSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export type RegisterData = z.infer<typeof registerSchema>;
