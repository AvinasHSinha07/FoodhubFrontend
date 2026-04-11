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
import { ArrowLeft, ShoppingBag, Lock, MapPin, Truck, Utensils, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { PaymentServices } from "@/services/payment.services";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripePaymentForm } from "@/components/modules/Payment/StripePaymentForm";
import Image from "next/image";
import {
  clearReorderDraftDeliveryAddress,
  getReorderDraftDeliveryAddress,
} from "@/lib/reorder-draft";

// Make sure to set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function CheckoutPage() {
  const router = useRouter();
  const { isInitialized, items, providerId, providerInfo, totalPrice, clearCart } = useCart();
  const backToMenuHref = providerId ? `/restaurant/${providerId}` : "/restaurants";
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
    if (isInitialized && items.length === 0) {
      toast.error("Your cart is empty");
      router.push("/");
    }
  }, [isInitialized, items, router]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    form.setValue("providerId", providerId || "");
    form.setValue(
      "items",
      items.map((item) => ({ mealId: item.meal.id, quantity: item.quantity }))
    );
  }, [form, isInitialized, items, providerId]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const draftDeliveryAddress = getReorderDraftDeliveryAddress();
    const currentAddress = form.getValues("deliveryAddress");

    if (draftDeliveryAddress && !currentAddress) {
      form.setValue("deliveryAddress", draftDeliveryAddress);
    }
  }, [form, isInitialized]);

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
          response.data.id
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
    clearReorderDraftDeliveryAddress();
    toast.success("Payment Successful! Your order is on the way.");
    router.push("/customer/orders");
  }

  if (!isInitialized) {
    return null;
  }

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 font-sans" style={{ fontFamily: "var(--font-sora)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Link href={backToMenuHref} className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu
          </Link>
        </div>

        <div className="text-center mb-12">
           <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
             Secure Checkout
           </h1>
           <p className="text-slate-500 font-medium">Complete your order from <span className="text-indigo-600 font-bold">{providerInfo?.restaurantName || "Restaurant"}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Checkout Form */}
          <div className="lg:col-span-3 space-y-8">

            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-pink-500"></div>
              <CardHeader className="pb-6 border-b border-slate-100 bg-white/50 pt-8 px-8">
                <CardTitle className="text-2xl font-bold flex items-center text-slate-800" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {clientSecret ? (
                    <><Lock className="mr-3 h-6 w-6 text-indigo-500" /> Payment Details</>
                  ) : (
                    <><MapPin className="mr-3 h-6 w-6 text-indigo-500" /> Delivery Information</>
                  )}
                </CardTitle>
                <p className="text-slate-500 text-sm mt-2">
                  {clientSecret ? "Enter your card details securely below." : "Where should we deliver your delicious food?"}
                </p>
              </CardHeader>
              <CardContent className="p-8">
                {!clientSecret ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="deliveryAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-bold">Full Delivery Address</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="e.g. 123 Main St, Apt 4B. Please leave at the door." 
                                className="resize-none rounded-2xl border-slate-200 focus-visible:ring-indigo-500 min-h-[120px] p-4 bg-slate-50"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-pink-500" />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-200 transition-all group" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>Processing...</span>
                        ) : (
                          <span className="flex items-center justify-center w-full">
                            Proceed to Payment
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        )}
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Elements 
                      stripe={stripePromise} 
                      options={{ 
                        clientSecret, 
                        appearance: { 
                          theme: 'stripe',
                          variables: {
                            colorPrimary: '#4f46e5',
                            colorBackground: '#ffffff',
                            colorText: '#1e293b',
                            fontFamily: 'Sora, sans-serif',
                            spacingUnit: '4px',
                            borderRadius: '12px',
                          }
                        } 
                      }}
                    >
                      <StripePaymentForm 
                        clientSecret={clientSecret} 
                        orderId={placedOrderId!} 
                        onSuccess={handlePaymentSuccess} 
                      />
                    </Elements>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl rounded-3xl bg-slate-900 text-white overflow-hidden sticky top-24">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-50"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-50"></div>
              
              <CardHeader className="pb-6 border-b border-white/10 relative z-10 pt-8 px-8">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  <ShoppingBag className="h-6 w-6 text-pink-400" /> 
                  Order Summary
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-8 space-y-6 relative z-10">
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.meal.id} className="flex gap-4 items-start">
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/10">
                        {item.meal.image ? (
                          <img src={item.meal.image} alt={item.meal.title} className="h-full w-full object-cover" />
                        ) : (
                          <Utensils className="h-8 w-8 m-4 text-white/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate">{item.meal.title}</h4>
                        <p className="text-slate-400 text-sm mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-bold text-pink-400">
                        ${(item.meal.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/10 space-y-3">
                  <div className="flex justify-between text-slate-300 font-medium">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 font-medium">
                    <span>Tax & Fees (10%)</span>
                    <span>${(totalPrice * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 font-medium">
                    <span>Delivery</span>
                    <span className="text-emerald-400">Free</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xl flex flex-col">
                    <span className="font-bold">Total</span>
                    <span className="text-xs text-slate-400 font-normal">Including all fees</span>
                  </span>
                  <span className="text-3xl font-black text-indigo-400" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    ${totalWithTax.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
