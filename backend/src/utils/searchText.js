function stripVietnameseDiacritics(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

export function normalizeSearchText(value) {
  return stripVietnameseDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function matchesSearchText(source, query) {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true

  const normalizedSource = normalizeSearchText(source)
  const words = normalizedSource.split(/\s+/).filter(Boolean)
  const compact = words.join('')
  const initials = words.map(word => word[0]).join('')

  return normalizedQuery.split(/\s+/).every(token => (
    normalizedSource.includes(token)
    || compact.includes(token)
    || initials.includes(token)
    || words.some(word => word.startsWith(token))
  ))
}
