import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  Wrench,
  CheckSquare,
  AlertTriangle,
  Calendar,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { getAllTasks, getOverdueTasks, getUpcomingTasks } from './actions/tasks';
import { getAllMaintenanceRecords } from './actions/maintenance';
import { getAssets } from './actions/assets';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import type { MaintenanceTask, Asset, MaintenanceRecord } from '@/lib/db/types';

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [assets, allTasks, overdueTasks, upcomingTasks, maintenanceRecords] = await Promise.all([
    getAssets(),
    getAllTasks(),
    getOverdueTasks(),
    getUpcomingTasks(30),
    getAllMaintenanceRecords(),
  ]);

  // Calculate stats
  const totalAssets = assets.length;
  const totalTasks = allTasks.length;
  const overdueCount = overdueTasks.length;
  const upcomingCount = upcomingTasks.length;
  const completedTasks = allTasks.filter((t: MaintenanceTask) => t.status === 'completed').length;

  // Get recent activity (last 5 maintenance records)
  const recentActivity = maintenanceRecords
    .sort(
      (a: MaintenanceRecord, b: MaintenanceRecord) =>
        new Date(b.date_performed).getTime() - new Date(a.date_performed).getTime()
    )
    .slice(0, 5);

  // Get next 5 upcoming tasks
  const nextTasks = upcomingTasks.slice(0, 5);

  const hasData = totalAssets > 0 || totalTasks > 0 || maintenanceRecords.length > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-xl gradient-subtle p-8 border border-border/50 animate-fade-in">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-foreground/70 text-lg">
            {hasData
              ? "Welcome back! Here's an overview of your home maintenance."
              : 'Welcome to HomeMaint! Get started by adding your first asset.'}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-slide-up">
        <SummaryCard
          title="Total Assets"
          value={totalAssets}
          icon={<Package className="h-5 w-5" />}
          href="/assets"
          variant="primary"
        />
        <SummaryCard
          title="Upcoming (30d)"
          value={upcomingCount}
          icon={<Calendar className="h-5 w-5" />}
          href="/tasks"
          variant="info"
        />
        <SummaryCard
          title="Overdue"
          value={overdueCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          href="/tasks"
          variant="danger"
        />
        <SummaryCard
          title="Completed"
          value={completedTasks}
          icon={<CheckSquare className="h-5 w-5" />}
          href="/tasks"
          variant="success"
        />
      </div>

      {/* Main Content */}
      {hasData ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Tasks Widget */}
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                Upcoming Tasks
              </CardTitle>
              <Link href="/tasks">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {nextTasks.length > 0 ? (
                <div className="space-y-4">
                  {nextTasks.map((task: MaintenanceTask) => {
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                    const asset = assets.find((a: Asset) => a.id === task.asset_id);

                    return (
                      <div key={task.id} className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium leading-none">{task.title}</p>
                            {isOverdue && <AlertTriangle className="h-4 w-4 text-destructive" />}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{asset?.name || 'Unknown Asset'}</span>
                            {task.due_date && (
                              <>
                                <span>•</span>
                                <span className={isOverdue ? 'text-destructive' : ''}>
                                  Due{' '}
                                  {formatDistanceToNow(new Date(task.due_date), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            task.priority === 'critical'
                              ? 'destructive'
                              : task.priority === 'high'
                                ? 'default'
                                : 'secondary'
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming tasks</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Widget */}
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Wrench className="h-5 w-5 text-success" />
                Recent Activity
              </CardTitle>
              <Link href="/maintenance">
                <Button variant="ghost" size="sm" className="hover:bg-success/10">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((record: MaintenanceRecord) => {
                    const asset = assets.find((a: Asset) => a.id === record.asset_id);

                    return (
                      <div key={record.id} className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <p className="font-medium leading-none">{record.title}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{asset?.name || 'Unknown Asset'}</span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(new Date(record.date_performed), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                        {record.cost && (
                          <span className="text-sm font-medium">
                            ${Number(record.cost).toFixed(2)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No maintenance records yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Empty State */
        <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <Package className="h-16 w-16 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Get Started with HomeMaint</h3>
            <p className="text-base text-muted-foreground mb-8 text-center max-w-lg leading-relaxed">
              Begin by adding your first asset. Track appliances, systems, and equipment to stay on
              top of your home maintenance.
            </p>
            <Link href="/assets">
              <Button size="lg" className="btn-gradient shadow-lg">
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Asset
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="bg-background-subtle rounded-xl p-6 border border-border/50">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
          Quick Actions
        </h3>
        <div className="flex gap-3 flex-wrap">
          <Link href="/assets">
            <Button variant="outline" size="lg" className="hover:border-primary hover:bg-primary/5">
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </Link>
          <Link href="/maintenance">
            <Button variant="outline" size="lg" className="hover:border-success hover:bg-success/5">
              <Wrench className="mr-2 h-4 w-4" />
              Log Maintenance
            </Button>
          </Link>
          <Link href="/tasks">
            <Button variant="outline" size="lg" className="hover:border-info hover:bg-info/5">
              <CheckSquare className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  href,
  variant = 'primary',
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  variant?: 'primary' | 'success' | 'danger' | 'info';
}) {
  const variantStyles = {
    primary: {
      border: 'border-l-primary',
      icon: 'bg-primary/10 text-primary',
      value: 'text-foreground',
    },
    success: {
      border: 'border-l-success',
      icon: 'bg-success/10 text-success',
      value: 'text-foreground',
    },
    danger: {
      border: 'border-l-destructive',
      icon: 'bg-destructive/10 text-destructive',
      value: value > 0 ? 'text-destructive' : 'text-foreground',
    },
    info: {
      border: 'border-l-info',
      icon: 'bg-info/10 text-info',
      value: 'text-foreground',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Link href={href}>
      <Card
        className={`card-hover cursor-pointer border-l-4 ${styles.border} overflow-hidden group`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div
            className={`rounded-full p-2 ${styles.icon} transition-transform group-hover:scale-110`}
          >
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${styles.value}`}>{value}</div>
        </CardContent>
      </Card>
    </Link>
  );
}
