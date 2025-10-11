'use client';

import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  exportAllDataAsJSON,
  exportAssetsAsCSV,
  exportMaintenanceAsCSV,
  exportTasksAsCSV,
  getExportFilename,
} from '@/app/actions/export';

type ExportType = 'json' | 'assets' | 'maintenance' | 'tasks';

export function DataExport() {
  const [exportingType, setExportingType] = useState<ExportType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async (type: ExportType) => {
    setExportingType(type);
    setError(null);
    setSuccess(null);

    try {
      let data: string;
      let filename: string;
      let mimeType: string;

      switch (type) {
        case 'json':
          data = await exportAllDataAsJSON();
          filename = await getExportFilename('homemaint-backup', 'json');
          mimeType = 'application/json';
          break;
        case 'assets':
          data = await exportAssetsAsCSV();
          filename = await getExportFilename('assets', 'csv');
          mimeType = 'text/csv';
          break;
        case 'maintenance':
          data = await exportMaintenanceAsCSV();
          filename = await getExportFilename('maintenance', 'csv');
          mimeType = 'text/csv';
          break;
        case 'tasks':
          data = await exportTasksAsCSV();
          filename = await getExportFilename('tasks', 'csv');
          mimeType = 'text/csv';
          break;
      }

      // Create and trigger download
      const blob = new Blob([data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(`Successfully exported ${type === 'json' ? 'all data' : type}!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
    } finally {
      setExportingType(null);
    }
  };

  const isExporting = exportingType !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Export</CardTitle>
        <CardDescription>
          Export your data for backup or to use in other applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* JSON Export */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FileJson className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Export All Data (JSON)</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete backup of all assets, maintenance records, tasks, and settings
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('json')}
            disabled={isExporting}
          >
            {exportingType === 'json' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </div>

        {/* CSV Exports */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            CSV Exports
          </h3>

          {/* Assets CSV */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Assets</p>
              <p className="text-sm text-muted-foreground">Export asset list with all details</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('assets')}
              disabled={isExporting}
            >
              {exportingType === 'assets' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </>
              )}
            </Button>
          </div>

          {/* Maintenance CSV */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Maintenance Records</p>
              <p className="text-sm text-muted-foreground">Export complete maintenance history</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('maintenance')}
              disabled={isExporting}
            >
              {exportingType === 'maintenance' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </>
              )}
            </Button>
          </div>

          {/* Tasks CSV */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Tasks</p>
              <p className="text-sm text-muted-foreground">Export all maintenance tasks</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('tasks')}
              disabled={isExporting}
            >
              {exportingType === 'tasks' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/20 rounded-md">
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
