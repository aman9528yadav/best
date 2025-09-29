import { Header } from '@/components/header';
import { UnitConverter } from '@/components/unit-converter';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <Header />
      <main className="flex flex-1 flex-col items-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg space-y-6">
          <UnitConverter />
        </div>
      </main>
    </div>
  );
}
