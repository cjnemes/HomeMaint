import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Package, Wrench, CheckSquare } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-4xl">
          <h1 className="text-5xl font-bold mb-6">Take Control of Your Home Maintenance</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Track assets, schedule maintenance, and never miss an important home repair again.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Package className="h-8 w-8" />}
              title="Asset Tracking"
              description="Keep detailed records of all your home systems and appliances"
            />
            <FeatureCard
              icon={<Wrench className="h-8 w-8" />}
              title="Maintenance History"
              description="Log all repairs and maintenance with photos and receipts"
            />
            <FeatureCard
              icon={<CheckSquare className="h-8 w-8" />}
              title="Task Management"
              description="Schedule and track upcoming maintenance tasks"
            />
            <FeatureCard
              icon={<Home className="h-8 w-8" />}
              title="Complete Records"
              description="Store manuals, warranties, and important documents"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
