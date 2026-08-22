export const ORDER_STATUSES = [
  "PENDING_PURCHASE",
  "PURCHASED",
  "SHIPPED",
  "COMPLETED",
];

export const ORDER_STATUS_LABELS = {
  PENDING_PURCHASE: "Chưa mua",
  PURCHASED: "Đã mua",
  SHIPPED: "Đã gửi vận chuyển",
  COMPLETED: "Hoàn thành",
};

export const statusLabel = (status) => ORDER_STATUS_LABELS[status] || status;
export const statusIndex = (status) => ORDER_STATUSES.indexOf(status);
