
import { Header } from '@/components/header';
import { HistoryPage } from '@/components/history-page';
import { AdPlaceholder } from '@/components/ad-placeholder';

export default function History() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground items-center p-4">
      <div className="w-full max-w-[412px]">
        <Header />
        <main className="flex flex-1 flex-col items-center py-6">
          <AdPlaceholder className="mb-4 w-full" />
          <HistoryPage />
          <AdPlaceholder className="mt-4 w-full" />
        </main>
      </div>
    </div>
  );
}
