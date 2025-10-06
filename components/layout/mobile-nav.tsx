'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { NavLinks } from './nav-links';
import { Separator } from '@/components/ui/separator';

export function MobileNav() {
  return (
    <div className="flex flex-col space-y-6 pt-6">
      {/* Brand */}
      <Link href="/" className="flex items-center space-x-2">
        <Home className="h-6 w-6" />
        <span className="font-bold text-xl">HomeMaint</span>
      </Link>

      <Separator />

      {/* Navigation Links */}
      <nav>
        <NavLinks vertical={true} />
      </nav>
    </div>
  );
}
