'use client';

import Link from 'next/link';
import { GraduationCap, CircleUser, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/lib/actions/auth.actions';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { IUser } from '@/lib/models/user.model';

export function AppHeader({ user }: { user: Omit<IUser, 'password'> }) {
    const pathname = usePathname();

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/study-zone"
          className="flex items-center gap-2 text-lg font-bold sm:text-base"
        >
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="sr-only">StudyForge</span>
        </Link>
        <Link
          href="/study-zone"
           className={cn(
            "text-lg font-bold transition-colors hover:text-foreground",
            pathname.startsWith("/study-zone") ? "text-foreground" : "text-muted-foreground"
            )}
        >
          StudyForge
        </Link>
      </nav>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
         <div className="md:hidden">
             <Link
                href="/study-zone"
                className="flex items-center gap-2 text-lg font-semibold md:text-base"
              >
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="">StudyForge</span>
              </Link>
         </div>
        <div className="ml-auto flex-1 sm:flex-initial">
          {/* Mobile Nav might go here */}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="text-sm font-medium">{user.name}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>{user.email}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logout}>
              <button type="submit" className="w-full">
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
