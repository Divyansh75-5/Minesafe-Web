import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <header className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l9 4v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V6l9-4z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white">MineSafe 26041</span>
          </div>
          <div className="flex gap-3">
            <Link to="/auth/login" className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition">
              Admin Login
            </Link>
            <Link to="/verify" className="px-4 py-2 bg-white text-primary-900 rounded-lg font-medium hover:bg-primary-50 transition">
              Verify Certificate
            </Link>
          </div>
        </header>

        <main className="text-center">
          <span className="inline-block px-3 py-1 bg-white/10 text-primary-200 rounded-full text-xs font-medium mb-4">
            SIH 2026 · Problem Statement 26041
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            AR-Based Vocational Safety Training
          </h1>
          <p className="text-lg text-primary-200 max-w-2xl mx-auto mb-8">
            Hands-on Augmented Reality training for fire, explosion and gas
            safety in Jharkhand's mining &amp; manufacturing sector.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <span className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">🔥 Fire &amp; Explosion</span>
            <span className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">☁️ Gas Leak / Confined Space</span>
            <span className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">📱 Offline Support</span>
            <span className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">🌐 Hindi + Santali</span>
          </div>
        </main>
      </div>
    </div>
  );
}