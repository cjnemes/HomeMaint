'use client';

import { useState, useMemo } from 'react';
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
import { mockAssets, mockCategories, mockLocations } from '@/lib/mock-data';

export default function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter and search assets
  const filteredAssets = useMemo(() => {
    return mockAssets.filter((asset) => {
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
  }, [searchQuery, categoryFilter, statusFilter]);

  // Group assets by category
  const assetsByCategory = useMemo(() => {
    const grouped: Record<number, typeof mockAssets> = {};
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
    return mockCategories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  const getCategoryIcon = (categoryId: number) => {
    return mockCategories.find((c) => c.id === categoryId)?.icon || '📦';
  };

  const getLocationName = (locationId: number | null) => {
    if (!locationId) return 'No location';
    return mockLocations.find((l) => l.id === locationId)?.name || 'Unknown';
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Assets</h1>
          <Badge variant="secondary" className="ml-2">
            {filteredAssets.length}
          </Badge>
        </div>
        <AddAssetDialog />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets by name, manufacturer, or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {mockCategories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.icon} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
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

      {/* Asset List */}
      {filteredAssets.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No assets found</h2>
          <p className="text-muted-foreground mb-4">
            {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first home asset'}
          </p>
          <AddAssetDialog />
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(assetsByCategory).map(([categoryId, assets]) => (
            <div key={categoryId}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon(parseInt(categoryId))}</span>
                {getCategoryName(parseInt(categoryId))}
                <Badge variant="outline">{assets.length}</Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.map((asset) => (
                  <Card key={asset.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{asset.name}</CardTitle>
                        <Badge variant={getStatusColor(asset.status)}>{asset.status}</Badge>
                      </div>
                      {asset.manufacturer && (
                        <CardDescription>
                          {asset.manufacturer}
                          {asset.model_number && ` • ${asset.model_number}`}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {asset.location_id && (
                          <div>Location: {getLocationName(asset.location_id)}</div>
                        )}
                        {asset.purchase_date && (
                          <div>Purchased: {new Date(asset.purchase_date).toLocaleDateString()}</div>
                        )}
                        {asset.warranty_expiration_date && (
                          <div>
                            Warranty expires:{' '}
                            {new Date(asset.warranty_expiration_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
