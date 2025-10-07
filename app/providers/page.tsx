import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProvidersPage() {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Service Providers</h1>
        </div>
        <Button>Add Provider</Button>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center">
        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">No service providers yet</h2>
        <p className="text-muted-foreground mb-4">
          Add your trusted contractors and service companies
        </p>
        <Button>Add Your First Provider</Button>
      </div>
    </div>
  );
}
