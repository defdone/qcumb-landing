import { Link } from "wouter";
import { Crown, Image as ImageIcon, TrendingUp } from "lucide-react";
import type { User, Post } from "@shared/schema";
import { t } from "@/lib/strings";
import { getInitials } from "@/lib/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface CreatorWithStats extends User {
  postCount: number;
  premiumCount: number;
  mediaCount: number;
  latestPost?: Post;
}

type FeaturedCreatorsProps = {
  creators: CreatorWithStats[];
};

export function FeaturedCreators({ creators }: FeaturedCreatorsProps) {
  if (creators.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">{t.explore.featuredCreators}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {creators.map((creator, index) => (
          <Link key={creator.id} href={`/creator/${creator.id}`}>
            <Card className="overflow-hidden card-hover cursor-pointer h-full">
              <div
                className={`h-24 bg-gradient-to-br ${
                  index === 0
                    ? "from-primary/40 to-secondary/40"
                    : index === 1
                    ? "from-secondary/40 to-accent/40"
                    : "from-accent/40 to-primary/40"
                }`}
              />

              <CardContent className="relative pt-0 p-6">
                <Avatar className="h-20 w-20 -mt-10 border-4 border-card shadow-lg">
                  {creator.avatarUrl ? (
                    <AvatarImage src={creator.avatarUrl} alt={creator.username} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white">
                    {getInitials(creator.username)}
                  </AvatarFallback>
                </Avatar>

                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{creator.username}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">@{creator.username.toLowerCase()}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      {creator.postCount}
                    </span>
                    {creator.premiumCount > 0 && (
                      <span className="flex items-center gap-1 text-accent">
                        <Crown className="h-4 w-4" />
                        {creator.premiumCount}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
