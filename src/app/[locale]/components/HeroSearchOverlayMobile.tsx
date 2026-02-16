import { Button } from '@heroui/react';
import { Search } from 'lucide-react';

export default function HeroSearchOverlayMobile() {
  return (
    <Button
      size="lg"
      //style={{ '--bg': 'var(--color-brand-primary)' } as CSSProperties}
      className="bg-brand-primary hover:bg-brand-primary-hover pointer-events-auto cursor-pointer text-white">
      <Search className="size-6 text-white" />
      Search
    </Button>
  );
}
