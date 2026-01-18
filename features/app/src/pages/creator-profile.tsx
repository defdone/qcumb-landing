import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { t } from "@/lib/strings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { ProfileCover } from "@/components/creator-profile/ProfileCover";
import { ProfileHeader } from "@/components/creator-profile/ProfileHeader";
import { ProfilePosts } from "@/components/creator-profile/ProfilePosts";
import { CreatorProfileSkeleton } from "@/components/skeletons/CreatorProfileSkeleton";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { X402PaymentModal } from "@/components/x402-payment-modal";
import { useCreatorProfileData } from "@/hooks/use-creator-profile-data";

export default function CreatorProfile() {
  const { id } = useParams<{ id: string }>();
  useScrollRestoration(`scroll:creator:${id ?? "unknown"}`);
  const {
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
    isLoading,
  } = useCreatorProfileData(id);

  useEffect(() => {
    if (!id || typeof window === "undefined") return;
    const key = `filters:creator:${id}`;
    const raw = sessionStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { filter?: string; viewMode?: string };
        if (parsed.filter) setFilter(parsed.filter as "all" | "free" | "premium");
        if (parsed.viewMode) setViewMode(parsed.viewMode as "grid" | "list");
      } catch {
        // ignore
      }
    }
  }, [id, setFilter, setViewMode]);

  useEffect(() => {
    if (!id || typeof window === "undefined") return;
    const key = `filters:creator:${id}`;
    sessionStorage.setItem(key, JSON.stringify({ filter, viewMode }));
  }, [id, filter, viewMode]);

  if (isLoading) {
    return <CreatorProfileSkeleton />;
  }

  if (!creator) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <Card className="glass w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{t.profile.creatorNotFound}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {t.profile.creatorNotFoundDesc}
            </p>
            <Link href="/explore">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t.profile.backToExplore}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <ProfileCover />

      <div className="relative max-w-4xl mx-auto px-4">
        <ProfileHeader
          creator={creator}
          postsCount={posts.length}
          postsWithMedia={postsWithMedia}
          premiumCount={premiumCount}
        />

        <ProfilePosts
          creator={creator}
          posts={posts}
          filteredPosts={filteredPosts}
          viewMode={viewMode}
          filter={filter}
          freeCount={freeCount}
          premiumCount={premiumCount}
          unlocking={unlocking}
          onSetFilter={setFilter}
          onSetViewMode={setViewMode}
          onUnlock={openX402Payment}
          isUnlocked={isUnlocked}
        />
      </div>

      {/* x402 Payment Modal for posts */}
      {x402Modal && creator && (
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
      
      {/* Subskrypcje usunięte */}
    </div>
  );
}
