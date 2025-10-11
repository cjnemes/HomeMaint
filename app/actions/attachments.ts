'use server';

import { revalidatePath } from 'next/cache';
import { attachmentRepository } from '@/lib/db/repositories/attachment.repository';
import type { Attachment, CreateAttachment } from '@/lib/db/types';

// File upload constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
const ALLOWED_MIME_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

/**
 * Get attachments for an asset
 */
export async function getAttachmentsByAssetId(assetId: number): Promise<Attachment[]> {
  try {
    return attachmentRepository.findByAssetId(assetId);
  } catch (error) {
    console.error(`Failed to get attachments for asset ${assetId}:`, error);
    throw new Error('Failed to fetch attachments');
  }
}

/**
 * Get attachments for a maintenance record
 */
export async function getAttachmentsByMaintenanceRecordId(
  maintenanceRecordId: number
): Promise<Attachment[]> {
  try {
    return attachmentRepository.findByMaintenanceRecordId(maintenanceRecordId);
  } catch (error) {
    console.error(
      `Failed to get attachments for maintenance record ${maintenanceRecordId}:`,
      error
    );
    throw new Error('Failed to fetch attachments');
  }
}

/**
 * Get a single attachment by ID
 */
export async function getAttachmentById(id: number): Promise<Attachment | undefined> {
  try {
    return attachmentRepository.findById(id);
  } catch (error) {
    console.error(`Failed to get attachment ${id}:`, error);
    throw new Error('Failed to fetch attachment');
  }
}

/**
 * Upload a file attachment
 * Converts file to base64 and stores in database
 */
export async function uploadAttachment(
  formData: FormData,
  entityType: 'asset' | 'maintenance_record',
  entityId: number,
  homeId: number = 1
): Promise<Attachment> {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(
        `File type ${file.type} not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Determine file category
    const fileCategory = formData.get('category') as string | null;
    const description = formData.get('description') as string | null;

    // Create attachment data
    const attachmentData: CreateAttachment = {
      home_id: homeId,
      asset_id: entityType === 'asset' ? entityId : null,
      maintenance_record_id: entityType === 'maintenance_record' ? entityId : null,
      file_name: file.name,
      file_path: dataUrl, // Store base64 data URL
      file_size: file.size,
      mime_type: file.type,
      file_type: fileCategory || inferFileType(file.type),
      description: description,
      taken_date: null,
      thumbnail_path: null,
      metadata: null,
    };

    // Create attachment in database
    const attachment = attachmentRepository.create(attachmentData);

    // Revalidate relevant pages
    if (entityType === 'asset') {
      revalidatePath(`/assets/${entityId}`);
      revalidatePath('/assets');
    } else {
      revalidatePath('/maintenance');
    }

    return attachment;
  } catch (error) {
    console.error('Failed to upload attachment:', error);
    if (error instanceof Error) {
      throw error; // Re-throw validation errors with specific messages
    }
    throw new Error('Failed to upload file');
  }
}

/**
 * Update attachment metadata
 */
export async function updateAttachment(
  id: number,
  data: Partial<Pick<Attachment, 'file_name' | 'file_type' | 'description' | 'taken_date'>>
): Promise<Attachment | undefined> {
  try {
    const attachment = await attachmentRepository.update(id, data);

    if (attachment) {
      // Revalidate relevant pages
      if (attachment.asset_id) {
        revalidatePath(`/assets/${attachment.asset_id}`);
      }
      if (attachment.maintenance_record_id) {
        revalidatePath('/maintenance');
      }
    }

    return attachment;
  } catch (error) {
    console.error(`Failed to update attachment ${id}:`, error);
    throw new Error('Failed to update attachment');
  }
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(id: number): Promise<boolean> {
  try {
    // Get attachment first to know which pages to revalidate
    const attachment = await getAttachmentById(id);

    const result = attachmentRepository.delete(id);

    if (result && attachment) {
      // Revalidate relevant pages
      if (attachment.asset_id) {
        revalidatePath(`/assets/${attachment.asset_id}`);
        revalidatePath('/assets');
      }
      if (attachment.maintenance_record_id) {
        revalidatePath('/maintenance');
      }
    }

    return result;
  } catch (error) {
    console.error(`Failed to delete attachment ${id}:`, error);
    throw new Error('Failed to delete attachment');
  }
}

/**
 * Get allowed file types for validation
 */
export async function getAllowedFileTypes(): Promise<{
  images: string[];
  documents: string[];
  all: string[];
}> {
  return {
    images: ALLOWED_IMAGE_TYPES,
    documents: ALLOWED_DOCUMENT_TYPES,
    all: ALLOWED_MIME_TYPES,
  };
}

/**
 * Get maximum file size
 */
export async function getMaxFileSize(): Promise<number> {
  return MAX_FILE_SIZE;
}

/**
 * Infer file category from MIME type
 */
function inferFileType(mimeType: string): string {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return 'photo';
  }
  if (mimeType === 'application/pdf') {
    return 'document';
  }
  return 'other';
}
