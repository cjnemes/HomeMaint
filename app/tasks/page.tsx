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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Maintenance Tasks</h1>
          <Badge variant="secondary">{totalTasks}</Badge>
        </div>
        <AddTaskDialogWithAsset assets={assets} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdueCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming (30d)</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{upcomingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{completedTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      {totalTasks === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No tasks scheduled</h2>
          <p className="text-muted-foreground mb-4">
            Create your first maintenance task to get started
          </p>
          <AddTaskDialogWithAsset assets={assets} trigger={<Button>Add Your First Task</Button>} />
        </div>
      ) : (
        <div className="space-y-6">
          {tasksByAsset.map(({ asset, tasks }) => (
            <Card key={asset.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      <Link href={`/assets/${asset.id}`} className="hover:underline">
                        {asset.name}
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge variant="outline">{asset.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map((task) => {
                    const isOverdue =
                      task.due_date &&
                      new Date(task.due_date) < new Date() &&
                      task.status !== 'completed';
                    const dueDate = task.due_date ? new Date(task.due_date) : null;

                    return (
                      <div
                        key={task.id}
                        className="flex items-start justify-between border-l-4 border-primary pl-4 py-2"
                      >
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <h4 className="font-semibold">{task.title}</h4>
                            {isOverdue && (
                              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                            {dueDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                                  {dueDate.toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {task.estimated_cost && (
                              <div className="flex items-center gap-1">
                                Est. ${task.estimated_cost.toFixed(2)}
                              </div>
                            )}
                            {task.estimated_duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.estimated_duration}h
                              </div>
                            )}
                            {task.is_recurring === 1 && (
                              <Badge variant="outline" className="text-xs">
                                Recurring
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
