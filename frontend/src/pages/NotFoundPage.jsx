/**
 * NotFoundPage.jsx – 404 page
 */

import { Link } from 'react-router-dom';
import { Code2, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div>
        <div
          style={{
            fontSize: '7rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #1e2d4a, #0d1527)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
            marginBottom: '1rem',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.75rem' }}>
          Page Not Found
        </h1>
        <p style={{ color: '#475569', marginBottom: '2rem' }}>
          Looks like this problem doesn't exist in our problem set.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          <Home size={15} /> Go Home
        </Link>
      </div>
    </div>
  );
}
