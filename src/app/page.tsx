import { Header } from '@/components/header';
import { UnitConverter } from '@/components/unit-converter';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground items-center p-4">
      <div className="w-full max-w-[412px]">
        <Header />
        <main className="flex flex-1 flex-col items-center py-6">
          <h1 className="text-2xl font-bold self-start mb-4">Unit Converter</h1>
          <UnitConverter />
        </main>
      </div>
    </div>
  );
}
