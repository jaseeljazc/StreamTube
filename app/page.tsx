
"use client";

export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h1 style={{ marginBottom: '1rem', color: '#333' }}>
          🔐 Secure Video Streaming
        </h1>
        
        <p style={{ 
          marginBottom: '2rem', 
          color: '#666',
          fontSize: '1.1rem',
          lineHeight: '1.6'
        }}>
          A Next.js 14 prototype demonstrating secure video streaming with 
          AES-128 HLS encryption and JWT-signed key delivery.
        </p>

        <div style={{ 
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          textAlign: 'left'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1976d2' }}>Features:</h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#333' }}>
            <li>User authentication with JWT</li>
            <li>AES-128 encrypted HLS streaming</li>
            <li>Signed, time-limited key URLs</li>
            <li>Secure middleware protection</li>
            <li>HLS.js integration for cross-browser support</li>
          </ul>
        </div>

        <a 
          href="/login"
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '1.1rem',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
        >
          Access Secure Video Dashboard →
        </a>
      </div>
    </div>
  );
}
