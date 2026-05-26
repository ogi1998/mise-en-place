import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

// ─── Voucher helpers ──────────────────────────────────────────────────────────

function voucherHeaderHtml(restaurantName: string, code: string, typeLabel: string, expiresAt?: string) {
  return `
    <div style="background:#1a1a18;padding:36px 32px;text-align:center;border-radius:12px 12px 0 0;">
      <p style="color:#c9a96e;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 6px 0;">Gift Voucher</p>
      <p style="color:#f5f0e8;font-size:20px;font-weight:normal;margin:0 0 24px 0;">${restaurantName}</p>
      <div style="border:1px solid #c9a96e;border-radius:8px;padding:16px 32px;margin:0 auto 16px;max-width:260px;">
        <p style="color:#a09880;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 6px 0;">Voucher Code</p>
        <p style="color:#c9a96e;font-size:26px;font-family:monospace;font-weight:bold;margin:0;letter-spacing:0.05em;">${code}</p>
      </div>
      <p style="color:#f5f0e8;font-size:14px;margin:0 0 6px 0;">${typeLabel}</p>
      ${expiresAt ? `<p style="color:#7a7060;font-size:12px;margin:0;">Valid until ${expiresAt}</p>` : ''}
    </div>
  `
}

// ─── Voucher order confirmation ───────────────────────────────────────────────

export type VoucherOrderConfirmationData = {
  to: string
  buyerName: string
  restaurantName: string
  code: string
  typeLabel: string
  deliveryLabel: string
  bankIban?: string | null
  bankAccountHolder?: string | null
  bankBic?: string | null
  currency?: string
  amount?: number | null
}

export async function sendVoucherOrderConfirmation(data: VoucherOrderConfirmationData) {
  const { to, buyerName, restaurantName, code, typeLabel, deliveryLabel, bankIban, bankAccountHolder, bankBic, currency = 'EUR', amount } = data
  const sym = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€'
  const hasBankDetails = !!bankIban && !!bankAccountHolder

  const bankSection = hasBankDetails ? `
    <div style="background:#faf9f6;border:1px solid #e8e4dc;border-radius:8px;padding:20px;margin:24px 0;">
      <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#7a7060;margin:0 0 12px 0;">Bank Transfer Details</p>
      <table style="width:100%;border-collapse:collapse;">
        ${amount ? `<tr><td style="padding:4px 0;color:#7a7060;font-size:13px;width:130px;">Amount</td><td style="padding:4px 0;font-size:13px;font-weight:600;">${sym}${amount.toFixed(2)}</td></tr>` : ''}
        <tr><td style="padding:4px 0;color:#7a7060;font-size:13px;">Payee</td><td style="padding:4px 0;font-size:13px;font-weight:500;">${bankAccountHolder}</td></tr>
        <tr><td style="padding:4px 0;color:#7a7060;font-size:13px;">IBAN</td><td style="padding:4px 0;font-size:13px;font-family:monospace;">${bankIban}</td></tr>
        ${bankBic ? `<tr><td style="padding:4px 0;color:#7a7060;font-size:13px;">BIC/SWIFT</td><td style="padding:4px 0;font-size:13px;font-family:monospace;">${bankBic}</td></tr>` : ''}
        <tr><td style="padding:4px 0;color:#7a7060;font-size:13px;">Reference</td><td style="padding:4px 0;font-size:13px;font-family:monospace;font-weight:600;">${code}</td></tr>
      </table>
      <p style="color:#a09880;font-size:11px;margin:12px 0 0 0;">Your voucher will be activated once payment is confirmed.</p>
    </div>
  ` : `
    <div style="background:#fff8e8;border:1px solid #f0d88a;border-radius:8px;padding:16px;margin:24px 0;">
      <p style="color:#7a5c00;font-size:13px;margin:0;">We will contact you at <strong>${to}</strong> with payment instructions shortly.</p>
    </div>
  `

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `Gift voucher order received — ${restaurantName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a18;">
        <div style="background:#1a1a18;padding:28px 32px;text-align:center;border-radius:12px 12px 0 0;">
          <p style="color:#c9a96e;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 6px 0;">Gift Voucher</p>
          <p style="color:#f5f0e8;font-size:20px;font-weight:normal;margin:0;">Order Received</p>
        </div>
        <div style="background:white;padding:28px 32px;border-radius:0 0 12px 12px;border:1px solid #e8e4dc;border-top:none;">
          <p style="font-size:15px;margin:0 0 4px 0;">Hi ${buyerName},</p>
          <p style="color:#7a7060;font-size:13px;margin:0 0 24px 0;">Your gift voucher order at <strong>${restaurantName}</strong> has been received.</p>
          <div style="background:#1a1a18;border-radius:10px;padding:20px;text-align:center;margin:0 0 24px 0;">
            <p style="color:#c9a96e;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 8px 0;">Voucher Code</p>
            <p style="color:#c9a96e;font-size:26px;font-weight:bold;font-family:monospace;margin:0;">${code}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;margin:0 0 0 0;">
            <tr>
              <td style="padding:8px 0;color:#7a7060;font-size:13px;width:100px;border-bottom:1px solid #e8e4dc;">Type</td>
              <td style="padding:8px 0;font-weight:500;font-size:13px;border-bottom:1px solid #e8e4dc;">${typeLabel}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#7a7060;font-size:13px;">Delivery</td>
              <td style="padding:8px 0;font-weight:500;font-size:13px;">${deliveryLabel}</td>
            </tr>
          </table>
          ${bankSection}
          <hr style="border:none;border-top:1px solid #e8e4dc;margin:24px 0;" />
          <p style="color:#a09880;font-size:12px;margin:0;">Questions? Contact ${restaurantName} directly.</p>
        </div>
      </div>
    `,
  })
}

