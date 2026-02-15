import { Button } from '@heroui/react';
import { Search } from 'lucide-react';

export default function HeroSearchOverlayMobile() {
  return (
    <Button
      size="lg"
      className="bg-tiff-300 hover:bg-tiff-400 pointer-events-auto cursor-pointer text-white">
      <Search className="size-6 text-white" />
      Search
    </Button>
  );
}
