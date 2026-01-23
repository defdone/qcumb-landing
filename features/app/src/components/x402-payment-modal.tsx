import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import { ConnectKitButton } from "connectkit";
import { useX402Payment, type PlanType } from "@/hooks/use-x402-payment";
import { formatPrice } from "@/lib/formatters";
import { useWalletSession } from "../../../auth/hooks/use-wallet-session";

interface X402PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contentId: string;
  contentTitle: string;
  mediaType: "video" | "image";
  priceUSD: number;
  creatorName: string;
}

const getSessionHeader = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("x402_wallet_session");
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { sessionToken?: string };
    if (!parsed?.sessionToken) return {};
    return { "X-Wallet-Session": parsed.sessionToken };
  } catch {
    return {};
  }
};

export function X402PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  contentId,
  contentTitle,
  mediaType,
  priceUSD,
  creatorName,
}: X402PaymentModalProps) {
  const {
    paymentStatus,
    paymentRequirements,
    walletAddress,
    error,
    pricing,
    selectedPlan,
    requestPayment,
    executePayment,
    resetPayment,
    setSelectedPlan,
  } = useX402Payment();
  const { isAuthenticated, isAuthenticating, authenticate } = useWalletSession();
  const [authRequested, setAuthRequested] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    resetPayment();
    setAuthRequested(false);
  }, [isOpen, resetPayment]);

  useEffect(() => {
    if (!isOpen) return;
    requestPayment(contentId, mediaType, getSessionHeader()).catch(() => {});
  }, [isOpen, contentId, mediaType, selectedPlan, requestPayment]);

  useEffect(() => {
    if (paymentStatus === "success") {
          onSuccess();
          onClose();
    }
  }, [paymentStatus, onSuccess, onClose]);

  useEffect(() => {
    if (!isOpen || !walletAddress || isAuthenticated || isAuthenticating || authRequested) return;
    setAuthRequested(true);
    authenticate(walletAddress).catch(() => {});
  }, [isOpen, walletAddress, isAuthenticated, isAuthenticating, authRequested, authenticate]);

  const isProcessing = ["signing", "settling"].includes(paymentStatus);
  const isConnecting = paymentStatus === "connecting";
  const isRequesting = paymentStatus === "requesting";

  const handlePay = async () => {
    await executePayment(getSessionHeader());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Wallet className="h-5 w-5 text-white" />
              </div>
            Unlock content
            </DialogTitle>
            <DialogDescription>
              Review the plan and confirm the payment to unlock this post.
            </DialogDescription>
          </DialogHeader>

        <div className="space-y-6 py-2">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Unlock post</p>
                    <p className="font-semibold">{contentTitle}</p>
              <p className="text-xs text-muted-foreground">By: {creatorName}</p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline">x402</Badge>
                <Badge variant="secondary">{formatPrice(priceUSD)}</Badge>
                </div>
              </CardContent>
            </Card>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Access duration</p>
            <div className="flex gap-2">
              {(["24h", "7d"] as PlanType[]).map((plan) => (
                <Button 
                  key={plan}
                  variant={selectedPlan === plan ? "secondary" : "outline"}
                  onClick={() => setSelectedPlan(plan)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {plan === "24h" ? "24 hours" : "7 days"}
                  {pricing?.[plan] && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {pricing[plan].priceFormatted}
                    </span>
                  )}
                        </Button>
              ))}
                        </div>
                      </div>

          {!walletAddress ? (
            <ConnectKitButton.Custom>
              {({ show }) => (
                <Button type="button" onClick={show} className="w-full" disabled={isConnecting}>
                  {isConnecting ? "Connecting..." : "Connect wallet"}
                </Button>
              )}
            </ConnectKitButton.Custom>
          ) : (
            <Button type="button" onClick={handlePay} className="w-full glow-primary" disabled={isProcessing || isRequesting || !paymentRequirements}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay with wallet"
              )}
                  </Button>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
                  </div>
          )}

          {paymentStatus === "success" && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Payment confirmed
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
  );
}
