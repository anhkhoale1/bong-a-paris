export const formatDate = value => value
  ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  : '—'

export const formatMonth = value => {
  const [year, month] = value.split('-')
  return `Tháng ${Number(month)}/${year}`
}
