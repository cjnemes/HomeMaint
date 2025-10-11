'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { completeTask } from '@/app/actions/tasks';
import { Button } from '@/components/ui/button';

interface CompleteTaskButtonProps {
  taskId: number;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  className?: string;
}

export function CompleteTaskButton({
  taskId,
  variant = 'outline',
  size = 'sm',
  showIcon = true,
  className,
}: CompleteTaskButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleComplete = () => {
    startTransition(async () => {
      try {
        await completeTask(taskId);
        toast.success('Task completed successfully');
        router.refresh();
      } catch (error) {
        console.error('Failed to complete task:', error);
        toast.error('Failed to complete task. Please try again.');
      }
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleComplete}
      disabled={isPending}
      className={className}
    >
      {showIcon && <CheckCircle2 className="h-4 w-4 mr-2" />}
      {isPending ? 'Completing...' : 'Complete'}
    </Button>
  );
}
