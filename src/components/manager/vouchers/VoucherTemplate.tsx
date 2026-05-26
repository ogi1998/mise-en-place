import type { Voucher } from '@/services/manager/vouchers/types'

type Props = {
  voucher: Voucher
  restaurantName: string
  logoUrl?: string | null
}

function formatVoucherType(voucher: Voucher): string {
  switch (voucher.type) {
    case 'value': return `€${voucher.amount} Gift Voucher`
    case 'experience_menu': return `${voucher.courses}-Course Tasting Menu`
    case 'wine_pairing': return 'Wine Pairing'
    case 'hotel_addon': return 'Hotel Accommodation'
  }
}

function formatVoucherSubdetails(voucher: Voucher): string[] {
  const lines: string[] = []
  if (voucher.type === 'experience_menu' && voucher.hotel_addon) {
    lines.push('Includes hotel accommodation')
  }
  if (voucher.type === 'wine_pairing' && voucher.wine_guests) {
    lines.push(`For ${voucher.wine_guests} guest${voucher.wine_guests > 1 ? 's' : ''}`)
  }
  return lines
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('sl-SI', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function VoucherTemplate({ voucher, restaurantName }: Props) {
  const recipientName = voucher.recipient_name || voucher.buyer_name
  const subdetails = formatVoucherSubdetails(voucher)

  return (
    <div
      id="voucher-print-area"
      style={{
        width: '593px',
        height: '420px',
        backgroundColor: '#1a1a18',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'DM Sans', -apple-system, sans-serif",
        flexShrink: 0,
      }}
    >
      {/* Outer border frame */}
      <div style={{
        position: 'absolute',
        inset: '12px',
        border: '1px solid rgba(201,169,110,0.35)',
        pointerEvents: 'none',
      }} />

      {/* Corner accents — top-left */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', width: '20px', height: '20px', borderTop: '2px solid #c9a96e', borderLeft: '2px solid #c9a96e' }} />
      {/* top-right */}
      <div style={{ position: 'absolute', top: '12px', right: '12px', width: '20px', height: '20px', borderTop: '2px solid #c9a96e', borderRight: '2px solid #c9a96e' }} />
      {/* bottom-left */}
      <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '20px', height: '20px', borderBottom: '2px solid #c9a96e', borderLeft: '2px solid #c9a96e' }} />
      {/* bottom-right */}
      <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '20px', height: '20px', borderBottom: '2px solid #c9a96e', borderRight: '2px solid #c9a96e' }} />

      {/* Subtle diagonal watermark lines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(201,169,110,0.025) 40px, rgba(201,169,110,0.025) 41px)',
        pointerEvents: 'none',
      }} />

      {/* Main content */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 40px',
      }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <p style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '21px',
            fontWeight: 500,
            color: '#f5f0e8',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
            margin: 0,
          }}>
            {restaurantName}
          </p>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '8.5px', color: '#c9a96e', letterSpacing: '0.22em', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>
              Darilni Bon
            </p>
            <p style={{ fontSize: '8.5px', color: 'rgba(245,240,232,0.35)', letterSpacing: '0.22em', fontWeight: 500, textTransform: 'uppercase', marginTop: '2px', marginBottom: 0 }}>
              Gift Voucher
            </p>
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: '1px', backgroundColor: 'rgba(201,169,110,0.28)', margin: '18px 0' }} />

        {/* ── Body ── */}
        <div style={{ display: 'flex', gap: '32px', flex: 1, minHeight: 0 }}>

          {/* Left: recipient + dedication */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '8px',
              color: 'rgba(245,240,232,0.3)',
              letterSpacing: '0.18em',
              fontWeight: 600,
              textTransform: 'uppercase',
              marginBottom: '8px',
              margin: '0 0 8px 0',
            }}>
              Za / For
            </p>
            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '28px',
              fontWeight: 500,
              color: '#f5f0e8',
              letterSpacing: '-0.01em',
              lineHeight: 1.15,
              margin: '0 0 12px 0',
            }}>
              {recipientName}
            </p>
            {voucher.dedication ? (
              <p style={{
                fontSize: '12px',
                color: 'rgba(245,240,232,0.5)',
                fontStyle: 'italic',
                lineHeight: 1.65,
                margin: 0,
                maxWidth: '260px',
              }}>
                &ldquo;{voucher.dedication}&rdquo;
              </p>
            ) : null}
          </div>

          {/* Vertical divider */}
          <div style={{ width: '1px', backgroundColor: 'rgba(201,169,110,0.18)', flexShrink: 0 }} />

          {/* Right: type + expiry */}
          <div style={{ width: '175px', flexShrink: 0 }}>
            <p style={{
              fontSize: '8px',
              color: '#c9a96e',
              letterSpacing: '0.18em',
              fontWeight: 700,
              textTransform: 'uppercase',
              margin: '0 0 8px 0',
            }}>
              Vrednost / Value
            </p>
            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '16px',
              fontWeight: 500,
              color: '#f5f0e8',
              lineHeight: 1.3,
              margin: '0 0 6px 0',
            }}>
              {formatVoucherType(voucher)}
            </p>
            {subdetails.map((line, i) => (
              <p key={i} style={{ fontSize: '11px', color: 'rgba(245,240,232,0.5)', margin: '0 0 3px 0' }}>
                {line}
              </p>
            ))}

            <div style={{ height: '1px', backgroundColor: 'rgba(201,169,110,0.2)', margin: '14px 0' }} />

            <p style={{
              fontSize: '8px',
              color: 'rgba(245,240,232,0.3)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              margin: '0 0 5px 0',
            }}>
              Veljavno do / Valid until
            </p>
            <p style={{ fontSize: '13px', color: '#f5f0e8', margin: 0 }}>
              {voucher.expires_at ? formatDate(voucher.expires_at) : (
                <span style={{ color: 'rgba(245,240,232,0.3)', fontStyle: 'italic', fontSize: '12px' }}>Upon activation</span>
              )}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: '1px', backgroundColor: 'rgba(201,169,110,0.28)', margin: '18px 0' }} />

        {/* ── Footer: code ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <p style={{
              fontSize: '8px',
              color: 'rgba(245,240,232,0.3)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              Koda / Code
            </p>
            <p style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: '20px',
              fontWeight: 600,
              color: '#c9a96e',
              letterSpacing: '0.04em',
              margin: 0,
            }}>
              {voucher.code}
            </p>
          </div>
          <p style={{
            fontSize: '8px',
            color: 'rgba(245,240,232,0.18)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: 0,
            textAlign: 'right',
          }}>
            Brez delne unovčitve<br />No partial redemption
          </p>
        </div>

      </div>
    </div>
  )
}
