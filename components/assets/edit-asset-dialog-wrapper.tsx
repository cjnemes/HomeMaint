'use client';

import { EditAssetDialog } from './edit-asset-dialog';
import type { Asset } from '@/lib/db/types';

interface EditAssetDialogWrapperProps {
  asset: Asset;
}

export function EditAssetDialogWrapper({ asset }: EditAssetDialogWrapperProps) {
  return <EditAssetDialog asset={asset} />;
}
