import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PostHeaderBar() {
  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold">Post</h1>
      </div>
    </div>
  );
}
