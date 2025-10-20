import { writeFile, readFile, unlink, mkdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

/**
 * File metadata interface
 */
export interface StoredFile {
  relativePath: string; // Path relative to data/attachments
  absolutePath: string; // Full filesystem path
  size: number;
  mimeType: string;
  hash: string;
}

/**
 * File storage service for filesystem-based attachment storage
 * Replaces base64 storage in database for better performance and scalability
 */
export class FileStorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = join(process.cwd(), 'data', 'attachments');
    this.ensureStorageDirectory();
  }

  /**
   * Ensure storage directory exists
   */
  private ensureStorageDirectory(): void {
    if (!existsSync(this.baseDir)) {
      mkdir(this.baseDir, { recursive: true })
        .then(() => console.log(`Created attachments directory: ${this.baseDir}`))
        .catch((error) => console.error('Failed to create attachments directory:', error));
    }
  }

  /**
   * Store a file on the filesystem
   * Files are organized by year/month for easier management
   * Filenames are hashed to prevent collisions and directory traversal attacks
   */
  public async storeFile(
    file: Buffer,
    mimeType: string,
    originalFilename: string
  ): Promise<StoredFile> {
    try {
      // Generate hash for deduplication and unique filename
      const hash = crypto.createHash('sha256').update(file).digest('hex');

      // Get file extension from original filename
      const ext = this.getFileExtension(originalFilename);

      // Create filename: hash + extension
      const filename = `${hash}${ext}`;

      // Organize by date (year/month) for easier management
      const now = new Date();
      const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
      const dir = join(this.baseDir, yearMonth);

      // Ensure directory exists
      await mkdir(dir, { recursive: true });

      const absolutePath = join(dir, filename);
      const relativePath = join('attachments', yearMonth, filename);

      // Check if file already exists (deduplication)
      if (existsSync(absolutePath)) {
        console.log(`File already exists (deduplication): ${relativePath}`);
        const stats = await stat(absolutePath);

        return {
          relativePath,
          absolutePath,
          size: stats.size,
          mimeType,
          hash,
        };
      }

      // Write file to filesystem
      await writeFile(absolutePath, file);

      const stats = await stat(absolutePath);

      console.log(`Stored file: ${relativePath} (${this.formatBytes(stats.size)})`);

      return {
        relativePath,
        absolutePath,
        size: stats.size,
        mimeType,
        hash,
      };
    } catch (error) {
      console.error('Failed to store file:', error);
      throw new Error(`File storage failed: ${error}`);
    }
  }

  /**
   * Read a file from the filesystem
   */
  public async readFile(relativePath: string): Promise<Buffer> {
    try {
      // Validate path to prevent directory traversal
      if (this.containsPathTraversal(relativePath)) {
        throw new Error('Invalid file path: directory traversal detected');
      }

      const absolutePath = join(process.cwd(), 'data', relativePath);

      if (!existsSync(absolutePath)) {
        throw new Error('File not found');
      }

      const file = await readFile(absolutePath);
      return file;
    } catch (error) {
      console.error(`Failed to read file ${relativePath}:`, error);
      throw new Error(`File read failed: ${error}`);
    }
  }

  /**
   * Delete a file from the filesystem
   */
  public async deleteFile(relativePath: string): Promise<void> {
    try {
      // Validate path to prevent directory traversal
      if (this.containsPathTraversal(relativePath)) {
        throw new Error('Invalid file path: directory traversal detected');
      }

      const absolutePath = join(process.cwd(), 'data', relativePath);

      if (!existsSync(absolutePath)) {
        console.warn(`File not found, skipping deletion: ${relativePath}`);
        return;
      }

      await unlink(absolutePath);
      console.log(`Deleted file: ${relativePath}`);
    } catch (error) {
      console.error(`Failed to delete file ${relativePath}:`, error);
      throw new Error(`File deletion failed: ${error}`);
    }
  }

  /**
   * Check if a file exists
   */
  public fileExists(relativePath: string): boolean {
    // Validate path to prevent directory traversal
    if (this.containsPathTraversal(relativePath)) {
      return false;
    }

    const absolutePath = join(process.cwd(), 'data', relativePath);
    return existsSync(absolutePath);
  }

  /**
   * Get file stats
   */
  public async getFileStats(
    relativePath: string
  ): Promise<{ size: number; created: Date; modified: Date }> {
    try {
      // Validate path to prevent directory traversal
      if (this.containsPathTraversal(relativePath)) {
        throw new Error('Invalid file path: directory traversal detected');
      }

      const absolutePath = join(process.cwd(), 'data', relativePath);
      const stats = await stat(absolutePath);

      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      };
    } catch (error) {
      console.error(`Failed to get file stats for ${relativePath}:`, error);
      throw new Error(`Failed to get file stats: ${error}`);
    }
  }

  /**
   * Store base64-encoded file (for migration from old system)
   */
  public async storeBase64File(
    base64Data: string,
    mimeType: string,
    originalFilename: string
  ): Promise<StoredFile> {
    try {
      // Extract base64 data from data URL if present
      let base64String = base64Data;
      if (base64Data.startsWith('data:')) {
        const matches = base64Data.match(/^data:.+;base64,(.+)$/);
        if (matches && matches[1]) {
          base64String = matches[1];
        }
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(base64String, 'base64');

      // Store using regular method
      return await this.storeFile(buffer, mimeType, originalFilename);
    } catch (error) {
      console.error('Failed to store base64 file:', error);
      throw new Error(`Base64 file storage failed: ${error}`);
    }
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';

    const ext = filename.substring(lastDot);

    // Validate extension (only allow alphanumeric and common chars)
    if (!/^\.[a-zA-Z0-9]+$/.test(ext)) {
      return '';
    }

    return ext.toLowerCase();
  }

  /**
   * Check if path contains directory traversal attempts
   */
  private containsPathTraversal(path: string): boolean {
    // Check for directory traversal patterns
    const dangerous = ['..', '~', '//', '\\\\', '\0'];

    return dangerous.some((pattern) => path.includes(pattern));
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get total storage size
   */
  public async getTotalStorageSize(): Promise<number> {
    // This would require recursive directory traversal
    // For now, return 0 as placeholder
    // TODO: Implement recursive size calculation
    return 0;
  }

  /**
   * Clean up orphaned files (files not referenced in database)
   * This should be run periodically as maintenance
   */
  public async cleanupOrphanedFiles(
    referencedPaths: string[]
  ): Promise<{ deleted: number; errors: string[] }> {
    // TODO: Implement orphaned file cleanup
    // This requires traversing the filesystem and comparing with database
    return { deleted: 0, errors: [] };
  }
}

// Export singleton instance
export const fileStorage = new FileStorageService();
