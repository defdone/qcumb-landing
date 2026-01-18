import { Link } from "wouter";
import type { User } from "@shared/schema";
import { t, translateBio } from "@/lib/strings";
import { getInitials } from "@/lib/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type CreatorInfoCardProps = {
  creator: User;
};

export function CreatorInfoCard({ creator }: CreatorInfoCardProps) {
  return (
    <Card className="glass mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Link href={`/creator/${creator.id}`}>
            <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
              <Avatar className="h-14 w-14 avatar-ring-primary">
                {creator.avatarUrl ? (
                  <AvatarImage src={creator.avatarUrl} alt={creator.username} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-lg font-semibold">
                  {getInitials(creator.username)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{creator.username}</p>
                <p className="text-sm text-muted-foreground">@{creator.username.toLowerCase()}</p>
              </div>
            </div>
          </Link>
        </div>

        {creator.bio && (
          <p className="text-sm text-muted-foreground mt-3">
            {translateBio(creator.username, creator.bio)}
          </p>
        )}

        {creator.tags && creator.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {creator.tags.map((tag: string) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs bg-primary/10 border-primary/30 text-primary"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
