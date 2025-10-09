import { ArrowLeft, Calendar, Wrench, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EditAssetDialogWrapper } from '@/components/assets/edit-asset-dialog-wrapper';
import { DeleteAssetButton } from '@/components/assets/delete-asset-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockAssets, mockCategories, mockLocations } from '@/lib/mock-data';

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { id } = await params;
  const assetId = parseInt(id);

  const asset = mockAssets.find((a) => a.id === assetId);

  if (!asset) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/assets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Asset Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              The asset you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/assets">
              <Button className="mt-4">Back to Assets</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const category = mockCategories.find((c) => c.id === asset.category_id);
  const location = mockLocations.find((l) => l.id === asset.location_id);

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
    <div className="container py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/assets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{asset.name}</h1>
              <Badge variant={getStatusColor(asset.status)}>{asset.status}</Badge>
            </div>
            {asset.manufacturer && (
              <p className="text-muted-foreground mt-1">
                {asset.manufacturer}
                {asset.model_number && ` • ${asset.model_number}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <EditAssetDialogWrapper asset={asset} />
          <DeleteAssetButton assetId={asset.id} assetName={asset.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Information - 2 columns */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {category && (
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">
                      {category.icon} {category.name}
                    </p>
                  </div>
                )}
                {location && (
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{location.name}</p>
                  </div>
                )}
                {asset.serial_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Serial Number</p>
                    <p className="font-medium font-mono text-sm">{asset.serial_number}</p>
                  </div>
                )}
                {asset.year_manufactured && (
                  <div>
                    <p className="text-sm text-muted-foreground">Year Manufactured</p>
                    <p className="font-medium">{asset.year_manufactured}</p>
                  </div>
                )}
              </div>
              {asset.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm">{asset.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Purchase & Warranty */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase & Warranty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {asset.purchase_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Purchase Date</p>
                    <p className="font-medium">
                      {new Date(asset.purchase_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {asset.purchase_price && (
                  <div>
                    <p className="text-sm text-muted-foreground">Purchase Price</p>
                    <p className="font-medium">${asset.purchase_price.toLocaleString()}</p>
                  </div>
                )}
                {asset.warranty_duration_months && (
                  <div>
                    <p className="text-sm text-muted-foreground">Warranty Duration</p>
                    <p className="font-medium">{asset.warranty_duration_months} months</p>
                  </div>
                )}
                {asset.warranty_expiration_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Warranty Expires</p>
                    <p className="font-medium">
                      {new Date(asset.warranty_expiration_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {asset.expected_lifespan_years && (
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Lifespan</p>
                    <p className="font-medium">{asset.expected_lifespan_years} years</p>
                  </div>
                )}
                {asset.estimated_replacement_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Replacement</p>
                    <p className="font-medium">
                      {new Date(asset.estimated_replacement_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Maintenance History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Maintenance History
                </CardTitle>
                <Button variant="outline" size="sm">
                  Add Record
                </Button>
              </div>
              <CardDescription>Track all service and repairs for this asset</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No maintenance records yet</p>
                <p className="text-sm mt-1">Log your first service to start tracking</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Maintenance Records</p>
              </div>
              <Separator />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Upcoming Tasks</p>
              </div>
              <Separator />
              <div>
                <p className="text-2xl font-bold">$0</p>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No scheduled tasks</p>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No documents uploaded</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
