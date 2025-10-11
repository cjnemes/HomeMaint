'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';
import { updateAsset } from '@/app/actions/assets';
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
import { updateAssetSchema } from '@/lib/validation/schemas';
import type { Asset, Category, Location } from '@/lib/db/types';

interface EditAssetDialogProps {
  asset: Asset;
  categories?: Category[];
  locations?: Location[];
}

export function EditAssetDialog({ asset, categories = [], locations = [] }: EditAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(updateAssetSchema),
    defaultValues: {
      name: asset.name,
      manufacturer: asset.manufacturer || '',
      model_number: asset.model_number || '',
      serial_number: asset.serial_number || '',
      status: asset.status as 'active' | 'retired' | 'replaced' | 'broken',
      category_id: asset.category_id || undefined,
      location_id: asset.location_id || undefined,
      purchase_date: asset.purchase_date || '',
      purchase_price: asset.purchase_price || undefined,
      warranty_duration_months: asset.warranty_duration_months || undefined,
      expected_lifespan_years: asset.expected_lifespan_years || undefined,
      notes: asset.notes || '',
    },
  });

  // Reset form when asset changes
  useEffect(() => {
    form.reset({
      name: asset.name,
      manufacturer: asset.manufacturer || '',
      model_number: asset.model_number || '',
      serial_number: asset.serial_number || '',
      status: asset.status as 'active' | 'retired' | 'replaced' | 'broken',
      category_id: asset.category_id || undefined,
      location_id: asset.location_id || undefined,
      purchase_date: asset.purchase_date || '',
      purchase_price: asset.purchase_price || undefined,
      warranty_duration_months: asset.warranty_duration_months || undefined,
      expected_lifespan_years: asset.expected_lifespan_years || undefined,
      notes: asset.notes || '',
    });
  }, [asset, form]);

  function onSubmit(values: any) {
    startTransition(async () => {
      try {
        await updateAsset(asset.id, values);
        toast.success('Asset updated successfully');
        setOpen(false);
        router.refresh();
      } catch (error) {
        console.error('Failed to update asset:', error);
        toast.error('Failed to update asset. Please try again.');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
          <DialogDescription>Update the details for {asset.name}.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Central Air Conditioner" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id.toString()}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Carrier" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., XYZ-123" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serial_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., SN123456" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="broken">Broken</SelectItem>
                        <SelectItem value="replaced">Replaced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Purchase Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Purchase & Warranty</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purchase_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchase_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="warranty_duration_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty Duration (months)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="12"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>How long is the warranty?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expected_lifespan_years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Lifespan (years)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="15"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>How long should this last?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes about this asset..."
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
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
