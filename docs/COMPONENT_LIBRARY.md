# Component Library & Design System

## HomeMaint - Home Maintenance & Asset Tracking System

**Version:** 1.0
**Last Updated:** October 5, 2025
**Status:** Draft

---

## 1. Overview

This document defines the component library and design system for HomeMaint. It serves as a reference for developers building the UI and ensures consistency across the application.

**Design System Goals:**

- **Consistency**: Reusable components with predictable behavior
- **Accessibility**: WCAG 2.1 AA compliant out of the box
- **Developer Experience**: Easy to use, well-documented, type-safe
- **Performance**: Optimized for speed and bundle size
- **Flexibility**: Composable and customizable when needed

---

## 2. Component Architecture

### 2.1 Component Foundation

We'll use **shadcn/ui** as our foundation:

- Unstyled, accessible components from Radix UI
- Styled with Tailwind CSS
- Copy/paste into our codebase (not npm installed)
- Fully customizable and ownable

**Why shadcn/ui?**

- No runtime overhead (no component library dependency)
- Full control over components
- Excellent TypeScript support
- Built-in accessibility
- Beautiful defaults

### 2.2 Component Categories

```
src/components/
├── ui/                    # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── toast.tsx
│   └── ...
├── forms/                 # Form-specific components
│   ├── form-field.tsx
│   ├── form-error.tsx
│   └── ...
├── assets/                # Asset-specific components
│   ├── asset-card.tsx
│   ├── asset-form.tsx
│   ├── asset-list.tsx
│   └── ...
├── maintenance/           # Maintenance-specific components
│   ├── maintenance-card.tsx
│   ├── maintenance-form.tsx
│   ├── maintenance-timeline.tsx
│   └── ...
├── tasks/                 # Task-specific components
│   ├── task-card.tsx
│   ├── task-list.tsx
│   └── ...
└── layout/                # Layout components
    ├── header.tsx
    ├── sidebar.tsx
    ├── bottom-nav.tsx
    └── ...
```

---

## 3. Design Tokens

### 3.1 Color System

```typescript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Primary brand color
          600: '#2563eb', // Primary dark (default)
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Semantic colors
        success: {
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          500: '#f97316',
          600: '#ea580c',
        },
        error: {
          500: '#ef4444',
          600: '#dc2626',
        },
        // Category colors
        category: {
          hvac: '#3b82f6', // Blue
          plumbing: '#06b6d4', // Cyan
          electrical: '#f59e0b', // Amber
          appliances: '#8b5cf6', // Purple
          exterior: '#10b981', // Green
          roofing: '#ef4444', // Red
          other: '#6b7280', // Gray
        },
      },
    },
  },
};
```

### 3.2 Typography

```typescript
// Font sizes (Tailwind default with custom additions)
{
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px
  base: '1rem',      // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
}

// Font weights
{
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}
```

### 3.3 Spacing Scale

```typescript
// Using Tailwind's 4px base unit
{
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
}
```

### 3.4 Border Radius

```typescript
{
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem',   // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
}
```

### 3.5 Shadows

```typescript
{
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
}
```

---

## 4. Base UI Components

### 4.1 Button

**Variants:** primary, secondary, outline, ghost, destructive
**Sizes:** sm, md (default), lg

```typescript
// src/components/ui/button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
        destructive: 'bg-error-600 text-white hover:bg-error-700',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Spinner className="mr-2 h-4 w-4" />}
        {children}
      </button>
    );
  }
);
```

**Usage:**

```tsx
<Button>Save Asset</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="outline" size="sm">Edit</Button>
<Button variant="destructive" isLoading>Deleting...</Button>
```

### 4.2 Card

**Purpose:** Container for related content

```typescript
// src/components/ui/card.tsx
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white shadow-sm',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}
```

**Usage:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Central AC Unit</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Manufacturer: Carrier</p>
    <p>Model: 24ACC636A003</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline">View Details</Button>
  </CardFooter>
