"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MealForm from "@/components/modules/Provider/MealForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateMealPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/provider/meals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create New Meal</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <MealForm />
        </CardContent>
      </Card>
    </div>
  );
}
