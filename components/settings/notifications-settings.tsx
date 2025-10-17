'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function NotificationsSettings() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Reminders</CardTitle>
          <CardDescription>Get notified when maintenance tasks are due or overdue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="task-reminders" className="flex flex-col space-y-1">
              <span>Task Reminders</span>
              <span className="font-normal text-sm text-muted-foreground">
                Receive notifications for upcoming maintenance tasks
              </span>
            </Label>
            <Switch id="task-reminders" defaultChecked disabled />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="warranty-expiration" className="flex flex-col space-y-1">
              <span>Warranty Expiration</span>
              <span className="font-normal text-sm text-muted-foreground">
                Get alerted when asset warranties are about to expire
              </span>
            </Label>
            <Switch id="warranty-expiration" defaultChecked disabled />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="recurring-tasks" className="flex flex-col space-y-1">
              <span>Recurring Tasks</span>
              <span className="font-normal text-sm text-muted-foreground">
                Notifications for recurring maintenance schedules
              </span>
            </Label>
            <Switch id="recurring-tasks" defaultChecked disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Configure email notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-weekly" className="flex flex-col space-y-1">
              <span>Weekly Summary</span>
              <span className="font-normal text-sm text-muted-foreground">
                Receive a weekly summary of maintenance activities
              </span>
            </Label>
            <Switch id="email-weekly" disabled />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="email-critical" className="flex flex-col space-y-1">
              <span>Critical Alerts Only</span>
              <span className="font-normal text-sm text-muted-foreground">
                Only send emails for critical maintenance issues
              </span>
            </Label>
            <Switch id="email-critical" disabled />
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground italic">
        Note: Notification functionality will be implemented in a future update. These settings are
        currently for display purposes only.
      </p>
    </div>
  );
}
