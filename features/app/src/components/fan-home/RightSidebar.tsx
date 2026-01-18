import { Link } from "wouter";
import { ChevronRight, TrendingUp } from "lucide-react";
import type { CreatorWithStats } from "@/lib/types";
import { getInitials } from "@/lib/formatters";
import { t } from "@/lib/strings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type RightSidebarProps = {
  creators: CreatorWithStats[];
};

export function RightSidebar({ creators }: RightSidebarProps) {
  return (
    <aside className="right-sidebar sticky-sidebar hidden md:block">
      <Card className="glass mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">{t.fanHome.suggestedCreators}</h3>
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="text-xs text-primary">
                {t.fanHome.seeAll}
              </Button>
            </Link>
          </div>

          <div className="space-y-4 max-h-64 overflow-y-auto">
            {creators.map((creator) => (
              <div key={creator.id} className="flex items-center gap-3">
                <Link href={`/creator/${creator.id}`}>
                  <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                    {creator.avatarUrl ? (
                      <AvatarImage src={creator.avatarUrl} alt={creator.username} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 font-medium">
                      {getInitials(creator.username)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/creator/${creator.id}`}>
                    <p className="font-medium text-sm truncate hover:text-primary cursor-pointer transition-colors">
                      {creator.username}
                    </p>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {creator.postCount} {creator.postCount === 1 ? t.explore.post : t.explore.posts}
                  </p>
                </div>
                <Link href={`/creator/${creator.id}`}>
                  <Button size="sm" variant="outline" className="text-xs h-8">
                    {t.fanHome.view}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">{t.fanHome.trending}</h3>
          </div>
          <div className="space-y-3">
            {[t.fanHome.newContent, t.fanHome.exclusive, t.fanHome.behindScenes].map((tag, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">#{tag.replace(" ", "")}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
