import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AssetsPage() {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Assets</h1>
        </div>
        <Button>Add Asset</Button>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">No assets yet</h2>
        <p className="text-muted-foreground mb-4">Get started by adding your first home asset</p>
        <Button>Add Your First Asset</Button>
      </div>
    </div>
  );
}
