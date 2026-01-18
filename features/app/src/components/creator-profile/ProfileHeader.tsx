import type { User } from "@shared/schema";
import { t, translateBio } from "@/lib/strings";
import { getInitials } from "@/lib/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type ProfileHeaderProps = {
  creator: User;
  postsCount: number;
  postsWithMedia: number;
  premiumCount: number;
};

export function ProfileHeader({
  creator,
  postsCount,
  postsWithMedia,
  premiumCount,
}: ProfileHeaderProps) {
  return (
    <div className="relative -mt-20 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="relative">
          <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-background shadow-xl">
            {creator.avatarUrl ? (
              <AvatarImage src={creator.avatarUrl} alt={creator.username} className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-4xl sm:text-5xl font-bold text-white">
              {getInitials(creator.username)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{creator.username}</h1>
            <Badge variant="secondary" className="w-fit">
              {t.profile.creator}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mb-3">
            @{creator.username.toLowerCase()} · {t.profile.joinedRecently}
          </p>

          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="font-bold text-lg">{postsCount}</span>
              <span className="text-muted-foreground ml-1">{t.profile.posts}</span>
            </div>
            <div>
              <span className="font-bold text-lg">{postsWithMedia}</span>
              <span className="text-muted-foreground ml-1">{t.profile.photos}</span>
            </div>
            <div>
              <span className="font-bold text-lg">{premiumCount}</span>
              <span className="text-muted-foreground ml-1">{t.profile.premium}</span>
            </div>
          </div>

          {creator.bio && (
            <p className="mt-4 text-sm text-muted-foreground max-w-xl">
              {translateBio(creator.username, creator.bio)}
            </p>
          )}

          {creator.tags && creator.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {creator.tags.map((tag: string) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs bg-secondary/10 border-secondary/30 text-secondary"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
