export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function formatDateEU(date: string): string {
  const [y, m, d] = date.split('-')
  return `${d}.${m}.${y}`
}