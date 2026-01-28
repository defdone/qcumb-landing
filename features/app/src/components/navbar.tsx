import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { useWalletSession } from "@/../../features/auth/hooks/use-wallet-session";
import { t } from "@/lib/strings";
import { getInitials } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, ChevronDown, ShoppingBag, Home, Compass, LayoutDashboard, Plus, Shield } from "lucide-react";

export function Navbar() {
  const { currentUser, logout, isAuthenticated, isFan, isCreator, isReady } = useAuth();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { logout: logoutWalletSession, authenticate, isAuthenticating, session } = useWalletSession();
  const isAdmin = currentUser?.role === "admin";
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isReady) return;
    if (!isConnected || !address) return;
    if (isAuthenticated || isAuthenticating || session) return;
    authenticate(address).catch(() => {});
  }, [isReady, isConnected, address, isAuthenticated, isAuthenticating, session, authenticate]);

  const handleLogout = async () => {
    try {
      disconnect();
    } catch {}
    try {
      await logoutWalletSession();
    } catch {}
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/home";
    }
  };

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="grid h-16 items-center gap-4 px-4 md:px-6 max-w-[1600px] mx-auto grid-cols-[1fr_auto_1fr]">
        {/* Logo */}
        <div className="flex items-center">
          <Link href={isAuthenticated ? (isAdmin ? "/admin" : (currentUser?.role === "creator" ? "/creator" : "/")) : "/"}>
            <div className="flex items-center gap-2 cursor-pointer group" data-testid="link-logo">
              <Image
                src="/logoQC - base - H.png"
                alt="qcumb"
                width={120}
                height={36}
                className="h-9 w-auto transition-transform group-hover:scale-105"
              />
            </div>
          </Link>
        </div>

        {/* Center Navigation for authenticated users (nie dla admina) */}
        <div className="hidden md:flex items-center justify-center w-full">
          {isAuthenticated && !isAdmin && (
            <nav className="flex items-center gap-1">
              {isCreator && (
                <Link href="/creator">
                  <Button 
                    variant={isActive("/creator") ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {t.nav.dashboard}
                  </Button>
                </Link>
              )}
              <Link href="/">
                <Button 
                  variant={isActive("/") ? "secondary" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  {t.nav.feed}
                </Button>
              </Link>
              <Link href="/explore">
                <Button 
                  variant={isActive("/explore") ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Compass className="h-4 w-4" />
                  {t.nav.discover}
                </Button>
              </Link>
            </nav>
          )}
        </div>
        
        {/* Admin navigation */}
        {isAuthenticated && isAdmin && (
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/admin">
              <Button 
                variant={isActive("/admin") ? "secondary" : "ghost"}
                size="sm"
                className="gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30"
              >
                <div className="relative">
                  <Shield className="h-5 w-5 text-primary fill-primary/20 stroke-2" />
                  <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full" />
                </div>
                <span className="font-semibold text-primary">Admin Panel</span>
              </Button>
            </Link>
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2 justify-end w-full">
          {isAuthenticated && currentUser ? (
            <div className="flex items-center gap-3">
              {isCreator && !isAdmin && (
                <Link href="/creator">
                  <Button size="sm" className="gap-2 glow-primary hidden sm:flex">
                    <Plus className="h-4 w-4" />
                    {t.nav.newPost}
                  </Button>
                </Link>
              )}
              
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2" data-testid="button-user-menu">
                    <Avatar className="h-9 w-9 avatar-ring-primary">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-sm font-semibold">
                        {getInitials(currentUser.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium leading-none" data-testid="text-username">
                        {currentUser.username}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5" data-testid="text-role">
                        {currentUser.role === "admin" ? "Admin" : currentUser.role === "creator" ? t.nav.creator : t.nav.fan}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{currentUser.username}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {currentUser.role === "admin" ? "Administrator" : currentUser.role === "creator" ? t.nav.creator : t.nav.fan}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Menu dla użytkowników (nie dla admina) */}
                  {!isAdmin && (
                    <>
                      {isCreator && (
                        <DropdownMenuItem
                          onClick={() => setLocation("/creator")}
                          data-testid="menu-dashboard"
                          className="gap-2"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          {t.nav.dashboard}
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem
                        onClick={() => setLocation("/")}
                        data-testid="menu-feed"
                        className="gap-2"
                      >
                        <Home className="h-4 w-4" />
                        {t.nav.homeFeed}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setLocation("/explore")}
                        data-testid="menu-explore"
                        className="gap-2"
                      >
                        <Compass className="h-4 w-4" />
                        {t.nav.discoverCreators}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setLocation("/purchases")}
                        data-testid="menu-purchases"
                        className="gap-2"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        {t.nav.myPurchases}
                      </DropdownMenuItem>
                      
                    </>
                  )}
                  
                  <DropdownMenuItem
                    onClick={() => setLocation("/settings")}
                    data-testid="menu-settings"
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    {t.nav.settings}
                  </DropdownMenuItem>
                  
                  {/* Admin Panel - tylko dla administratora */}
                  {isAdmin && (
                    <DropdownMenuItem
                      onClick={() => setLocation("/admin")}
                      data-testid="menu-admin"
                      className="gap-2 bg-primary/5 hover:bg-primary/10"
                    >
                      <div className="relative">
                        <Shield className="h-5 w-5 text-primary fill-primary/20 stroke-2" />
                      </div>
                      <span className="font-semibold text-primary">Admin Panel</span>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    data-testid="menu-logout"
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ConnectKitButton.Custom>
                {({ show }) => (
                  <Button className="glow-primary" data-testid="link-connect" type="button" onClick={show}>
                    Connect wallet
                  </Button>
                )}
              </ConnectKitButton.Custom>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
