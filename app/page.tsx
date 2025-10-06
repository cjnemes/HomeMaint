import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">HomeMaint</h1>
        <p className="text-xl text-muted-foreground">Home Maintenance & Asset Tracking</p>
        <p className="mt-8 text-sm text-muted-foreground">Week 1: Project Setup in Progress</p>
        <div className="mt-8 flex gap-4 justify-center">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </div>
    </main>
  );
}
