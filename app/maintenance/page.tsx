import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MaintenancePage() {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Maintenance Records</h1>
        </div>
        <Button>Add Record</Button>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center">
        <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">No maintenance records yet</h2>
        <p className="text-muted-foreground mb-4">Start tracking your home maintenance history</p>
        <Button>Add Your First Record</Button>
      </div>
    </div>
  );
}
