'use client';

import { useState } from 'react';
import { Download, Upload, AlertTriangle, RotateCcw, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  createManualBackup,
  getBackups,
  restoreFromBackup,
  deleteBackup,
  resetAllData,
  formatBytes,
  type BackupInfo,
} from '@/app/actions/backup';

export function DataManagement() {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackups, setShowBackups] = useState(false);

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      const backup = await createManualBackup();
      toast.success('Backup created successfully', {
        description: `${backup.filename} (${formatBytes(backup.size)})`,
      });
      if (showBackups) {
        await loadBackups();
      }
    } catch (error) {
      toast.error('Failed to create backup', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBackups = async () => {
    setIsLoading(true);
    try {
      const backupList = await getBackups();
      setBackups(backupList);
      setShowBackups(true);
    } catch (error) {
      toast.error('Failed to load backups', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (filename: string) => {
    setIsLoading(true);
    try {
      await restoreFromBackup(filename);
      toast.success('Backup restored successfully', {
        description: 'The page will reload in a moment...',
      });
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      toast.error('Failed to restore backup', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      setIsLoading(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    setIsLoading(true);
    try {
      await deleteBackup(filename);
      toast.success('Backup deleted');
      await loadBackups();
    } catch (error) {
      toast.error('Failed to delete backup', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAllData = async () => {
    setIsLoading(true);
    try {
      await resetAllData();
      toast.success('All data reset successfully', {
        description: 'A backup was created. The page will reload...',
      });
      // Reload after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      toast.error('Failed to reset data', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Backup & Restore Section */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium flex items-center gap-2">
              <Save className="h-4 w-4" />
              Backup & Restore
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create backups of your data and restore from previous backups
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCreateBackup} disabled={isLoading} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
          <Button onClick={loadBackups} variant="outline" disabled={isLoading} size="sm">
            <Upload className="h-4 w-4 mr-2" />
            {showBackups ? 'Refresh' : 'View Backups'}
          </Button>
        </div>

        {showBackups && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Available Backups ({backups.length})</p>
            {backups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No backups found</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {backups.map((backup) => (
                  <div
                    key={backup.filename}
                    className="flex items-center justify-between p-3 rounded-md border bg-card text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{backup.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(backup.createdAt).toLocaleString()} • {formatBytes(backup.size)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" disabled={isLoading}>
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restore
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Restore from backup?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will replace all current data with the backup from{' '}
                              {new Date(backup.createdAt).toLocaleString()}. A backup of your
                              current data will be created first.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRestore(backup.filename)}>
                              Restore
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" disabled={isLoading}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete backup?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the backup file. This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBackup(backup.filename)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reset Data Section */}
      <div className="rounded-lg border border-destructive/50 p-4 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Permanently delete all data and start fresh. This action cannot be undone.
            </p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isLoading} size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Reset All Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  This will permanently delete <strong>all your data</strong> including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>All assets and equipment</li>
                  <li>All maintenance records</li>
                  <li>All tasks</li>
                  <li>All service providers</li>
                  <li>All uploaded files</li>
                  <li>All settings</li>
                </ul>
                <p className="font-medium">
                  A backup will be created automatically before resetting, but you will need to
                  restore it manually if you change your mind.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetAllData}
                className="bg-destructive hover:bg-destructive/90"
              >
                Yes, Reset All Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
