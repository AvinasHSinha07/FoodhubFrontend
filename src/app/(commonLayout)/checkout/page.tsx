"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createOrderSchema, CreateOrderPayload } from "@/zod/order.validation";
import { OrderServices } from "@/services/order.services";
import { useCart } from "@/providers/CartProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ShoppingBag, Lock, MapPin, Utensils, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PaymentServices } from "@/services/payment.services";
import { UserServices } from "@/services/user.services";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripePaymentForm } from "@/components/modules/Payment/StripePaymentForm";
import { PaymentMethod } from "@/types/order.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
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
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.STRIPE);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [couponPreview, setCouponPreview] = useState<{
    subtotalPrice: number;
    discountAmount: number;
    totalPrice: number;
    coupon: { code: string } | null;
  } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  const discountAmount = couponPreview?.discountAmount || 0;
  const discountedSubtotal = Math.max(0, totalPrice - discountAmount);
  const taxAmount = discountedSubtotal * 0.1;
  const totalWithTax = discountedSubtotal + taxAmount;

  const { data: profileResponse } = useQuery({
    queryKey: queryKeys.myUserProfile(),
    queryFn: () => UserServices.getMyProfile(),
    staleTime: 1000 * 60 * 2,
  });

  const savedAddresses = (profileResponse?.data?.addresses || []) as Array<any>;

  const form = useForm<CreateOrderPayload>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      providerId: providerId || "",
      deliveryAddress: "",
      addressId: undefined,
      paymentMethod: PaymentMethod.STRIPE,
      couponCode: undefined,
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
    form.setValue("paymentMethod", paymentMethod);
    form.setValue(
      "items",
      items.map((item) => ({ mealId: item.meal.id, quantity: item.quantity }))
    );
  }, [form, isInitialized, items, paymentMethod, providerId]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const draftDeliveryAddress = getReorderDraftDeliveryAddress();
    const currentAddress = form.getValues("deliveryAddress");

    if (draftDeliveryAddress && !currentAddress) {
      form.setValue("deliveryAddress", draftDeliveryAddress);
    }

    if (savedAddresses.length > 0) {
      const defaultAddress = savedAddresses.find((address) => address.isDefault) || savedAddresses[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        form.setValue("addressId", defaultAddress.id);
      }
    }
  }, [form, isInitialized, savedAddresses]);

  useEffect(() => {
    if (!couponPreview || !appliedCouponCode) {
      return;
    }

    if (couponCode.trim().toUpperCase() !== appliedCouponCode) {
      setCouponPreview(null);
      setAppliedCouponCode(null);
    }
  }, [appliedCouponCode, couponCode, couponPreview]);

  useEffect(() => {
    if (!providerId || items.length === 0) {
      setCouponPreview(null);
      setAppliedCouponCode(null);
    }
  }, [items, providerId]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Enter a coupon code first.");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const response = await OrderServices.previewCoupon({
        providerId: providerId || "",
        couponCode: couponCode.trim(),
        items: items.map((item) => ({ mealId: item.meal.id, quantity: item.quantity })),
      });

      setCouponPreview(response.data || null);
      setAppliedCouponCode(couponCode.trim().toUpperCase());
      toast.success(`Coupon ${couponCode.trim().toUpperCase()} applied.`);
    } catch (error: any) {
      setCouponPreview(null);
      setAppliedCouponCode(null);
      toast.error(error?.response?.data?.message || "Failed to apply coupon.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const onSubmit = async (data: CreateOrderPayload) => {
    setIsSubmitting(true);
    try {
      const orderPayload = {
        ...data,
        providerId: providerId || data.providerId,
        paymentMethod,
        addressId: selectedAddressId || undefined,
        couponCode: appliedCouponCode || undefined,
      };

      // Create initial order in database (Status: PLACED, Payment: PENDING)
      const response = await OrderServices.createOrder(orderPayload);
      if (response.success && response.data?.id) {
        setPlacedOrderId(response.data.id);
        if (paymentMethod === PaymentMethod.COD) {
          clearCart();
          clearReorderDraftDeliveryAddress();
          toast.success("Order placed! Pay cash on delivery.");
          router.push("/customer/orders");
          return;
        }

        toast.success("Order confirmed. Processing secure payment...");

        const paymentRes = await PaymentServices.createPaymentIntent(response.data.id);

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
                      <div className="space-y-2">
                        <FormLabel className="text-slate-700 font-bold">Saved Address</FormLabel>
                        <Select
                          value={selectedAddressId || "manual"}
                          onValueChange={(value) => {
                            if (value === "manual") {
                              setSelectedAddressId("");
                              form.setValue("addressId", undefined);
                              return;
                            }

                            setSelectedAddressId(value);
                            form.setValue("addressId", value);
                          }}
                        >
                          <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50">
                            <SelectValue placeholder="Choose a saved address or manual entry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Use manual address entry</SelectItem>
                            {savedAddresses.map((address) => (
                              <SelectItem key={address.id} value={address.id}>
                                {address.label} {address.isDefault ? "(Default)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

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
                                disabled={Boolean(selectedAddressId)}
                                {...field} 
                              />
                            </FormControl>
                            {selectedAddressId ? (
                              <p className="text-xs text-slate-500">Using selected saved address for this order.</p>
                            ) : null}
                            <FormMessage className="text-pink-500" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <FormLabel className="text-slate-700 font-bold">Payment Method</FormLabel>
                          <Select
                            value={paymentMethod}
                            onValueChange={(value) => {
                              const nextMethod = value as PaymentMethod;
                              setPaymentMethod(nextMethod);
                              form.setValue("paymentMethod", nextMethod);
                            }}
                          >
                            <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={PaymentMethod.STRIPE}>Card Payment (Stripe)</SelectItem>
                              <SelectItem value={PaymentMethod.COD}>Cash on Delivery</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <FormLabel className="text-slate-700 font-bold">Coupon Code</FormLabel>
                          <div className="flex gap-2">
                            <Input
                              value={couponCode}
                              onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                              placeholder="e.g. FOOD10"
                              className="rounded-2xl"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={applyCoupon}
                              disabled={isApplyingCoupon}
                            >
                              {isApplyingCoupon ? "Applying..." : "Apply"}
                            </Button>
                          </div>
                        </div>
                      </div>

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
                            {paymentMethod === PaymentMethod.COD ? "Place COD Order" : "Proceed to Payment"}
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
                  {discountAmount > 0 ? (
                    <div className="flex justify-between text-emerald-300 font-medium">
                      <span>Coupon Discount</span>
                      <span>- ${discountAmount.toFixed(2)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-slate-300 font-medium">
                    <span>Tax & Fees (10%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
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
                {couponPreview?.coupon?.code ? (
                  <p className="text-xs text-emerald-300">Coupon applied: {couponPreview.coupon.code}</p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