// ─── Voucher activation (voucher ready) ───────────────────────────────────────

export type VoucherActivationData = {
  to: string
  buyerName: string
  recipientName?: string | null
  restaurantName: string
  code: string
  typeLabel: string
  expiresAt: string
  dedication?: string | null
  deliveryType: 'digital' | 'print' | 'physical'
  deliveryAddress?: { street?: string; city?: string; postal_code?: string; country?: string } | null
}

export async function sendVoucherActivation(data: VoucherActivationData) {
  const { to, buyerName, recipientName, restaurantName, code, typeLabel, expiresAt, dedication, deliveryType, deliveryAddress } = data
  const displayName = recipientName && recipientName !== buyerName ? recipientName : buyerName

  const dedicationSection = dedication ? `
    <div style="border-top:1px solid #3a3530;margin-top:24px;padding-top:20px;">
      <p style="color:#f5f0e8;font-style:italic;font-size:13px;margin:0 0 8px 0;">"${dedication}"</p>
      <p style="color:#7a7060;font-size:12px;margin:0;">— ${buyerName}</p>
    </div>
  ` : ''

  let subject: string
  let bodyText: string
  let extraSection = ''

  if (deliveryType === 'physical') {
    const addrLine = deliveryAddress
      ? [deliveryAddress.street, deliveryAddress.city, deliveryAddress.postal_code, deliveryAddress.country].filter(Boolean).join(', ')
      : null
    subject = `Your gift voucher is on its way — ${restaurantName}`
    bodyText = `Your physical gift voucher is being prepared and will be mailed to you${addrLine ? ':' : '.'}`
    if (addrLine) {
      extraSection = `<p style="color:#1a1a18;font-size:13px;font-weight:500;margin:4px 0 16px 0;">${addrLine}</p>`
    }
  } else if (deliveryType === 'print') {
    subject = `Your gift voucher is ready to print — ${restaurantName}`
    bodyText = `Your gift voucher is ready! Print this email or save it as a PDF to use at ${restaurantName}.`
    extraSection = `
      <div style="background:#faf9f6;border:1px solid #e8e4dc;border-radius:6px;padding:12px 16px;margin:16px 0 0 0;">
        <p style="color:#7a7060;font-size:12px;margin:0;">
          <strong>To print:</strong> File → Print (or Ctrl+P / ⌘+P) · To save as PDF, select "Save as PDF" as the printer.
        </p>
      </div>
    `
  } else {
    subject = `Your gift voucher is ready — ${restaurantName}`
    bodyText = `Your gift voucher at <strong>${restaurantName}</strong> is ready to use. Present the code above when visiting us.`
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a18;">
        <div style="background:#1a1a18;padding:36px 32px;text-align:center;border-radius:12px 12px 0 0;">
          <p style="color:#c9a96e;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 6px 0;">Gift Voucher</p>
          <p style="color:#f5f0e8;font-size:20px;font-weight:normal;margin:0 0 24px 0;">${restaurantName}</p>
          <div style="border:1px solid #c9a96e;border-radius:8px;padding:16px 32px;margin:0 auto 20px auto;max-width:260px;">
            <p style="color:#a09880;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 6px 0;">Voucher Code</p>
            <p style="color:#c9a96e;font-size:26px;font-family:monospace;font-weight:bold;margin:0;letter-spacing:0.05em;">${code}</p>
          </div>
          <p style="color:#f5f0e8;font-size:14px;margin:0 0 6px 0;">${typeLabel}</p>
          <p style="color:#7a7060;font-size:12px;margin:0;">Valid until ${expiresAt}</p>
          ${dedicationSection}
        </div>
        <div style="background:white;padding:28px 32px;border-radius:0 0 12px 12px;border:1px solid #e8e4dc;border-top:none;">
          <p style="font-size:15px;margin:0 0 8px 0;">Hi ${displayName},</p>
          <p style="color:#7a7060;font-size:13px;margin:0 0 0 0;">${bodyText}</p>
          ${extraSection}
          <p style="color:#a09880;font-size:12px;margin:20px 0 0 0;">We look forward to welcoming you!</p>
        </div>
      </div>
    `,
  })
}

export type BookingConfirmationData = {
  to: string
  firstName: string
  restaurantName: string
  date: string
  slot: string
  partySize: number
  bookingNumber: string
}

export async function sendBookingConfirmation(data: BookingConfirmationData) {
  const { to, firstName, restaurantName, date, slot, partySize, bookingNumber } = data

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `Booking confirmed — ${restaurantName}`,
    text: [
      `Hi ${firstName},`,
      ``,
      `Your booking at ${restaurantName} is confirmed.`,
      ``,
      `  Date:    ${date}`,
      `  Time:    ${slot}`,
      `  Guests:  ${partySize}`,
      `  Ref:     #${bookingNumber}`,
      ``,
      `See you soon!`,
      `${restaurantName}`,
    ].join('\n'),
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a18;">
        <h2 style="font-size: 20px; margin-bottom: 4px;">Booking confirmed</h2>
        <p style="color: #7a7060; margin-top: 0;">${restaurantName}</p>
        <hr style="border: none; border-top: 1px solid #e8e4dc; margin: 24px 0;" />
        <p>Hi ${firstName},</p>
        <p>Your reservation is confirmed. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr>
            <td style="padding: 8px 0; color: #7a7060; width: 80px;">Date</td>
            <td style="padding: 8px 0; font-weight: 500;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #7a7060;">Time</td>
            <td style="padding: 8px 0; font-weight: 500;">${slot}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #7a7060;">Guests</td>
            <td style="padding: 8px 0; font-weight: 500;">${partySize}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #7a7060;">Ref</td>
            <td style="padding: 8px 0; font-weight: 500;">#${bookingNumber}</td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e8e4dc; margin: 24px 0;" />
        <p style="color: #7a7060; font-size: 14px;">See you soon!</p>
      </div>
    `,
  })
}