</Card>
```

### 4.3 Input

**Types:** text, email, number, date, file

```typescript
// src/components/ui/input.tsx
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error-500 focus:ring-error-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error-600">{error}</p>
        )}
      </div>
    );
  }
);
```

**Usage:**

```tsx
<Input type="text" placeholder="Asset name" error={errors.name?.message} />
```

### 4.4 Select (Dropdown)

```typescript
// src/components/ui/select.tsx
// Using Radix UI Select primitive
import * as SelectPrimitive from '@radix-ui/react-select';

export const Select = SelectPrimitive.Root;
export const SelectTrigger = forwardRef<...>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-gray-300',
      'bg-white px-3 py-2 text-sm',
      'focus:outline-none focus:ring-2 focus:ring-primary-500',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
    <ChevronDownIcon className="h-4 w-4 opacity-50" />
  </SelectPrimitive.Trigger>
));

// ... SelectContent, SelectItem components
```

**Usage:**

```tsx
<Select value={category} onValueChange={setCategory}>
  <SelectTrigger>
    <SelectValue placeholder="Select category" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="hvac">HVAC</SelectItem>
    <SelectItem value="plumbing">Plumbing</SelectItem>
    <SelectItem value="electrical">Electrical</SelectItem>
  </SelectContent>
</Select>
```

### 4.5 Dialog (Modal)

```typescript
// src/components/ui/dialog.tsx
// Using Radix UI Dialog primitive
import * as DialogPrimitive from '@radix-ui/react-dialog';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogContent = forwardRef<...>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
        'rounded-lg bg-white p-6 shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));

export const DialogHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4', className)} {...props} />
);

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
```

**Usage:**

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Asset</DialogTitle>
      <DialogDescription>Are you sure you want to delete this asset?</DialogDescription>
    </DialogHeader>
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

### 4.6 Toast (Notifications)

```typescript
// src/components/ui/toast.tsx
// Using sonner library for toast notifications
import { Toaster, toast } from 'sonner';

// In App.tsx
<Toaster position="bottom-right" />

// Usage in components
toast.success('Asset saved successfully!');
toast.error('Failed to delete asset');
toast.loading('Uploading photo...');
```

### 4.7 Badge

```typescript
// src/components/ui/badge.tsx
const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-success-100 text-success-800',
        warning: 'bg-warning-100 text-warning-800',
        error: 'bg-error-100 text-error-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
```

**Usage:**

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Warranty Expiring</Badge>
<Badge variant="error">Overdue</Badge>
```

---

## 5. Form Components

### 5.1 Form Field (with React Hook Form)

```typescript
// src/components/forms/form-field.tsx
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

export function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  required,
}: FormFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-error-600 ml-1">*</span>}
      </label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        error={error}
        {...register(name)}
      />
    </div>
  );
}
```

**Usage:**

```tsx
<FormProvider {...methods}>
  <form onSubmit={methods.handleSubmit(onSubmit)}>
    <FormField name="name" label="Asset Name" placeholder="Enter asset name" required />
    <FormField name="modelNumber" label="Model Number" placeholder="e.g., 24ACC636A003" />
  </form>
</FormProvider>
```

### 5.2 File Upload

```typescript
// src/components/forms/file-upload.tsx
export function FileUpload({ accept, multiple, onUpload }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    onUpload(files);
  };

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg p-6 text-center',
        dragActive ? 'border-primary-600 bg-primary-50' : 'border-gray-300'
      )}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        Drag and drop files here, or click to browse
      </p>
      <input
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(e) => onUpload(Array.from(e.target.files || []))}
      />
      <Button variant="outline" size="sm" className="mt-4">
        Browse Files
      </Button>
    </div>
  );
}
```

---

## 6. Domain-Specific Components

### 6.1 Asset Card

