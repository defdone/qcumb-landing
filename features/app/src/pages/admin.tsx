import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-10">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Admin panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Admin tools are temporarily unavailable in this build.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
