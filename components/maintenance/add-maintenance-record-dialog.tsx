'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { createMaintenanceRecord } from '@/app/actions/maintenance';
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
import { createMaintenanceRecordSchema } from '@/lib/validation/schemas';

interface AddMaintenanceRecordDialogProps {
  assetId: number;
  trigger?: React.ReactNode;
}

export function AddMaintenanceRecordDialog({ assetId, trigger }: AddMaintenanceRecordDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(createMaintenanceRecordSchema),
    defaultValues: {
      asset_id: assetId,
      service_provider_id: undefined,
      date_performed: new Date().toISOString().split('T')[0],
      maintenance_type: 'routine' as const,
      title: '',
      description: '',
      cost: undefined,
      performed_by: '',
      parts_used: '',
      next_service_date: '',
      warranty_work: 0,
      notes: '',
    },
  });

  function onSubmit(values: any) {
    startTransition(async () => {
      try {
        await createMaintenanceRecord(values);
        toast.success('Maintenance record created successfully');
        form.reset();
        setOpen(false);
        router.refresh();
      } catch (error) {
        console.error('Failed to create maintenance record:', error);
        toast.error('Failed to create maintenance record. Please try again.');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Maintenance Record</DialogTitle>
          <DialogDescription>
            Log maintenance, repairs, or inspections for this asset
          </DialogDescription>
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
                      <Input placeholder="e.g., Annual HVAC service" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maintenance_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="routine">Routine</SelectItem>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="inspection">Inspection</SelectItem>
                          <SelectItem value="replacement">Replacement</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="upgrade">Upgrade</SelectItem>
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_performed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Performed *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What was done..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cost & Provider */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cost & Provider</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost</FormLabel>
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
                  name="performed_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Performed By</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Company or person name"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Details</h3>

              <FormField
                control={form.control}
                name="parts_used"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parts Used</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List parts or materials used..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="next_service_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Service Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription>When should this be serviced next?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                {isPending ? 'Adding...' : 'Add Record'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
