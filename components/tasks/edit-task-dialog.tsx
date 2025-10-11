'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';
import { updateTask } from '@/app/actions/tasks';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { updateMaintenanceTaskSchema } from '@/lib/validation/schemas';
import type { MaintenanceTask } from '@/lib/db/types';

interface EditTaskDialogProps {
  task: MaintenanceTask;
}

export function EditTaskDialog({ task }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(updateMaintenanceTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority as 'low' | 'medium' | 'high' | 'critical',
      estimated_cost: task.estimated_cost || undefined,
      estimated_duration: task.estimated_duration || undefined,
      status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue',
      is_recurring: task.is_recurring,
      recurrence_rule: task.recurrence_rule || '',
      notes: task.notes || '',
    },
  });

  // Reset form when task changes
  useEffect(() => {
    form.reset({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority as 'low' | 'medium' | 'high' | 'critical',
      estimated_cost: task.estimated_cost || undefined,
      estimated_duration: task.estimated_duration || undefined,
      status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue',
      is_recurring: task.is_recurring,
      recurrence_rule: task.recurrence_rule || '',
      notes: task.notes || '',
    });
  }, [task, form]);

  function onSubmit(values: any) {
    startTransition(async () => {
      try {
        await updateTask(task.id, values);
        toast.success('Task updated successfully');
        setOpen(false);
        router.refresh();
      } catch (error) {
        console.error('Failed to update task:', error);
        toast.error('Failed to update task. Please try again.');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Update the maintenance task details</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Replace air filter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the task..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Estimates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Estimates</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimated_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Cost</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimated_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Duration (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Recurrence */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recurrence</h3>

              <FormField
                control={form.control}
                name="is_recurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value === 1}
                        onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Recurring Task</FormLabel>
                      <FormDescription>This task repeats on a schedule</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recurrence_rule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurrence Rule</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Every 3 months"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>Describe how often this task repeats</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Details</h3>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Updating...' : 'Update Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
