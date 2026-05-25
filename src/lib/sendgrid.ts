import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

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

  await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
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
