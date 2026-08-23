import React, { useState } from 'react';
import { useTrinetraStore } from '../store/useTrinetraStore';
import { motion } from 'framer-motion';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useTrinetraStore((s) => s.login);
  const isAuthLoading = useTrinetraStore((s) => s.isAuthLoading);
  const authError = useTrinetraStore((s) => s.authError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || isAuthLoading) return;
    await login(username.trim(), password);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#07070d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      {/* Background HUD Grid lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255, 0, 64, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 64, 0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* Cyber Glow Accent */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 0, 64, 0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '420px',
          background: '#0a0a12',
          border: '1px solid #1a1a2e',
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 0, 64, 0.2)',
          padding: '32px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              background: 'rgba(255, 0, 64, 0.12)',
              border: '1px solid rgba(255, 0, 64, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ff0040',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            ⬡
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.2em', color: '#ff0040' }}>
              TRINETRA
            </div>
            <div style={{ fontSize: '9px', color: '#5a5a7a', letterSpacing: '0.15em' }}>
              CYBER SOC DEFENSE PLATFORM
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div
          style={{
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid #1a1a2e',
            fontSize: '10px',
            color: '#8a8a9a',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#00ff88',
              boxShadow: '0 0 6px rgba(0, 255, 136, 0.6)',
              display: 'block',
            }}
          />
          AUTHENTICATION GATEWAY ACTIVE
        </div>

        {/* Error Alert */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              padding: '10px 12px',
              background: 'rgba(255, 0, 64, 0.12)',
              border: '1px solid rgba(255, 0, 64, 0.4)',
              color: '#ff4d6d',
              fontSize: '11px',
              marginBottom: '16px',
              lineHeight: 1.4,
            }}
          >
            <strong>ACCESS DENIED:</strong> {authError}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '9px',
                color: '#5a5a7a',
                letterSpacing: '0.12em',
                marginBottom: '6px',
                textTransform: 'uppercase',
              }}
            >
              OPERATOR ID / USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              autoFocus
              required
              style={{
                width: '100%',
                background: '#06060a',
                border: '1px solid #1a1a2e',
                color: '#e8e8f0',
                padding: '10px 12px',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#ff0040')}
              onBlur={(e) => (e.target.style.borderColor = '#1a1a2e')}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '9px',
                color: '#5a5a7a',
                letterSpacing: '0.12em',
                marginBottom: '6px',
                textTransform: 'uppercase',
              }}
            >
              SECURITY CREDENTIAL / PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              style={{
                width: '100%',
                background: '#06060a',
                border: '1px solid #1a1a2e',
                color: '#e8e8f0',
                padding: '10px 12px',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#ff0040')}
              onBlur={(e) => (e.target.style.borderColor = '#1a1a2e')}
            />
          </div>

          <button
            type="submit"
            disabled={isAuthLoading || !username.trim() || !password.trim()}
            style={{
              width: '100%',
              background: isAuthLoading ? '#3a101a' : '#ff0040',
              border: 'none',
              color: '#ffffff',
              padding: '12px',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              letterSpacing: '0.18em',
              cursor: isAuthLoading ? 'wait' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: isAuthLoading ? 'none' : '0 0 15px rgba(255, 0, 64, 0.4)',
            }}
            onMouseEnter={(e) => {
              if (!isAuthLoading) (e.target as HTMLButtonElement).style.background = '#ff2255';
            }}
            onMouseLeave={(e) => {
              if (!isAuthLoading) (e.target as HTMLButtonElement).style.background = '#ff0040';
            }}
          >
            {isAuthLoading ? 'AUTHENTICATING...' : 'AUTHENTICATE & ENTER SOC'}
          </button>
        </form>

        {/* Footer info */}
        <div
          style={{
            marginTop: '24px',
            borderTop: '1px solid #141424',
            paddingTop: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '8px',
            color: '#3a3a5a',
            letterSpacing: '0.1em',
          }}
        >
          <span>SECURE SOC NODE</span>
          <span>FASTAPI / JWT ENCRYPTED</span>
        </div>
      </motion.div>
    </div>
  );
}
