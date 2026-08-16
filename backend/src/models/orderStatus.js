export const ORDER_STATUSES = [
  'PENDING_PURCHASE',
  'PURCHASED',
  'SHIPPED',
  'COMPLETED'
]

export function isValidOrderStatus(status) {
  return ORDER_STATUSES.includes(status)
}
