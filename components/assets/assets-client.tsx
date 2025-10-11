'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Package, Search, Filter } from 'lucide-react';
import { AddAssetDialog } from '@/components/assets/add-asset-dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Asset, Category, Location } from '@/lib/db/types';

interface AssetsClientProps {
  assets: Asset[];
  categories: Category[];
  locations: Location[];
  homeId: number;
}

export function AssetsClient({ assets, categories, locations, homeId }: AssetsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter and search assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        searchQuery === '' ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.model_number?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' || asset.category_id === parseInt(categoryFilter);

      const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [assets, searchQuery, categoryFilter, statusFilter]);

  // Group assets by category
  const assetsByCategory = useMemo(() => {
    const grouped: Record<number, Asset[]> = {};
    filteredAssets.forEach((asset) => {
      // Skip assets without a category
      if (!asset.category_id) return;

      if (!grouped[asset.category_id]) {
        grouped[asset.category_id] = [];
      }
      grouped[asset.category_id]!.push(asset);
    });
    return grouped;
  }, [filteredAssets]);

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  const getCategoryIcon = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.icon || '📦';
  };

  const getLocationName = (locationId: number | null) => {
    if (!locationId) return 'No location';
    return locations.find((l) => l.id === locationId)?.name || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'retired':
        return 'secondary';
      case 'broken':
        return 'destructive';
      case 'replaced':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl gradient-subtle p-6 border border-border/50 mb-8 animate-fade-in">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-bg-primary">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                Assets
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track and manage your home assets
              </p>
            </div>
            <Badge
              variant="secondary"
              className="ml-2 bg-primary/10 text-primary border-primary/20"
            >
              {filteredAssets.length}
            </Badge>
          </div>
          <AddAssetDialog categories={categories} locations={locations} homeId={homeId} />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-background-subtle rounded-xl p-4 border border-border/50 mb-8 animate-slide-up">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              placeholder="Search assets by name, manufacturer, or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-border/50 focus:border-primary focus:ring-primary/20"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px] bg-background border-border/50">
              <Filter className="h-4 w-4 mr-2 text-primary" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-background border-border/50">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
              <SelectItem value="broken">Broken</SelectItem>
              <SelectItem value="replaced">Replaced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Asset List */}
      {filteredAssets.length === 0 ? (
        <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <Package className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No assets found</h2>
            <p className="text-base text-muted-foreground mb-8 text-center max-w-md">
              {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                ? "Try adjusting your search or filters to find what you're looking for"
                : 'Get started by adding your first home asset to track'}
            </p>
            <AddAssetDialog categories={categories} locations={locations} homeId={homeId} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(assetsByCategory).map(([categoryId, assets]) => (
            <div key={categoryId} className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-background-subtle rounded-lg border border-border/50">
                  <span className="text-2xl">{getCategoryIcon(parseInt(categoryId))}</span>
                  <h2 className="text-xl font-semibold">{getCategoryName(parseInt(categoryId))}</h2>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {assets.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.map((asset) => (
                  <Link key={asset.id} href={`/assets/${asset.id}`}>
                    <Card className="card-hover cursor-pointer h-full group">
                      <CardHeader>
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {asset.name}
                          </CardTitle>
                          <Badge variant={getStatusColor(asset.status)} className="shrink-0">
                            {asset.status}
                          </Badge>
                        </div>
                        {asset.manufacturer && (
                          <CardDescription className="font-medium">
                            {asset.manufacturer}
                            {asset.model_number && ` • ${asset.model_number}`}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {asset.location_id && (
                            <div className="flex items-center gap-2">
                              <span className="text-primary">📍</span>
                              {getLocationName(asset.location_id)}
                            </div>
                          )}
                          {asset.purchase_date && (
                            <div className="flex items-center gap-2">
                              <span className="text-primary">📅</span>
                              Purchased: {new Date(asset.purchase_date).toLocaleDateString()}
                            </div>
                          )}
                          {asset.warranty_expiration_date && (
                            <div className="flex items-center gap-2">
                              <span className="text-primary">🛡️</span>
                              Warranty:{' '}
                              {new Date(asset.warranty_expiration_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
