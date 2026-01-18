import { Link } from "wouter";
import {
  Crown,
  Grid3X3,
  ImageIcon,
  LayoutList,
  Lock,
  Play,
  Unlock,
} from "lucide-react";
import type { User } from "@shared/schema";
import type { PostWithMedia } from "@/lib/types";
import { t, translatePost } from "@/lib/strings";
import { formatPrice, getInitials } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MediaPlayer, getMediaType } from "@/components/media-player";

type ViewMode = "grid" | "list";
type FilterType = "all" | "free" | "premium";

type ProfilePostsProps = {
  creator: User;
  posts: PostWithMedia[];
  filteredPosts: PostWithMedia[];
  viewMode: ViewMode;
  filter: FilterType;
  freeCount: number;
  premiumCount: number;
  unlocking: string | null;
  onSetFilter: (filter: FilterType) => void;
  onSetViewMode: (mode: ViewMode) => void;
  onUnlock: (post: PostWithMedia) => void;
  isUnlocked: (post: PostWithMedia) => boolean;
};

export function ProfilePosts({
  creator,
  posts,
  filteredPosts,
  viewMode,
  filter,
  freeCount,
  premiumCount,
  unlocking,
  onSetFilter,
  onSetViewMode,
  onUnlock,
  isUnlocked,
}: ProfilePostsProps) {
  return (
    <Tabs defaultValue={filter} className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <TabsList className="glass">
          <TabsTrigger value="all" onClick={() => onSetFilter("all")}>
            {t.profile.all} ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="free" onClick={() => onSetFilter("free")}>
            {t.profile.free} ({freeCount})
          </TabsTrigger>
          <TabsTrigger value="premium" onClick={() => onSetFilter("premium")}>
            <Crown className="h-3.5 w-3.5 mr-1" />
            Premium ({premiumCount})
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => onSetViewMode("grid")}
            className="h-9 w-9"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => onSetViewMode("list")}
            className="h-9 w-9"
          >
            <LayoutList className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{t.profile.noPosts}</h3>
            <p className="text-muted-foreground text-center">{t.profile.noPostsDesc}</p>
          </CardContent>
        </Card>
      ) : filteredPosts.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{t.profile.noPostsOfType}</h3>
            <p className="text-muted-foreground text-center">{t.profile.noPostsDesc}</p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
          {filteredPosts.map((post) => {
            const unlocked = isUnlocked(post);
            const isUnlockingThis = unlocking === post.id;
            const mediaType = post.mediaUrl ? getMediaType(post.mediaUrl) : null;

            return (
              <div key={post.id} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer bg-muted">
                {post.mediaUrl ? (
                  unlocked ? (
                    <>
                      <MediaPlayer
                        src={post.mediaUrl}
                        showControls={false}
                        muted={true}
                      />
                      {mediaType === "video" && (
                        <div className="absolute top-2 left-2 p-1.5 rounded-full bg-black/60">
                          <Play className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <MediaPlayer src={post.mediaUrl} blurred={true} showControls={false} />
                      <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center">
                        <Lock className="h-8 w-8 text-primary mb-2" />
                        <Button
                          size="sm"
                          onClick={() => onUnlock(post)}
                          disabled={isUnlockingThis}
                          className="glow-primary text-xs"
                        >
                          {isUnlockingThis ? "..." : formatPrice(post.postPrice || 5)}
                        </Button>
                      </div>
                    </>
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                    {post.isPremium && !unlocked ? (
                      <div className="text-center">
                        <Lock className="h-8 w-8 text-primary mx-auto mb-2" />
                        <Button
                          size="sm"
                          onClick={() => onUnlock(post)}
                          disabled={isUnlockingThis}
                          className="glow-primary text-xs"
                        >
                          {isUnlockingThis ? "..." : formatPrice(post.postPrice || 5)}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-center px-2 text-muted-foreground line-clamp-3">
                        {translatePost(post.title, post.description).title}
                      </span>
                    )}
                  </div>
                )}

                {post.isPremium && (
                  <div className="absolute top-2 right-2">
                    <Badge className={unlocked ? "bg-green-500/90" : "bg-accent/90"}>
                      {unlocked ? <Unlock className="h-3 w-3" /> : <Crown className="h-3 w-3" />}
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const unlocked = isUnlocked(post);
            const isUnlockingThis = unlocking === post.id;

            return (
              <Card key={post.id} className="overflow-hidden card-hover">
                <div className="flex items-center gap-3 p-4 pb-3">
                  <Avatar className="h-10 w-10">
                    {creator.avatarUrl ? (
                      <AvatarImage src={creator.avatarUrl} alt={creator.username} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 font-semibold">
                      {getInitials(creator.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{creator.username}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.profile.joinedRecently}</p>
                  </div>
                </div>

                {post.mediaUrl && (
                  <div className="relative">
                    {unlocked ? (
                      <MediaPlayer src={post.mediaUrl} showControls={false} />
                    ) : (
                      <div className="relative aspect-video bg-muted">
                        <MediaPlayer src={post.mediaUrl} blurred={true} showControls={false} />
                        <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center">
                          <Lock className="h-10 w-10 text-primary mb-2" />
                          <Button
                            size="sm"
                            onClick={() => onUnlock(post)}
                            disabled={isUnlockingThis}
                            className="glow-primary"
                          >
                            {isUnlockingThis ? "..." : `${t.fanHome.unlock} ${formatPrice(post.postPrice || 5)}`}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{translatePost(post.title, post.description).title}</h3>
                  {(unlocked || !post.isPremium) && (
                    <p className="text-sm text-muted-foreground">
                      {translatePost(post.title, post.description).description}
                    </p>
                  )}

                  {post.isPremium && !unlocked && (
                    <Badge variant="outline" className="text-accent border-accent/30 mt-3">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium • {formatPrice(post.postPrice || 5)}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </Tabs>
  );
}
