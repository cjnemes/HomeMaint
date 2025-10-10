import { Wrench, Calendar, DollarSign, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { assetRepository, maintenanceRecordRepository } from '@/lib/db/repositories';
import Link from 'next/link';

export default async function MaintenancePage() {
  // Fetch all assets to show maintenance records for each
  const assets = assetRepository.findAll();

  // Group maintenance records by asset
  const maintenanceByAsset = assets.map((asset) => ({
    asset,
    records: maintenanceRecordRepository.findByAssetId(asset.id),
  }));

  // Get total stats
  const totalRecords = maintenanceByAsset.reduce((sum, { records }) => sum + records.length, 0);
  const totalCost = maintenanceByAsset.reduce(
    (sum, { records }) => sum + records.reduce((s, r) => s + (r.cost || 0), 0),
    0
  );

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Maintenance Records</h1>
          <Badge variant="secondary">{totalRecords}</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets Tracked</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {maintenanceByAsset.filter(({ records }) => records.length > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Records by Asset */}
      {totalRecords === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No maintenance records yet</h2>
          <p className="text-muted-foreground mb-4">Start tracking your home maintenance history</p>
          <Link href="/assets">
            <Button>View Assets</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {maintenanceByAsset
            .filter(({ records }) => records.length > 0)
            .map(({ asset, records }) => (
              <Card key={asset.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        <Link href={`/assets/${asset.id}`} className="hover:underline">
                          {asset.name}
                        </Link>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {records.length} record{records.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge variant="outline">{asset.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {records.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-start justify-between border-l-4 border-primary pl-4 py-2"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{record.title}</h4>
                          {record.description && (
                            <p className="text-sm text-muted-foreground">{record.description}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(record.date_performed).toLocaleDateString()}
                            </div>
                            {record.performed_by && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {record.performed_by}
                              </div>
                            )}
                            {record.cost && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />${record.cost.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className="capitalize">{record.maintenance_type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
