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
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl gradient-subtle p-6 border border-border/50 mb-8 animate-fade-in">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-bg-success">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                Maintenance Records
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track and view your maintenance history
              </p>
            </div>
            <Badge
              variant="secondary"
              className="ml-2 bg-success/10 text-success border-success/20"
            >
              {totalRecords}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-up">
        <Card className="card-hover border-l-4 border-l-success overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Records
            </CardTitle>
            <div className="rounded-full p-2 bg-success/10 text-success transition-transform group-hover:scale-110">
              <Wrench className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRecords}</div>
          </CardContent>
        </Card>
        <Card className="card-hover border-l-4 border-l-primary overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
            <div className="rounded-full p-2 bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="card-hover border-l-4 border-l-info overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assets Tracked
            </CardTitle>
            <div className="rounded-full p-2 bg-info/10 text-info transition-transform group-hover:scale-110">
              <User className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {maintenanceByAsset.filter(({ records }) => records.length > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Records by Asset */}
      {totalRecords === 0 ? (
        <Card className="border-2 border-dashed border-border hover:border-success/50 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8">
            <div className="rounded-full bg-success/10 p-6 mb-6">
              <Wrench className="h-16 w-16 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No maintenance records yet</h2>
            <p className="text-base text-muted-foreground mb-8 text-center max-w-md">
              Start tracking your home maintenance history by adding records to your assets
            </p>
            <Link href="/assets">
              <Button size="lg" className="btn-gradient shadow-lg">
                View Assets
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {maintenanceByAsset
            .filter(({ records }) => records.length > 0)
            .map(({ asset, records }) => (
              <Card key={asset.id} className="card-elevated">
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="icon-bg-success">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle>
                          <Link
                            href={`/assets/${asset.id}`}
                            className="hover:text-success transition-colors"
                          >
                            {asset.name}
                          </Link>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {records.length} record{records.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{asset.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {records.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-start justify-between border-l-4 border-success pl-4 py-3 rounded-r-lg bg-background-subtle/50 hover:bg-background-subtle transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{record.title}</h4>
                          {record.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {record.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-success" />
                              <span className="text-muted-foreground">
                                {new Date(record.date_performed).toLocaleDateString()}
                              </span>
                            </div>
                            {record.performed_by && (
                              <div className="flex items-center gap-1.5">
                                <User className="h-4 w-4 text-success" />
                                <span className="text-muted-foreground">{record.performed_by}</span>
                              </div>
                            )}
                            {record.cost && (
                              <div className="flex items-center gap-1.5">
                                <DollarSign className="h-4 w-4 text-success" />
                                <span className="text-muted-foreground">
                                  ${record.cost.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className="capitalize bg-success/10 text-success border-success/20">
                          {record.maintenance_type}
                        </Badge>
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
