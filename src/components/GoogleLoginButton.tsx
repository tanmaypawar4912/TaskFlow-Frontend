import { useEffect, useRef, useState } from 'react';
import { Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, string | number | boolean>) => void;
        }
      };
    };
  }
}
const clientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID as
  | string
  | undefined;

export default function GoogleLoginButton() {
  const { googleLogin } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(Boolean(window.google));
  const [error, setError] = useState('');

  useEffect(() => {
    if (window.google) { setReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client'; script.async = true; script.defer = true;
    const handle = () => setReady(Boolean(window.google));
    script.addEventListener('load', handle); document.head.appendChild(script);
    return () => script.removeEventListener('load', handle);
  }, []);

  useEffect(() => {
    if (!clientId || !ready || !window.google || !ref.current) return;
    ref.current.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        setError('');
        try { await googleLogin(credential); }
        catch (e) { setError(e instanceof Error ? e.message : 'Google sign-in failed'); }
      },
    });
    window.google.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'large', width: 420, text: 'continue_with', shape: 'rectangular' });
  }, [googleLogin, ready]);

  if (!clientId) return <div className="google-stack">
    <button type="button" className="google-fallback" onClick={() => setError('Add VITE_GOOGLE_CLIENT_ID and enable POST /api/auth/google on the backend for real Google sign-in.')}><Chrome size={18} /> Continue with Google</button>
    {error && <p className="form-error">{error}</p>}
  </div>;
  if (!ready) return <div className="google-loading">Loading Google sign-in…</div>;
  return <div className="google-stack"><div className="google-button-wrap" ref={ref} />{error && <p className="form-error">{error}</p>}</div>;
}
