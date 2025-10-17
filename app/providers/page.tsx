import { getServiceProviders } from '@/app/actions/service-providers';
import { getFirstHome } from '@/app/actions/assets';
import { ProvidersClient } from '@/components/service-providers/providers-client';

export default async function ProvidersPage() {
  const home = await getFirstHome();
  const providers = await getServiceProviders(home.id);

  return <ProvidersClient providers={providers} homeId={home.id} />;
}
