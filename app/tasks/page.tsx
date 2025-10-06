import { CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TasksPage() {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Maintenance Tasks</h1>
        </div>
        <Button>Add Task</Button>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center">
        <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">No tasks scheduled</h2>
        <p className="text-muted-foreground mb-4">
          Create your first maintenance task to get started
        </p>
        <Button>Add Your First Task</Button>
      </div>
    </div>
  );
}
