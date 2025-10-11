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
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          {hasData
            ? "Welcome back! Here's an overview of your home maintenance."
            : 'Welcome to HomeMaint! Get started by adding your first asset.'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Assets"
          value={totalAssets}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          href="/assets"
        />
        <SummaryCard
          title="Upcoming (30d)"
          value={upcomingCount}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          href="/tasks"
        />
        <SummaryCard
          title="Overdue"
          value={overdueCount}
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
          href="/tasks"
          variant="danger"
        />
        <SummaryCard
          title="Completed"
          value={completedTasks}
          icon={<CheckSquare className="h-4 w-4 text-muted-foreground" />}
          href="/tasks"
        />
      </div>

      {/* Main Content */}
      {hasData ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Tasks Widget */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Upcoming Tasks</CardTitle>
              <Link href="/tasks">
                <Button variant="ghost" size="sm">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              <Link href="/maintenance">
                <Button variant="ghost" size="sm">
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Get Started with HomeMaint</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
              Begin by adding your first asset. Track appliances, systems, and equipment to stay on
              top of your home maintenance.
            </p>
            <Link href="/assets">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Asset
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex gap-4 flex-wrap">
        <Link href="/assets">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </Link>
        <Link href="/maintenance">
          <Button variant="outline">
            <Wrench className="mr-2 h-4 w-4" />
            Log Maintenance
          </Button>
        </Link>
        <Link href="/tasks">
          <Button variant="outline">
            <CheckSquare className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </Link>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  href,
  variant,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  variant?: 'danger';
}) {
  return (
    <Link href={href}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${variant === 'danger' && value > 0 ? 'text-destructive' : ''}`}
          >
            {value}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
