export const formatDate = (iso: string): string => {
  const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z')
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const isExpired = (iso: string): boolean => {
  const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z')
  return d.getTime() < Date.now()
}
