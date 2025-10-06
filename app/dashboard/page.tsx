import { LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <LayoutDashboard className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PlaceholderCard title="Total Assets" value="Coming Soon" />
        <PlaceholderCard title="Upcoming Tasks" value="Coming Soon" />
        <PlaceholderCard title="Recent Maintenance" value="Coming Soon" />
      </div>
    </div>
  );
}

function PlaceholderCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
