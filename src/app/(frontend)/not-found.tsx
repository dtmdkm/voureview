import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '60vh',
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '10px', color: '#1a4d2e' }}>404</h1>
      <h2 style={{ marginBottom: '20px' }}>Store Page Not Found</h2>
      <p style={{ color: '#64748b', marginBottom: '30px', maxWidth: '500px' }}>
        The store you are looking for might have been moved or is currently inactive.
      </p>
      <Link href="/" style={{ 
        padding: '12px 25px', 
        backgroundColor: '#eb004a', 
        color: 'white', 
        borderRadius: '8px',
        fontWeight: 'bold',
        textDecoration: 'none'
      }}>
        Return to Homepage
      </Link>
    </div>
  );
}
