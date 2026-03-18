"use client";

import { signOut, useSession } from "next-auth/react";
import { Bell, LogOut, User } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  lowStockCount?: number;
}

export function Topbar({ lowStockCount = 0 }: TopbarProps) {
  const { data: session } = useSession();

  return (
    <header className="flex items-center h-14 px-4 border-b bg-background gap-4">
      {/* Spacer */}
      <div className="flex-1" />

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <Button variant="ghost" size="sm" className="gap-2">
          <Bell className="h-4 w-4" />
          <Badge variant="destructive" className="text-xs">
            {lowStockCount}
          </Badge>
        </Button>
      )}

      {/* Theme toggle */}
      <ThemeToggle />

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            {session?.user?.email ?? "Account"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
