// Ethiopian Calendar Utility
// Converts Gregorian dates to Ethiopian calendar for UI display
// Database always stores Gregorian dates

// Ethiopian month names
export const ETH_MONTHS_EN = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas',
  'Tir', 'Yekatit', 'Megabit', 'Miazia',
  'Ginbot', 'Senie', 'Hamle', 'Nehase', 'Pagume'
]

export const ETH_MONTHS_AM = [
  'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ',
  'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዚያ',
  'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'
]

export const ETH_DAYS_EN = ['Ehud', 'Senyo', 'Maksegno', 'Rob', 'Hamus', 'Arb', 'Kidame']
export const ETH_DAYS_AM = ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ']

export interface EthiopianDate {
  year: number
  month: number
  day: number
}

/**
 * Convert Gregorian to Ethiopian date
 * Uses the Ethiopian calendar algorithm
 */
export function toEthiopianDate(gYear: number, gMonth: number, gDay: number): EthiopianDate {
  // Julian Day Number from Gregorian
  const jdn = gregorianToJDN(gYear, gMonth, gDay)
  return jdnToEthiopian(jdn)
}

function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  return day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
}

function jdnToEthiopian(jdn: number): EthiopianDate {
  const r = (jdn - 1723856) % 1461
  const n = r % 365 + 365 * Math.floor(r / 1460)
  const year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460)
  const month = Math.floor(n / 30) + 1
  const day = n % 30 + 1
  return { year, month, day }
}

/**
 * Convert a JS Date or date string to Ethiopian date
 */
export function dateToEthiopian(date: Date | string): EthiopianDate {
  const d = typeof date === 'string' ? new Date(date) : date
  return toEthiopianDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

/**
 * Format a Gregorian date as Ethiopian calendar string
 * @param date - JS Date or ISO string
 * @param lang - 'en' or 'am'
 * @param includeYear - whether to include year
 */
export function formatEthDate(
  date: Date | string,
  lang: 'en' | 'am' = 'en',
  includeYear = true
): string {
  const eth = dateToEthiopian(date)
  const months = lang === 'am' ? ETH_MONTHS_AM : ETH_MONTHS_EN
  const monthName = months[eth.month - 1] ?? ''

  if (includeYear) {
    if (lang === 'am') return `${eth.day} ${monthName} ${eth.year} ዓ.ም`
    return `${eth.day} ${monthName} ${eth.year} E.C.`
  }
  return `${eth.day} ${monthName}`
}

/**
 * Format Ethiopian date short (e.g. "12/03/2016")
 */
export function formatEthDateShort(date: Date | string): string {
  const eth = dateToEthiopian(date)
  return `${String(eth.day).padStart(2, '0')}/${String(eth.month).padStart(2, '0')}/${eth.year}`
}

/**
 * Get today's Ethiopian date
 */
export function todayEthiopian(): EthiopianDate {
  return dateToEthiopian(new Date())
}

/**
 * Check if two dates are the same Ethiopian day
 */
export function isSameEthDay(date1: Date | string, date2: Date | string): boolean {
  const e1 = dateToEthiopian(date1)
  const e2 = dateToEthiopian(date2)
  return e1.year === e2.year && e1.month === e2.month && e1.day === e2.day
}
