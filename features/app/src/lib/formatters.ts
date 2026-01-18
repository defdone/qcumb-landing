export const formatPrice = (priceUSDC: number): string => `${priceUSDC.toFixed(2)} USDC`;

export const formatPricePerMonth = (priceUSDC: number): string =>
  `${priceUSDC.toFixed(2)} USDC/mo`;

export const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

export const formatTimeAgo = (createdAt?: string, suffix = "h ago") => {
  if (!createdAt) return "";
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return "";
  const diffMs = Date.now() - created;
  const hours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
  return `${hours}${suffix}`;
};
