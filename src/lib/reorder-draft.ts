const REORDER_DELIVERY_ADDRESS_KEY = "foodhub_reorder_delivery_address";

export const setReorderDraftDeliveryAddress = (deliveryAddress: string) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(REORDER_DELIVERY_ADDRESS_KEY, deliveryAddress);
};

export const getReorderDraftDeliveryAddress = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(REORDER_DELIVERY_ADDRESS_KEY) || "";
};

export const clearReorderDraftDeliveryAddress = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(REORDER_DELIVERY_ADDRESS_KEY);
};
