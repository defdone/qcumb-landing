import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { CreatorWithStats } from "@/lib/types";
import { getInitials } from "@/lib/formatters";

type StoriesStripProps = {
  creators: CreatorWithStats[];
  storiesScrollRef: React.RefObject<HTMLDivElement>;
  onScroll: (direction: "left" | "right") => void;
};

export function StoriesStrip({ creators, storiesScrollRef, onScroll }: StoriesStripProps) {
  return (
    <div className="mb-6 relative group/stories">
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm shadow-md opacity-0 group-hover/stories:opacity-100 transition-opacity"
        onClick={() => onScroll("left")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm shadow-md opacity-0 group-hover/stories:opacity-100 transition-opacity"
        onClick={() => onScroll("right")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div
        ref={storiesScrollRef}
        className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide scroll-smooth px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {creators.map((creator) => (
          <Link key={creator.id} href={`/creator/${creator.id}`}>
            <div className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0">
              <div className="p-0.5 rounded-full animated-gradient">
                <Avatar className="h-16 w-16 border-2 border-background">
                  {creator.avatarUrl ? (
                    <AvatarImage src={creator.avatarUrl} alt={creator.username} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-lg font-semibold">
                    {getInitials(creator.username)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs font-medium truncate max-w-[70px] group-hover:text-primary transition-colors">
                {creator.username}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
