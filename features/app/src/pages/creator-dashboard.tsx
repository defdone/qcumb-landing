import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchPosts, uploadCreatorPost, fetchStreamAccess, type FeedPost } from "@/lib/posts-api";
import { t } from "@/lib/strings";
import { formatPrice, formatTimeAgo } from "@/lib/formatters";
import { queryKeys } from "@/lib/query-keys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MediaPlayer } from "@/components/media-player";
import { useToast } from "@/hooks/use-toast";
import { Plus, Crown, ImageIcon, VideoIcon, UploadCloud, X, Eye, Calendar, DollarSign } from "lucide-react";
import { CreatorDashboardSkeleton } from "@/components/skeletons/CreatorDashboardSkeleton";

export default function CreatorDashboard() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    type: "video" as "video" | "image",
    priceUsd24h: "",
    priceUsd7d: "",
  });
  const [protectedFile, setProtectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [postsWithMedia, setPostsWithMedia] = useState<FeedPost[]>([]);
  const streamFetchRef = useRef<Set<string>>(new Set());

  const postsQuery = useQuery({
    queryKey: queryKeys.posts.active(100, 0),
    queryFn: () => fetchPosts({ active: true, limit: 100, offset: 0 }),
    enabled: !!currentUser,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  const posts = useMemo<FeedPost[]>(() => {
    const ownerId = currentUser?.id?.toLowerCase();
    if (!ownerId) return [];
    return (postsQuery.data ?? []).filter((p) => {
      const creatorWallet = p.creatorWallet?.toLowerCase();
      const previewHasWallet = p.previewUrl?.toLowerCase().includes(ownerId);
      return creatorWallet === ownerId || previewHasWallet;
    });
  }, [postsQuery.data, currentUser?.id]);

  useEffect(() => {
    setPostsWithMedia(posts);
  }, [posts]);

  useEffect(() => {
    if (!currentUser || posts.length === 0) return;

    posts.forEach((post) => {
      if (streamFetchRef.current.has(post.id)) return;
      streamFetchRef.current.add(post.id);
      if (process.env.NODE_ENV === "development") {
        console.log("[stream-access] dashboard", { postId: post.id });
      }
      fetchStreamAccess(post.id)
        .then((response) => {
          if (!response?.url) return;
          setPostsWithMedia((prev) =>
            prev.map((item) =>
              item.id === post.id ? { ...item, previewUrl: response.url } : item
            )
          );
        })
        .catch(() => {
          streamFetchRef.current.delete(post.id);
        });
    });
  }, [currentUser, posts]);

  if (!currentUser) return null;

  const handleChange =
    (field: keyof typeof formValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const resetForm = () => {
    setFormValues({
      title: "",
      description: "",
      type: "video",
      priceUsd24h: "",
      priceUsd7d: "",
    });
    setProtectedFile(null);
    setUploadError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError(null);

    const title = formValues.title.trim();
    const description = formValues.description.trim();
    const priceUsd24h = Number(formValues.priceUsd24h);
    const priceUsd7d = Number(formValues.priceUsd7d);

    if (!title) {
      setUploadError("Title is required");
      return;
    }
    if (!formValues.type) {
      setUploadError("Type is required");
      return;
    }
    if (!protectedFile) {
      setUploadError("Protected file is required");
      return;
    }
    if (Number.isNaN(priceUsd24h) || Number.isNaN(priceUsd7d)) {
      setUploadError("Both price fields are required");
      return;
    }

    setIsUploading(true);
    try {
      const post = await uploadCreatorPost({
        title,
        description: description || undefined,
        type: formValues.type,
        priceUsd24h,
        priceUsd7d,
        protectedFile,
      });

      const normalizedPost: FeedPost = {
        ...post,
        creatorWallet: post.creatorWallet ?? currentUser.id,
        description: post.description ?? null,
      };

      queryClient.setQueryData<FeedPost[]>(queryKeys.posts.active(100, 0), (old = []) => {
        const next = [normalizedPost, ...old];
        const seen = new Set<string>();
        return next.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.active(100, 0) });

      toast({
        title: "Uploaded",
        description: "Your post is now live.",
      });

      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadError(message);
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const stats = useMemo(() => {
    const total = postsWithMedia.length;
    const premium = postsWithMedia.filter((p) => (p.pricing?.["24h"]?.price ?? 0) > 0).length;
    const free = total - premium;
    return { total, premium, free };
  }, [postsWithMedia]);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.dashboard.manageAccount}</h1>
            <p className="text-muted-foreground mt-1">
              Share premium or free posts with your audience.
            </p>
          </div>
          <Button className="gap-2 glow-primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {t.dashboard.newPost}
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total posts</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-amber-500/10 p-3">
                <Crown className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.premium}</p>
                <p className="text-sm text-muted-foreground">Premium</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-green-500/10 p-3">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.free}</p>
                <p className="text-sm text-muted-foreground">Free</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {postsQuery.isLoading ? (
          <CreatorDashboardSkeleton />
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t.dashboard.yourPosts}</h2>
              <span className="text-sm text-muted-foreground">{postsWithMedia.length} posts</span>
            </div>
            {postsWithMedia.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 rounded-full bg-muted p-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{t.dashboard.noPosts}</h3>
                  <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                    {t.dashboard.createFirstPostDesc}
                  </p>
                  <Button onClick={() => setIsModalOpen(true)} className="glow-primary">
                    {t.dashboard.createFirstPost}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {postsWithMedia.map((post) => {
                  const price = post.pricing?.["24h"]?.price ?? 0;
                  return (
                    <Card key={post.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="relative aspect-video bg-muted">
                        {post.previewUrl ? (
                          <MediaPlayer
                            src={post.previewUrl}
                            alt={post.title}
                            showControls={false}
                            previewOnly
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            {post.mediaType === "video" ? (
                              <VideoIcon className="h-12 w-12 text-muted-foreground/50" />
                            ) : (
                              <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                            )}
                          </div>
                        )}
                        <div className="absolute left-2 top-2 flex flex-wrap items-center gap-1">
                          {price > 0 ? (
                            <Badge className="gap-1 bg-amber-500/90 text-white">
                              <Crown className="h-3 w-3" />
                              {formatPrice(price)}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Free</Badge>
                          )}
                          <Badge variant="outline" className="bg-background/80 capitalize backdrop-blur-sm">
                            {post.mediaType}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="font-semibold line-clamp-1">{post.title}</h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatTimeAgo(post.createdAt)}
                          </div>
                        </div>
                        {post.description ? (
                          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                            {post.description}
                          </p>
                        ) : null}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>7d: {formatPrice(post.pricing?.["7d"]?.price ?? 0)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-primary to-secondary p-2">
                <Plus className="h-5 w-5 text-white" />
              </div>
              {t.dashboard.createNewPost}
            </DialogTitle>
            <DialogDescription>{t.dashboard.shareWithFans}</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.dashboard.title}</label>
              <Input
                value={formValues.title}
                onChange={handleChange("title")}
                placeholder={t.dashboard.titlePlaceholder}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formValues.type === "image" ? "secondary" : "outline"}
                  className="flex-1 gap-2"
                  onClick={() => setFormValues((prev) => ({ ...prev, type: "image" }))}
                >
                  <ImageIcon className="h-4 w-4" />
                  Image
                </Button>
                <Button
                  type="button"
                  variant={formValues.type === "video" ? "secondary" : "outline"}
                  className="flex-1 gap-2"
                  onClick={() => setFormValues((prev) => ({ ...prev, type: "video" }))}
                >
                  <VideoIcon className="h-4 w-4" />
                  Video
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t.dashboard.description}</label>
              <textarea
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formValues.description}
                onChange={handleChange("description")}
                placeholder={t.dashboard.descriptionPlaceholder}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (24h)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formValues.priceUsd24h}
                  onChange={handleChange("priceUsd24h")}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (7d)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formValues.priceUsd7d}
                  onChange={handleChange("priceUsd7d")}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Media file</label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/30 p-6 text-center text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-card/50">
                <UploadCloud className="h-8 w-8" />
                <span className="font-medium">
                  {protectedFile ? protectedFile.name : "Click to upload file"}
                </span>
                <span className="text-xs">Max 500MB · Preview auto-generated</span>
                <Input
                  type="file"
                  className="hidden"
                  onChange={(event) => setProtectedFile(event.target.files?.[0] ?? null)}
                  required
                />
              </label>
            </div>

            {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  resetForm();
                  setIsModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 glow-primary" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload post"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
