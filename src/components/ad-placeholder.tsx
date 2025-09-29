import { Card } from '@/components/ui/card';

export function AdPlaceholder({ className }: { className?: string }) {
  return (
    <Card
      className={`flex items-center justify-center h-24 bg-muted/50 ${className}`}
    >
      <p className="text-muted-foreground">Ad Placeholder</p>
    </Card>
  );
}
