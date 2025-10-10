import { getAssets, getCategories, getLocations } from '@/app/actions/assets';
import { AssetsClient } from '@/components/assets/assets-client';

export default async function AssetsPage() {
  // Fetch data on the server
  const [assets, categories, locations] = await Promise.all([
    getAssets(1),
    getCategories(1),
    getLocations(1),
  ]);

  return <AssetsClient assets={assets} categories={categories} locations={locations} />;
}
