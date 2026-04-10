"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createOrderSchema, CreateOrderPayload } from "@/zod/order.validation";
import { OrderServices } from "@/services/order.services";
import { useCart } from "@/providers/CartProvider";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { PaymentServices } from "@/services/payment.services";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripePaymentForm } from "@/components/modules/Payment/StripePaymentForm";

// Make sure to set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function CheckoutPage() {
  const router = useRouter();
  const { items, providerId, providerInfo, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  
  // Calculate final total correctly exactly like shown in UI
  const totalWithTax = totalPrice * 1.1;

  const form = useForm<CreateOrderPayload>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      providerId: providerId || "",
      deliveryAddress: "",
      items: items.map((i) => ({ mealId: i.meal.id, quantity: i.quantity })),   
    },
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      router.push("/");
    }
  }, [items, router]);

  const onSubmit = async (data: CreateOrderPayload) => {
    setIsSubmitting(true);
    try {
      // Create initial order in database (Status: PLACED, Payment: PENDING)
      const response = await OrderServices.createOrder(data);
      if (response.success && response.data?.id) {
        setPlacedOrderId(response.data.id);
        toast.success("Order confirmed. Processing secure payment...");

        // Connect to Stripe Intent
        const paymentRes = await PaymentServices.createPaymentIntent(
          response.data.id,
          totalWithTax
        );

        if (paymentRes.success && paymentRes.data?.clientSecret) {
           setClientSecret(paymentRes.data.clientSecret);
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    router.push("/customer/orders");
  }

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="space-y-6">
          <Button variant="ghost" asChild className="pl-0 hover:bg-transparent">
            <Link href={`/restaurant/${providerId}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to menu</Link>
          </Button>

          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>

          <Card>
            <CardHeader>
              <CardTitle>{clientSecret ? "Secure Payment" : "Delivery Details"}</CardTitle>
            </CardHeader>
            <CardContent>
              {!clientSecret ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Delivery Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your exact delivery address and any special instructions..." 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : `Proceed to Payment • $${totalWithTax.toFixed(2)}`}
                  </Button>
                </form>
              </Form>
              ) : (
                <Elements 
                  stripe={stripePromise} 
                  options={{ clientSecret, appearance: { theme: 'stripe' } }}
                >
                  <StripePaymentForm 
                    clientSecret={clientSecret} 
                    orderId={placedOrderId!} 
                    onSuccess={handlePaymentSuccess} 
                  />
                </Elements>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6 md:mt-20">
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" /> Order Summary
              </CardTitle>
              {providerInfo && (
                <p className="text-sm text-gray-500">From {providerInfo.restaurantName}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-2">
                {items.map((item) => (
                  <div key={item.meal.id} className="flex justify-between items-start">
                    <div className="flex gap-3">
                      {item.meal.image ? (
                        <img src={item.meal.image} alt={item.meal.title} className="h-12 w-12 rounded object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded bg-gray-200" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{item.meal.title}</p>
                        <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">${(item.meal.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax & Fees (10%)</span>
                  <span>${(totalPrice * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span>Free</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg pt-2 text-primary">
                <span>Total</span>
                <span>${(totalPrice * 1.1).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
