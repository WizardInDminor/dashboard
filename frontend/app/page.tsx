import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const greeting = "Welcome back";
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{greeting}</h2>
        <p className="text-muted-foreground">{today}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Widgets will appear here as modules are built out.
        </CardContent>
      </Card>
    </div>
  );
}
