export const ORDER_STATUSES = [
  'PURCHASED',
  'SHIPPED_TO_VIETNAM',
  'ARRIVED_IN_VIETNAM',
  'OUT_FOR_DELIVERY',
  'COMPLETED'
]

export const ORDER_STATUS_LABELS = {
  PURCHASED: 'Đã mua',
  SHIPPED_TO_VIETNAM: 'Đã gửi vận chuyển',
  ARRIVED_IN_VIETNAM: 'Đã đến Việt Nam',
  OUT_FOR_DELIVERY: 'Đang trên đường giao',
  COMPLETED: 'Hoàn thành'
}

export const statusLabel = status => ORDER_STATUS_LABELS[status] || status
export const statusIndex = status => ORDER_STATUSES.indexOf(status)
