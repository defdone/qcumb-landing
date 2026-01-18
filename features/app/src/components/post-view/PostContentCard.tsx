import { Bookmark, Crown, Heart, Lock, MessageCircle, Share2, Unlock } from "lucide-react";
import type { Post } from "@shared/schema";
import { t, translatePost } from "@/lib/strings";
import { formatPrice } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MediaPlayer } from "@/components/media-player";

type PostContentCardProps = {
  post: Post;
  unlocked: boolean;
  isBookmarked: boolean;
  unlocking: boolean;
  onToggleBookmark: () => void;
  onUnlock: () => void;
};

export function PostContentCard({
  post,
  unlocked,
  isBookmarked,
  unlocking,
  onToggleBookmark,
  onUnlock,
}: PostContentCardProps) {
  return (
    <Card className="glass overflow-hidden">
      {post.mediaUrl && (
        <div className="relative">
          {post.isPremium && !unlocked ? (
            <div className="relative aspect-video bg-muted">
              <MediaPlayer src={post.mediaUrl} alt={post.title} blurred={true} showControls={false} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm">
                <Lock className="h-12 w-12 text-primary mb-4" />
                <p className="text-lg font-semibold mb-2">{t.fanHome.premiumContent}</p>
                <p className="text-sm text-muted-foreground mb-4">{t.fanHome.unlockToSee}</p>
                <Button onClick={onUnlock} disabled={unlocking} className="glow-primary">
                  {unlocking ? (
                    "..."
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      {t.fanHome.unlockFor} {formatPrice(post.postPrice || 5)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <MediaPlayer src={post.mediaUrl} alt={post.title} showControls={true} className="w-full" />
          )}
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-10 w-10" disabled>
              <Heart className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Share2 className="h-6 w-6" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 ${isBookmarked ? "text-primary" : ""}`}
            onClick={onToggleBookmark}
          >
            <Bookmark className={`h-6 w-6 ${isBookmarked ? "fill-current" : ""}`} />
          </Button>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold">{translatePost(post.title, post.description).title}</h2>
          {(unlocked || !post.isPremium) && (
            <p className="text-muted-foreground">{translatePost(post.title, post.description).description}</p>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs bg-secondary/10 border-secondary/30 text-secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {post.isPremium && (
          <div className="mt-4">
            <Badge
              variant="outline"
              className={unlocked ? "text-green-500 border-green-500/30" : "text-accent border-accent/30"}
            >
              {unlocked ? (
                <>
                  <Unlock className="h-3 w-3 mr-1" />
                  {t.fanHome.premiumUnlocked}
                </>
              ) : (
                <>
                  <Crown className="h-3 w-3 mr-1" />
                  Premium • {formatPrice(post.postPrice || 5)}
                </>
              )}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
