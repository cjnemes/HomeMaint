'use client';

import { EditAssetDialog } from './edit-asset-dialog';
import type { Asset, Category, Location } from '@/lib/db/types';

interface EditAssetDialogWrapperProps {
  asset: Asset;
  categories?: Category[];
  locations?: Location[];
}

export function EditAssetDialogWrapper({
  asset,
  categories,
  locations,
}: EditAssetDialogWrapperProps) {
  return <EditAssetDialog asset={asset} categories={categories} locations={locations} />;
}
