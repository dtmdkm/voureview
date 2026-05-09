'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, remember }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin');
      } else {
        setError(data.message || 'Đăng nhập thất bại!');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="glass login-card">
        <div className="login-logo">
          VOUREVIEW CMS
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>
          Vui lòng đăng nhập để quản trị hệ thống
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label style={{ color: 'white' }}>Tài khoản</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Nhập username"
              className="login-input"
            />
          </div>
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label style={{ color: 'white' }}>Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="login-input"
            />
          </div>

          <div className="form-group" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setRemember(!remember)}>
            <input 
              type="checkbox" 
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#ff9f29' }}
            />
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', cursor: 'pointer', marginBottom: 0 }}>Ghi nhớ đăng nhập</label>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button 
            type="submit" 
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? 'Đang kiểm tra...' : 'Đăng nhập ngay'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top left, #1a4d2e, #0f172a);
          overflow: hidden;
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 48px;
          border-radius: 24px;
        }
        .login-logo {
          font-family: 'Outfit', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: white;
          text-align: center;
          margin-bottom: 8px;
          letter-spacing: -1px;
        }
        .login-input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        .login-input:focus {
          outline: none;
          border-color: #ff9f29;
          background: rgba(255, 255, 255, 0.1);
        }
        .login-btn {
          width: 100%;
          margin-top: 32px;
          padding: 14px;
          font-size: 1rem;
          background: #ff9f29;
          border-color: #ff9f29;
          color: #0f172a;
          font-weight: 700;
        }
        .error-msg {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          padding: 12px;
          border-radius: 8px;
          margin-top: 16px;
          font-size: 0.9rem;
          text-align: center;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </div>
  );
}
