export const ORDER_STATUSES = [
  'PURCHASED',
  'SHIPPED_TO_VIETNAM',
  'ARRIVED_IN_VIETNAM',
  'OUT_FOR_DELIVERY',
  'COMPLETED'
]

export function isValidOrderStatus(status) {
  return ORDER_STATUSES.includes(status)
}
