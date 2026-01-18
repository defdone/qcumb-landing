import { Link } from "wouter";
import {
  CheckCircle2,
  Crown,
  Heart,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Unlock,
} from "lucide-react";
import type { PostWithCreator } from "@/lib/types";
import { t, translatePost } from "@/lib/strings";
import { formatPrice, getInitials } from "@/lib/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MediaPlayer, MediaTypeBadge } from "@/components/media-player";

type PostCardProps = {
  post: PostWithCreator;
  unlocked: boolean;
  justUnlocked: boolean;
  onUnlock: (post: PostWithCreator) => void;
  formatTimeAgo: (createdAt?: string) => string;
};

export function PostCard({
  post,
  unlocked,
  justUnlocked,
  onUnlock,
  formatTimeAgo,
}: PostCardProps) {
  return (
    <Card className="overflow-hidden card-hover">
      <div className="flex items-center gap-3 p-4 pb-3">
        <Link href={`/creator/${post.creator.id}`}>
          <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
            {post.creator.avatarUrl ? (
              <AvatarImage src={post.creator.avatarUrl} alt={post.creator.username} className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 font-semibold">
              {getInitials(post.creator.username)}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/creator/${post.creator.id}`}>
              <span className="font-semibold hover:text-primary cursor-pointer transition-colors">
                {post.creator.username}
              </span>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {post.mediaUrl && (
        <div className="relative">
          {unlocked ? (
            <Link href={`/post/${post.id}`}>
              <div className="post-image-container aspect-[4/5] sm:aspect-[16/10] relative cursor-pointer">
                <MediaPlayer src={post.mediaUrl} showControls={false} previewOnly />
                <MediaTypeBadge src={post.mediaUrl} />
              </div>
            </Link>
          ) : (
            <div className="relative aspect-[4/5] sm:aspect-[16/10] overflow-hidden">
              <MediaPlayer src={post.mediaUrl} blurred={true} showControls={false} previewOnly />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="p-4 rounded-full bg-background/80 backdrop-blur-sm mb-4 glow-primary">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">{t.fanHome.premiumContent}</p>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => onUnlock(post)} className="glow-primary subscribe-pulse">
                    <Unlock className="mr-2 h-4 w-4" />
                    {t.fanHome.unlockFor} {formatPrice(post.postPrice || 5)}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {post.isPremium && justUnlocked && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-green-500 text-white gap-1 animate-pulse shadow-lg">
                <CheckCircle2 className="h-3 w-3" />
                {t.fanHome.unlocked}!
              </Badge>
            </div>
          )}
        </div>
      )}

      {!post.mediaUrl && post.isPremium && !unlocked && (
        <div className="relative mx-4 mb-2 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-br from-muted to-muted/50 p-8 text-center">
            <div className="blur-sm select-none text-muted-foreground mb-4">
              {translatePost(post.title, post.description).description.slice(0, 100)}...
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60">
              <div className="p-3 rounded-full bg-background/80 backdrop-blur-sm mb-3 glow-primary">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <Button size="sm" onClick={() => onUnlock(post)} className="glow-primary">
                {`${t.fanHome.unlock} ${formatPrice(post.postPrice || 5)}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 pt-3">
        <div className="flex items-center gap-4 mb-3">
          <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
            <Heart className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MessageCircle className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Share2 className="h-6 w-6" />
          </Button>
        </div>

        <div className="space-y-2">
          <Link href={`/post/${post.id}`}>
            <h3 className="font-semibold hover:text-primary cursor-pointer transition-colors">
              {translatePost(post.title, post.description).title}
            </h3>
          </Link>
          {(unlocked || !post.isPremium) && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {translatePost(post.title, post.description).description}
            </p>
          )}
          {post.isPremium && !unlocked && (
            <Badge variant="outline" className="text-accent border-accent/30">
              <Crown className="h-3 w-3 mr-1" />
              Premium • {formatPrice(post.postPrice || 5)}
            </Badge>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.slice(0, 4).map((tag: string) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 bg-secondary/10 border-secondary/30 text-secondary"
                >
                  #{tag}
                </Badge>
              ))}
              {post.tags.length > 4 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  +{post.tags.length - 4}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
