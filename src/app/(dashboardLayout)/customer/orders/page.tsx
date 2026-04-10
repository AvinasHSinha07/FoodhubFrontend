"use client";

import { useEffect, useState } from "react";
import { OrderServices } from "@/services/order.services";
import { IOrder, IOrderItem } from "@/types/order.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ReviewModal } from "@/components/modules/Customer/ReviewModal";
import { Star } from "lucide-react";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<IOrderItem | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await OrderServices.getCustomerOrders();
        setOrders(response.data || []);
      } catch (error) {
        toast.error("Failed to load your orders.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleOpenReview = (orderId: string, item: IOrderItem) => {
    setSelectedOrderId(orderId);
    setSelectedItem(item);
    setIsReviewOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLACED": return "bg-blue-100 text-blue-800";
      case "PREPARING": return "bg-yellow-100 text-yellow-800";
      case "READY": return "bg-orange-100 text-orange-800";
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-gray-500">View and track your previous food orders.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-20 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700">No Orders Found</h2>
          <p className="text-gray-500 mt-2">You haven't placed any orders yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gray-50/50">
                <div>
                  <CardTitle className="text-lg">
                    Order from {order.provider?.restaurantName || "Restaurant"}
                  </CardTitle>
                  <CardDescription className="text-xs pt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={getStatusColor(order.orderStatus)}>
                    {order.orderStatus}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1 uppercase font-medium">
                    {order.paymentStatus}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {order.orderItems?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-3 items-center">
                          <span className="font-medium px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {item.quantity}x
                          </span>
                          <span className="font-medium">{item.meal?.title || "Unknown Meal"}</span>       
                        </div>
                        {order.orderStatus === "DELIVERED" && (
                          <div className="pl-12">
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="h-6 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-2"
                               onClick={() => handleOpenReview(order.id, item)}
                             >
                                <Star className="w-3 h-3 mr-1" /> Leave Review
                             </Button>
                          </div>
                        )}
                      </div>
                      <span className="text-gray-600 self-start">${item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center font-semibold pt-1">
                    <span>Total Paid</span>
                    <span>${order.totalPrice.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-dashed">
                    <span className="font-medium">Delivery to:</span> {order.deliveryAddress}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <ReviewModal 
        isOpen={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)} 
        orderId={selectedOrderId} 
        orderItem={selectedItem} 
      />
    </div>
  );
}
