import { Link } from "wouter";
import { Compass, Filter, Sparkles, Unlock, ChevronDown, ChevronUp, X } from "lucide-react";
import type { CurrentUser } from "@shared/schema";
import { getInitials } from "@/lib/formatters";
import { t } from "@/lib/strings";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type LeftSidebarProps = {
  currentUser: CurrentUser | null;
  selectedTags: Set<string>;
  showTagFilter: boolean;
  allTags: string[];
  onToggleTagFilter: () => void;
  onToggleTag: (tag: string) => void;
  onClearAllTags: () => void;
};

export function LeftSidebar({
  currentUser,
  selectedTags,
  showTagFilter,
  allTags,
  onToggleTagFilter,
  onToggleTag,
  onClearAllTags,
}: LeftSidebarProps) {
  return (
    <aside className="left-sidebar sticky-sidebar hidden lg:block">
      <Card className="glass">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-primary/10">
            <Avatar className="h-12 w-12 avatar-ring-primary">
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                {currentUser ? getInitials(currentUser.username) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{currentUser?.username}</p>
              <p className="text-xs text-muted-foreground">@{currentUser?.username.toLowerCase()}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start gap-3 h-11 bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
                {t.fanHome.feed}
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="ghost" className="w-full justify-start gap-3 h-11">
                <Compass className="h-5 w-5" />
                {t.fanHome.discover}
              </Button>
            </Link>
            <Link href="/purchases">
              <Button variant="ghost" className="w-full justify-start gap-3 h-11">
                <Unlock className="h-5 w-5" />
                {t.fanHome.myPurchases}
              </Button>
            </Link>
          </nav>

          <div className="mt-4 pt-4 border-t border-border/50">
            {allTags.length > 0 && (
              <>
                <button
                  onClick={onToggleTagFilter}
                  className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {t.fanHome.filterByTags || "Filtruj po tagach"}
                    {selectedTags.size > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {selectedTags.size}
                      </Badge>
                    )}
                  </span>
                  {showTagFilter ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showTagFilter && (
                  <div className="mt-3 space-y-2">
                    {selectedTags.size > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
                        onClick={onClearAllTags}
                      >
                        <X className="h-3 w-3 mr-1" />
                        {t.fanHome.clearFilters || "Wyczyść filtry"}
                      </Button>
                    )}
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                      {allTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTags.has(tag) ? "default" : "outline"}
                          className={`cursor-pointer text-[10px] px-2 py-0.5 transition-all ${
                            selectedTags.has(tag) ? "bg-primary text-primary-foreground" : "hover:bg-primary/20"
                          }`}
                          onClick={() => onToggleTag(tag)}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
