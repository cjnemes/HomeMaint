import { Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DataExport } from '@/components/settings/data-export';

export default function SettingsPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">General</h2>
          <p className="text-sm text-muted-foreground">
            Manage your home information and preferences
          </p>
        </div>
        <Separator />

        <div>
          <h2 className="text-lg font-semibold mb-2">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Configure maintenance reminders and alerts
          </p>
        </div>
        <Separator />

        <div>
          <h2 className="text-lg font-semibold mb-4">Data & Privacy</h2>
          <DataExport />
        </div>
      </div>
    </div>
  );
}
