// LOMI SMS API Adapter
// Add your LOMI credentials to .env.local when available

const LOMI_API_KEY = process.env.LOMI_API_KEY!
const LOMI_BASE_URL = process.env.LOMI_BASE_URL || 'https://api.lomi.et/v1'
const LOMI_SENDER_ID = process.env.LOMI_SENDER_ID || 'EQUB'

export interface SMSPayload {
  to: string
  message: string
  sender?: string
}

export interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send a single SMS via LOMI API
 */
export async function sendSMS(payload: SMSPayload): Promise<SMSResult> {
  try {
    const response = await fetch(`${LOMI_BASE_URL}/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "KEY": `${LOMI_API_KEY}`
        // 'Authorization': `Bearer ${LOMI_API_KEY}`,
        // 'Accept': 'application/json',
      },
      body: JSON.stringify({
        to: payload.to,
        message: payload.message
        // sender_id: payload.sender ?? LOMI_SENDER_ID,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[LOMI SMS] Error:', response.status, errorText)
      return { success: false, error: `HTTP ${response.status}: ${errorText}` }
    }

    const data = await response.json()
    console.log(data)
    return {
      success: true,
      messageId: data.message_id ?? data.id ?? data.messageId,
    }
  } catch (error) {
    console.error('[LOMI SMS] Exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Build daily Equb contribution reminder message.
 * Sent based on group frequency (daily/weekly/monthly) to unpaid contributors.
 */
export function buildDailyReminderMessage(
  contributorName: string,
  amount: number,
  dateStr: string,
  lang: 'en' | 'am' = 'am'
): string {
  if (lang === 'am') {
    return `ደህና ዋሉ ${contributorName}፣
ይህ የዕለታዊ እቁብ ማስታወሻዎ ነው።
የክፍያ መጠን: ${amount.toLocaleString()} ብር
ቀን: ${dateStr}
ዛሬ ክፍያዎን ያስፈፅሙ።
እናመሰግናለን።`
  }
  return `Good Morning ${contributorName},
This is your daily Equb reminder.
Contribution Amount: ${amount.toLocaleString()} Birr
Date: ${dateStr}
Please make your payment today.
Thank you.`
}

/**
 * Build payout-day reminder — sent when it's the contributor's payout day.
 */
export function buildPayoutDayReminderMessage(
  contributorName: string,
  amount: number,
  lang: 'en' | 'am' = 'am'
): string {
  const totalPayout = amount
  if (lang === 'am') {
    return `ውድ ${contributorName}፣
ዛሬ የክፍያ ቀንዎ ነው!
መጠን: ${totalPayout.toLocaleString()} ብር
እናቅርበዎ!`
  }
  return `Dear ${contributorName},
Today is your payout day!
Amount: ${totalPayout.toLocaleString()} ETB
Congratulations!`
}

/**
 * Payment confirmation SMS — sent immediately after collector marks contribution as paid.
 * Includes paid days and remaining days.
 */
export function buildPaymentConfirmationMessage(
  contributorName: string,
  amount: number,
  paidDays: number,
  remainingDays: number,
  lang: 'en' | 'am' = 'am'
): string {
  if (lang === 'am') {
    return `ውድ ${contributorName}፣
ክፍያ ተቀብሏል።
ዛሬ ያደረጉት ክፍያ ተሰፍሯል።
ተከፍሏል: ${paidDays} ቀናት
ቀሪ ቀናት: ${remainingDays}
እናመሰግናለን።`
  }
  return `Dear ${contributorName},
Payment Received.
Today's contribution has been recorded.
Paid Days: ${paidDays}
Remaining Days: ${remainingDays}
Thank you.`
}

/**
 * Send daily reminder SMS
 */
export async function sendDailyReminder(
  phone: string,
  contributorName: string,
  amount: number,
  dateStr: string,
  lang: 'en' | 'am' = 'am'
): Promise<SMSResult> {
  const message = buildDailyReminderMessage(contributorName, amount, dateStr, lang)
  return sendSMS({ to: phone, message })
}

/**
 * Send payout day reminder
 */
export async function sendPayoutDayReminder(
  phone: string,
  contributorName: string,
  amount: number,
  lang: 'en' | 'am' = 'am'
): Promise<SMSResult> {
  const message = buildPayoutDayReminderMessage(contributorName, amount, lang)
  return sendSMS({ to: phone, message })
}

/**
 * Send payment confirmation SMS
 */
export async function sendPaymentConfirmation(
  phone: string,
  contributorName: string,
  amount: number,
  paidDays: number,
  remainingDays: number,
  lang: 'en' | 'am' = 'am'
): Promise<SMSResult> {
  const message = buildPaymentConfirmationMessage(contributorName, amount, paidDays, remainingDays, lang)
  return sendSMS({ to: phone, message })
}
