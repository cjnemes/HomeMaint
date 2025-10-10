import { getAssets, getCategories, getLocations, getFirstHome } from '@/app/actions/assets';
import { AssetsClient } from '@/components/assets/assets-client';

export default async function AssetsPage() {
  // Fetch the home (MVP supports single home)
  const home = await getFirstHome();

  // Fetch data on the server
  const [assets, categories, locations] = await Promise.all([
    getAssets(home.id),
    getCategories(home.id),
    getLocations(home.id),
  ]);

  return (
    <AssetsClient assets={assets} categories={categories} locations={locations} homeId={home.id} />
  );
}
