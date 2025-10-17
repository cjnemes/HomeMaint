import { Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DataExport } from '@/components/settings/data-export';
import { GeneralSettings } from '@/components/settings/general-settings';
import { NotificationsSettings } from '@/components/settings/notifications-settings';
import { getFirstHome } from '@/app/actions/assets';

export default async function SettingsPage() {
  const home = await getFirstHome();

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">General</h2>
          <GeneralSettings home={home} />
        </div>
        <Separator />

        <div>
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <NotificationsSettings />
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
