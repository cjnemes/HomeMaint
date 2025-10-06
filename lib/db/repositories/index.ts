// Export all repositories for easy import
export * from './base.repository';
export * from './home.repository';
export * from './category.repository';
export * from './location.repository';
export * from './asset.repository';
export * from './service-provider.repository';
export * from './maintenance-record.repository';
export * from './maintenance-task.repository';
export * from './attachment.repository';

// Export singleton instances
export { homeRepository } from './home.repository';
export { categoryRepository } from './category.repository';
export { locationRepository } from './location.repository';
export { assetRepository } from './asset.repository';
export { serviceProviderRepository } from './service-provider.repository';
export { maintenanceRecordRepository } from './maintenance-record.repository';
export { maintenanceTaskRepository } from './maintenance-task.repository';
export { attachmentRepository } from './attachment.repository';
