'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Upload as UploadIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from './file-upload';
import { FileGallery } from './file-gallery';
import type { Attachment } from '@/lib/db/types';

interface FilesSectionProps {
  entityType: 'asset' | 'maintenance_record';
  entityId: number;
  attachments: Attachment[];
  homeId?: number;
}

export function FilesSection({ entityType, entityId, attachments, homeId }: FilesSectionProps) {
  const [showUpload, setShowUpload] = useState(false);
  const router = useRouter();

  const handleUploadComplete = () => {
    setShowUpload(false);
    router.refresh(); // Revalidate server components without full page reload
  };

  const handleDelete = () => {
    router.refresh(); // Revalidate server components without full page reload
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Files & Documents
          </CardTitle>
          <Button
            variant={showUpload ? 'ghost' : 'outline'}
            size="sm"
            onClick={() => setShowUpload(!showUpload)}
          >
            <UploadIcon className="h-4 w-4 mr-2" />
            {showUpload ? 'Cancel' : 'Upload'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showUpload && (
          <FileUpload
            entityType={entityType}
            entityId={entityId}
            homeId={homeId}
            onUploadComplete={handleUploadComplete}
          />
        )}

        <FileGallery attachments={attachments} onDelete={handleDelete} />
      </CardContent>
    </Card>
  );
}
