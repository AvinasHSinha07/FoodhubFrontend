import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface OrderCustomerDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerOrderDetailsPage({ params }: OrderCustomerDetailsProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Order #{id.slice(-6)}</h1>
        <Badge variant="outline" className="text-sm px-3 py-1">Processing</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Items in this order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm font-medium">
              <span>2x Gourmet Burger</span>
              <span>$49.98</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>$49.98</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Info</CardTitle>
            <CardDescription>Where your food is heading</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p className="font-medium text-foreground">John Doe</p>
            <p>123 Main St, Apt 4B</p>
            <p>Springfield, SP 12345</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
