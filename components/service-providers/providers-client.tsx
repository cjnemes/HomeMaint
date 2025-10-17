'use client';

import { useState, useMemo } from 'react';
import { Search, Star, Phone, Mail, MapPin, Award } from 'lucide-react';
import { AddProviderDialog } from '@/components/service-providers/add-provider-dialog';
import { EditProviderDialog } from '@/components/service-providers/edit-provider-dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ServiceProvider } from '@/lib/db/types';

interface ProvidersClientProps {
  providers: ServiceProvider[];
  homeId: number;
}

export function ProvidersClient({ providers, homeId }: ProvidersClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and search providers
  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const matchesSearch =
        searchQuery === '' ||
        provider.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.service_types?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [providers, searchQuery]);

  // Separate preferred and other providers
  const preferredProviders = useMemo(() => {
    return filteredProviders.filter((p) => p.is_preferred === 1);
  }, [filteredProviders]);

  const otherProviders = useMemo(() => {
    return filteredProviders.filter((p) => p.is_preferred === 0);
  }, [filteredProviders]);

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl gradient-subtle p-6 border border-border/50 mb-8 animate-fade-in">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-bg-primary">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                Service Providers
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your trusted contractors and service companies
              </p>
            </div>
            <Badge
              variant="secondary"
              className="ml-2 bg-primary/10 text-primary border-primary/20"
            >
              {filteredProviders.length}
            </Badge>
          </div>
          <AddProviderDialog homeId={homeId} />
        </div>
      </div>

      {/* Search */}
      <div className="bg-background-subtle rounded-xl p-4 border border-border/50 mb-8 animate-slide-up">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
          <Input
            placeholder="Search providers by company name, contact, or services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-border/50 focus:border-primary focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Provider List */}
      {filteredProviders.length === 0 ? (
        <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <Award className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No service providers found</h2>
            <p className="text-base text-muted-foreground mb-8 text-center max-w-md">
              {searchQuery
                ? "Try adjusting your search to find what you're looking for"
                : 'Add your trusted contractors and service companies'}
            </p>
            <AddProviderDialog homeId={homeId} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Preferred Providers */}
          {preferredProviders.length > 0 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-background-subtle rounded-lg border border-border/50">
                  <Star className="h-5 w-5 text-warning fill-warning" />
                  <h2 className="text-xl font-semibold">Preferred Providers</h2>
                </div>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  {preferredProviders.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {preferredProviders.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            </div>
          )}

          {/* Other Providers */}
          {otherProviders.length > 0 && (
            <div className="animate-fade-in">
              {preferredProviders.length > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-background-subtle rounded-lg border border-border/50">
                    <h2 className="text-xl font-semibold">All Providers</h2>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {otherProviders.length}
                  </Badge>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherProviders.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProviderCard({ provider }: { provider: ServiceProvider }) {
  return (
    <Card className="card-hover h-full group">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
              {provider.company_name}
              {provider.is_preferred === 1 && (
                <Star className="h-4 w-4 text-warning fill-warning" />
              )}
            </CardTitle>
            {provider.contact_name && (
              <CardDescription className="font-medium">{provider.contact_name}</CardDescription>
            )}
          </div>
          {provider.rating && (
            <Badge variant="secondary" className="shrink-0">
              ⭐ {provider.rating}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {provider.service_types && (
            <div className="flex flex-wrap gap-1">
              {provider.service_types.split(',').map((service, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {service.trim()}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-2 text-sm text-muted-foreground">
            {provider.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href={`tel:${provider.phone}`} className="hover:text-primary transition-colors">
                  {provider.phone}
                </a>
              </div>
            )}

            {provider.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a
                  href={`mailto:${provider.email}`}
                  className="hover:text-primary transition-colors truncate"
                >
                  {provider.email}
                </a>
              </div>
            )}

            {provider.city && provider.state && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>
                  {provider.city}, {provider.state}
                </span>
              </div>
            )}

            {provider.license_number && (
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary shrink-0" />
                <span>License: {provider.license_number}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t">
            <EditProviderDialog provider={provider} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
