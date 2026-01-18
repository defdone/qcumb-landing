import { Link } from "wouter";
import { Crown, Image as ImageIcon } from "lucide-react";
import type { User, Post } from "@shared/schema";
import { t, translateBio } from "@/lib/strings";
import { getInitials } from "@/lib/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface CreatorWithStats extends User {
  postCount: number;
  premiumCount: number;
  mediaCount: number;
  latestPost?: Post;
}

type CreatorsGridProps = {
  creators: CreatorWithStats[];
};

export function CreatorsGrid({ creators }: CreatorsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {creators.map((creator) => (
        <Link key={creator.id} href={`/creator/${creator.id}`}>
          <Card className="card-hover cursor-pointer h-full">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 flex-shrink-0">
                  {creator.avatarUrl ? (
                    <AvatarImage src={creator.avatarUrl} alt={creator.username} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-lg font-semibold">
                    {getInitials(creator.username)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{creator.username}</h3>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">@{creator.username.toLowerCase()}</p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5" />
                      {creator.postCount} {creator.postCount === 1 ? t.explore.post : t.explore.posts}
                    </span>
                    {creator.premiumCount > 0 && (
                      <Badge variant="secondary" className="text-xs gap-1 text-accent border-accent/20">
                        <Crown className="h-3 w-3" />
                        {creator.premiumCount}
                      </Badge>
                    )}
                  </div>

                  {creator.bio && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {translateBio(creator.username, creator.bio)}
                    </p>
                  )}

                  {creator.tags && creator.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {creator.tags.slice(0, 4).map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 bg-secondary/10 border-secondary/30 text-secondary"
                        >
                          #{tag}
                        </Badge>
                      ))}
                      {creator.tags.length > 4 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          +{creator.tags.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {creator.latestPost?.mediaUrl && (
                <div className="mt-4 rounded-lg overflow-hidden bg-muted aspect-video relative">
                  <img
                    src={creator.latestPost.mediaUrl}
                    alt=""
                    className={`w-full h-full object-cover ${creator.latestPost.isPremium ? "blur-md" : ""}`}
                    loading="lazy"
                    decoding="async"
                  />
                  {creator.latestPost.isPremium && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                      <Badge className="bg-accent/90">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
