import { useParams } from "wouter";
import { t, translatePost } from "@/lib/strings";
import { PostHeaderBar } from "@/components/post-view/PostHeaderBar";
import { CreatorInfoCard } from "@/components/post-view/CreatorInfoCard";
import { PostContentCard } from "@/components/post-view/PostContentCard";
import { PostViewSkeleton } from "@/components/skeletons/PostViewSkeleton";
import { X402PaymentModal } from "@/components/x402-payment-modal";
import { usePostViewData } from "@/hooks/use-post-view-data";

export default function PostView() {
  const { id } = useParams<{ id: string }>();
  const {
    post,
    creator,
    mediaType,
    unlocked,
    isLoading,
    unlocking,
    isBookmarked,
    setIsBookmarked,
    showX402Modal,
    openPaymentModal,
    closePaymentModal,
    handlePaymentSuccess,
  } = usePostViewData(id);

  if (isLoading) {
    return <PostViewSkeleton />;
  }

  if (!post || !creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{t.common.loading}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PostHeaderBar />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <CreatorInfoCard creator={creator} />

        <PostContentCard
          post={post}
          unlocked={unlocked}
          unlocking={unlocking}
          isBookmarked={isBookmarked}
          onToggleBookmark={() => setIsBookmarked(!isBookmarked)}
          onUnlock={openPaymentModal}
        />
      </div>

      {/* x402 Payment Modal for post */}
      {post && creator && (
        <X402PaymentModal
          isOpen={showX402Modal}
          onClose={closePaymentModal}
          onSuccess={handlePaymentSuccess}
          contentId={post.id}
          contentTitle={translatePost(post.title, post.description).title}
          mediaType={mediaType}
          priceUSD={post.postPrice || 5}
          creatorName={creator.username}
        />
      )}
      
      {/* Subskrypcje usunięte - zgodnie z PDF: "No subscriptions" */}
    </div>
  );
}