```typescript
// src/components/assets/asset-card.tsx
interface AssetCardProps {
  asset: Asset;
  onEdit: (id: number) => void;
  onView: (id: number) => void;
}

export function AssetCard({ asset, onEdit, onView }: AssetCardProps) {
  const isWarrantyExpiringSoon = /* logic */;
  const hasMaintenanceDue = /* logic */;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader onClick={() => onView(asset.id)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{asset.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge style={{ backgroundColor: getCategoryColor(asset.category) }}>
                {asset.category}
              </Badge>
              <span className="text-sm text-gray-500">{asset.location}</span>
            </div>
          </div>
          {asset.photos?.[0] && (
            <img
              src={asset.photos[0].url}
              alt={asset.name}
              className="h-16 w-16 rounded-md object-cover"
            />
          )}
        </div>
      </CardHeader>

      <CardContent onClick={() => onView(asset.id)}>
        <div className="space-y-1 text-sm">
          {asset.manufacturer && (
            <p className="text-gray-600">
              {asset.manufacturer} • {asset.modelNumber}
            </p>
          )}
          {asset.installationDate && (
            <p className="text-gray-500">
              Installed: {formatDate(asset.installationDate)}
            </p>
          )}
        </div>

        {(isWarrantyExpiringSoon || hasMaintenanceDue) && (
          <div className="mt-3 flex gap-2">
            {isWarrantyExpiringSoon && (
              <Badge variant="warning">Warranty Expiring</Badge>
            )}
            {hasMaintenanceDue && (
              <Badge variant="error">Maintenance Due</Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(asset.id);
          }}
        >
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### 6.2 Maintenance Timeline

```typescript
// src/components/maintenance/maintenance-timeline.tsx
export function MaintenanceTimeline({ records }: { records: MaintenanceRecord[] }) {
  const groupedByMonth = groupRecordsByMonth(records);

  return (
    <div className="space-y-8">
      {Object.entries(groupedByMonth).map(([month, monthRecords]) => (
        <div key={month}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{month}</h3>
          <div className="space-y-4">
            {monthRecords.map((record) => (
              <MaintenanceCard key={record.id} record={record} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MaintenanceCard({ record }: { record: MaintenanceRecord }) {
  const typeColors = {
    routine: 'bg-blue-100 text-blue-800',
    repair: 'bg-orange-100 text-orange-800',
    emergency: 'bg-red-100 text-red-800',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge className={typeColors[record.type]}>{record.type}</Badge>
              <span className="text-sm text-gray-500">
                {formatDate(record.datePerformed)}
              </span>
            </div>
            <CardTitle className="mt-2">{record.title}</CardTitle>
          </div>
          {record.cost && (
            <span className="text-lg font-semibold text-gray-900">
              ${record.cost.toFixed(2)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{record.description}</p>
        {record.performedBy && (
          <p className="mt-2 text-sm text-gray-500">
            Performed by: {record.performedBy}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

### 6.3 Task List

```typescript
// src/components/tasks/task-list.tsx
export function TaskList({ tasks }: { tasks: MaintenanceTask[] }) {
  const { upcoming, overdue } = groupTasksByStatus(tasks);

  return (
    <div className="space-y-6">
      {overdue.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-error-600 mb-3">
            Overdue ({overdue.length})
          </h3>
          <div className="space-y-2">
            {overdue.map((task) => (
              <TaskCard key={task.id} task={task} isOverdue />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Upcoming ({upcoming.length})
        </h3>
        <div className="space-y-2">
          {upcoming.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, isOverdue }: TaskCardProps) {
  const priorityColors = {
    low: 'text-gray-600',
    medium: 'text-blue-600',
    high: 'text-orange-600',
    critical: 'text-red-600',
  };

  return (
    <Card className={isOverdue ? 'border-error-500 bg-error-50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isOverdue && (
                <AlertIcon className="h-5 w-5 text-error-600" />
              )}
              <span className={cn('font-medium', isOverdue && 'text-error-900')}>
                {task.title}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm">
              <span className="text-gray-500">
                {formatDate(task.dueDate)}
              </span>
              <span className={priorityColors[task.priority]}>
                {task.priority} priority
              </span>
              {task.estimatedCost && (
                <span className="text-gray-600">
                  Est. ${task.estimatedCost}
                </span>
              )}
            </div>
          </div>
          <Button size="sm" onClick={() => handleComplete(task.id)}>
            Complete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 7. Layout Components

### 7.1 Header

```typescript
// src/components/layout/header.tsx
export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Logo />
          <h1 className="text-xl font-bold text-gray-900">HomeMaint</h1>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <BellIcon className="h-5 w-5" />
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
```

### 7.2 Sidebar (Desktop)

```typescript
// src/components/layout/sidebar.tsx
export function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: HomeIcon },
    { path: '/assets', label: 'Assets', icon: BoxIcon },
    { path: '/maintenance', label: 'Maintenance', icon: WrenchIcon },
    { path: '/calendar', label: 'Calendar', icon: CalendarIcon },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="hidden lg:flex w-60 flex-col border-r border-gray-200 bg-white">
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

### 7.3 Bottom Navigation (Mobile)

```typescript
// src/components/layout/bottom-nav.tsx
export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/assets', label: 'Assets', icon: BoxIcon },
    { path: '/add', label: 'Add', icon: PlusCircleIcon, isPrimary: true },
    { path: '/maintenance', label: 'History', icon: WrenchIcon },
    { path: '/more', label: 'More', icon: MenuIcon },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center p-2"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg">
                  <Icon className="h-6 w-6" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-1 flex-col items-center justify-center py-2 text-xs',
                isActive ? 'text-primary-600' : 'text-gray-600'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

---

## 8. Icons

We'll use **Lucide React** for icons:

```typescript
import {
  HomeIcon,
  BoxIcon,
  WrenchIcon,
  CalendarIcon,
  SettingsIcon,
  PlusCircleIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  TrashIcon,
  UploadIcon,
  DownloadIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MoreVerticalIcon,
  // ... etc
} from 'lucide-react';
```

**Icon sizes:**

- Small: `h-4 w-4` (16px)
- Medium: `h-5 w-5` (20px) - default
- Large: `h-6 w-6` (24px)
- XLarge: `h-8 w-8` (32px)

---

## 9. Animation & Transitions

### 9.1 Standard Transitions

```typescript
// Transition classes
const transitions = {
  default: 'transition-all duration-200 ease-in-out',
  fast: 'transition-all duration-150 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
};
```

### 9.2 Common Animations

```css
/* In global CSS */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
```

---

## 10. Responsive Design Patterns

### 10.1 Breakpoint Usage

```typescript
// Tailwind breakpoints
sm: '640px',    // Tablet portrait
md: '768px',    // Tablet landscape
lg: '1024px',   // Desktop
xl: '1280px',   // Large desktop
2xl: '1536px',  // Extra large desktop
```

### 10.2 Mobile-First Approach

```tsx
// ✅ Good - Mobile first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ❌ Bad - Desktop first
<div className="grid grid-cols-3 lg:grid-cols-2 md:grid-cols-1">
```

---

## 11. Accessibility Guidelines

### 11.1 Focus Indicators

All interactive elements must have visible focus indicators:

```css
.focus-visible:outline-none
.focus-visible:ring-2
.focus-visible:ring-primary-500
.focus-visible:ring-offset-2
```

### 11.2 ARIA Labels

```tsx
<button aria-label="Delete asset">
  <TrashIcon />
</button>

<input
  type="search"
  aria-label="Search assets"
  placeholder="Search..."
/>
```

### 11.3 Keyboard Navigation

Ensure all components are keyboard accessible:

- Tab to navigate
- Enter/Space to activate
- Escape to close modals
- Arrow keys for dropdowns/menus

---

## 12. Component Documentation Template

Each component should include:

```typescript
/**
 * AssetCard - Displays asset summary information
 *
 * @param asset - Asset object to display
 * @param onEdit - Callback when edit button is clicked
 * @param onView - Callback when card is clicked
 *
 * @example
 * <AssetCard
 *   asset={asset}
 *   onEdit={(id) => navigate(`/assets/${id}/edit`)}
 *   onView={(id) => navigate(`/assets/${id}`)}
 * />
 */
export function AssetCard({ asset, onEdit, onView }: AssetCardProps) {
  // implementation
}
```

---

## 13. Component Checklist

Before creating a new component, verify:

- [ ] Is there an existing component that can be used/extended?
- [ ] Is this component reusable or domain-specific?
- [ ] Does it have clear, typed props?
- [ ] Does it handle loading/error states?
- [ ] Is it accessible (keyboard nav, ARIA labels)?
- [ ] Is it responsive?
- [ ] Is it documented?
- [ ] Does it have tests?

---

**This component library provides a solid foundation for building a consistent, accessible, and maintainable UI for HomeMaint!**
