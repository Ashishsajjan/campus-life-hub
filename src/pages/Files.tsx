import { Card, CardContent } from '@/components/ui/card';

export default function Files() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Files & Study Material</h1>
      <Card className="glass-strong">
        <CardContent className="pt-6 text-center text-muted-foreground">
          File management coming soon - upload and organize study materials
        </CardContent>
      </Card>
    </div>
  );
}