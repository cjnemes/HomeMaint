import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { assetRepository } from '@/lib/db/repositories';
import { getAllTasks, getOverdueTasks, getUpcomingTasks } from '@/app/actions/tasks';
import Link from 'next/link';
import { AddTaskDialogWithAsset } from '@/components/tasks/add-task-dialog-with-asset';
import { CompleteTaskButton } from '@/components/tasks/complete-task-button';
import { EditTaskDialog } from '@/components/tasks/edit-task-dialog';

export default async function TasksPage() {
  // Fetch all tasks and assets
  const tasks = await getAllTasks();
  const assets = assetRepository.findAll();
  const overdueTasks = await getOverdueTasks();
  const upcomingTasks = await getUpcomingTasks(30); // Next 30 days

  // Join tasks with asset data
  const tasksWithAssets = tasks.map((task) => ({
    ...task,
    asset: assets.find((a) => a.id === task.asset_id),
  }));

  // Group tasks by asset
  const tasksByAsset = assets
    .map((asset) => ({
      asset,
      tasks: tasksWithAssets.filter((t) => t.asset_id === asset.id),
    }))
    .filter(({ tasks }) => tasks.length > 0);

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const overdueCount = overdueTasks.length;
  const upcomingCount = upcomingTasks.length;

  // Priority colors
  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  // Status colors
  const statusColors = {
    pending: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl gradient-subtle p-6 border border-border/50 mb-8 animate-fade-in">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-bg-primary">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                Maintenance Tasks
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track and manage your maintenance schedule
              </p>
            </div>
            <Badge
              variant="secondary"
              className="ml-2 bg-primary/10 text-primary border-primary/20"
            >
              {totalTasks}
            </Badge>
          </div>
          <AddTaskDialogWithAsset assets={assets} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
        <Card className="card-hover border-l-4 border-l-primary overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            <div className="rounded-full p-2 bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <CheckSquare className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        <Card className="card-hover border-l-4 border-l-destructive overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            <div className="rounded-full p-2 bg-destructive/10 text-destructive transition-transform group-hover:scale-110">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${overdueCount > 0 ? 'text-destructive' : ''}`}>
              {overdueCount}
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover border-l-4 border-l-info overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming (30d)
            </CardTitle>
            <div className="rounded-full p-2 bg-info/10 text-info transition-transform group-hover:scale-110">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingCount}</div>
          </CardContent>
        </Card>
        <Card className="card-hover border-l-4 border-l-success overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <div className="rounded-full p-2 bg-success/10 text-success transition-transform group-hover:scale-110">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      {totalTasks === 0 ? (
        <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <CheckSquare className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No tasks scheduled</h2>
            <p className="text-base text-muted-foreground mb-8 text-center max-w-md">
              Create your first maintenance task to get started with tracking
            </p>
            <AddTaskDialogWithAsset
              assets={assets}
              trigger={
                <Button size="lg" className="btn-gradient shadow-lg">
                  Add Your First Task
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {tasksByAsset.map(({ asset, tasks }) => (
            <Card key={asset.id} className="card-elevated">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="icon-bg-primary">
                      <CheckSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>
                        <Link
                          href={`/assets/${asset.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {asset.name}
                        </Link>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{asset.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {tasks.map((task) => {
                    const isOverdue =
                      task.due_date &&
                      new Date(task.due_date) < new Date() &&
                      task.status !== 'completed';
                    const dueDate = task.due_date ? new Date(task.due_date) : null;

                    const priorityBorderColor =
                      {
                        low: 'border-info',
                        medium: 'border-warning',
                        high: 'border-destructive',
                        critical: 'border-destructive',
                      }[task.priority] || 'border-primary';

                    return (
                      <div
                        key={task.id}
                        className={`flex items-start justify-between border-l-4 ${priorityBorderColor} pl-4 py-3 rounded-r-lg bg-background-subtle/50 hover:bg-background-subtle transition-colors`}
                      >
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <h4 className="font-semibold text-lg">{task.title}</h4>
                            {isOverdue && (
                              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 mt-3 text-sm">
                            {dueDate && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span
                                  className={
                                    isOverdue
                                      ? 'text-destructive font-medium'
                                      : 'text-muted-foreground'
                                  }
                                >
                                  {dueDate.toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {task.estimated_cost && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <span className="text-primary">💰</span>$
                                {task.estimated_cost.toFixed(2)}
                              </div>
                            )}
                            {task.estimated_duration && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="h-4 w-4 text-primary" />
                                {task.estimated_duration}h
                              </div>
                            )}
                            {task.is_recurring === 1 && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-info/10 text-info border-info/20"
                              >
                                🔄 Recurring
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end ml-4">
                          <div className="flex gap-2">
                            <Badge
                              className={
                                priorityColors[task.priority as keyof typeof priorityColors]
                              }
                            >
                              {task.priority}
                            </Badge>
                            <Badge
                              className={statusColors[task.status as keyof typeof statusColors]}
                            >
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <EditTaskDialog task={task} />
                            {(task.status === 'pending' || task.status === 'in_progress') && (
                              <CompleteTaskButton taskId={task.id} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
