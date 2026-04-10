import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminProvidersPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Manage Providers</h1>
        <Button>Add Provider</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Providers</CardTitle>
          <CardDescription>View, approve, and manage food providers on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Provider Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Dummy row data */}
              <TableRow>
                <TableCell className="font-medium">PR-100</TableCell>
                <TableCell>Tasty Burgers Inc.</TableCell>
                <TableCell>tastys@example.com</TableCell>
                <TableCell><Badge>Active</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">PR-101</TableCell>
                <TableCell>The Vegan Spot</TableCell>
                <TableCell>vegan@example.com</TableCell>
                <TableCell><Badge variant="outline">Pending</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Review</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">PR-102</TableCell>
                <TableCell>Spicy Noodles Co.</TableCell>
                <TableCell>noodles@example.com</TableCell>
                <TableCell><Badge variant="destructive">Suspended</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Manage</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
