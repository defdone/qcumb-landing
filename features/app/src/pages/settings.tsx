import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Wallet } from "lucide-react";

export default function SettingsPage() {
  const { currentUser, setRole } = useAuth();
  const { toast } = useToast();
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const handleRoleChange = async (role: "fan" | "creator") => {
    if (!currentUser) return;
    setIsUpdatingRole(true);
    try {
      await setRole(role);
      toast({
        title: "Role updated",
        description: role === "creator" ? "You are now a creator." : "Switched to fan role.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update role.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-settings-title">
            <Settings className="h-8 w-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>
              Profile editing is handled by the backend and is read-only here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="font-medium">{currentUser.username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge variant="secondary" className="capitalize">
                {currentUser.role}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wallet address</p>
              <p className="text-xs font-mono text-muted-foreground">{currentUser.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Creator access
            </CardTitle>
            <CardDescription>
              Switch between fan and creator role for your wallet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current role</p>
                <p className="text-sm text-muted-foreground">{currentUser.role}</p>
              </div>
              {currentUser.role !== "creator" ? (
                <Button
                  onClick={() => handleRoleChange("creator")}
                  disabled={isUpdatingRole}
                  className="glow-primary"
                >
                  Become a creator
                </Button>
              ) : (
                <Button
                  onClick={() => handleRoleChange("fan")}
                  disabled={isUpdatingRole}
                  variant="secondary"
                >
                  Switch to fan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
