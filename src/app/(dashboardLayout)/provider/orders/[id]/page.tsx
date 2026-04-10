import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface OrderProviderDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function ProviderOrderDetailsPage({ params }: OrderProviderDetailsProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Manage Order #{id.slice(-6)}</h1>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="text-sm px-3 py-1">Assigned to You</Badge>
           <Button>Update Status</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>What the customer has ordered</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm font-medium">
              <span>2x Gourmet Burger</span>
              <span>$49.98</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Earnings</span>
              <span className="text-primary">$42.00</span>
            </div>
          </CardContent>
          <CardFooter className="bg-muted py-3 px-6 text-sm text-muted-foreground">
            Platform fee: $7.98
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Focus</CardTitle>
            <CardDescription>Preparation details</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p className="font-medium text-foreground">John Doe</p>
            <p>123 Main St, Apt 4B</p>
            <div className="mt-4 p-4 rounded-md border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              <span className="font-semibold">Special Instructions:</span> Please no onions and hold the pickles.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
