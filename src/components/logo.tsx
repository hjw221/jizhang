import type { SVGProps } from 'react';
import { Coins } from 'lucide-react';

// Simple inline SVG for a coin stack or similar abstract logo
const AppIcon = (props: SVGProps<SVGSVGElement>) => (
    <Coins className="h-8 w-8 text-primary" {...props} />
);

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <AppIcon />
      <h1 className="text-xl font-semibold text-foreground">
        记账
      </h1>
    </div>
  );
}
