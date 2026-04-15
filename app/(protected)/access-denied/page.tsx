import Link from 'next/link'
import { ShieldOff } from 'lucide-react'

export const metadata = { title: 'Access Denied — Engineering Agency OS' }

export default function AccessDeniedPage() {
  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        textAlign:      'center',
        padding:        '80px 24px',
        minHeight:      '60vh',
      }}
    >
      <div
        style={{
          width:           '52px',
          height:          '52px',
          borderRadius:    '14px',
          backgroundColor: '#FEF3F2',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          marginBottom:    '20px',
        }}
      >
        <ShieldOff size={24} style={{ color: '#B42318' }} />
      </div>

      <h1
        style={{
          fontSize:    '1.125rem',
          fontWeight:  600,
          color:       'var(--color-text-primary)',
          marginBottom: '8px',
        }}
      >
        Access Denied
      </h1>

      <p
        style={{
          fontSize:    '0.8125rem',
          color:       'var(--color-text-muted)',
          maxWidth:    '340px',
          lineHeight:  1.6,
          marginBottom: '28px',
        }}
      >
        You do not have permission to view this page. If you believe this is a mistake,
        contact your admin.
      </p>

      <Link
        href="/dashboard"
        style={{
          display:         'inline-flex',
          alignItems:      'center',
          gap:             '6px',
          padding:         '8px 18px',
          backgroundColor: 'var(--color-primary)',
          color:           '#fff',
          borderRadius:    '7px',
          fontSize:        '0.8125rem',
          fontWeight:      500,
          textDecoration:  'none',
        }}
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
