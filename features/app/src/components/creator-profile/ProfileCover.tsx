import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfileCover() {
  return (
    <div className="relative h-48 sm:h-64 md:h-80 bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

      <Link href="/explore">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-background/50 backdrop-blur-sm hover:bg-background/70"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
}
