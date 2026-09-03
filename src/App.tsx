import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import SplashScreen from './pages/app/SplashScreen';
import LanguageScreen from './pages/app/LanguageScreen';
import LoginScreen from './pages/app/LoginScreen';
import HomeScreen from './pages/app/HomeScreen';
import ModulesScreen from './pages/app/ModulesScreen';
import FireARScreen from './pages/app/FireARScreen';
import GasARScreen from './pages/app/GasARScreen';
import AssessmentScreen from './pages/app/AssessmentScreen';
import ResultScreen from './pages/app/ResultScreen';
import CertificateScreen from './pages/app/CertificateScreen';
import CertificatesListScreen from './pages/app/CertificatesListScreen';
import ProfileScreen from './pages/app/ProfileScreen';
// Auth + Admin
import LoginPage from './pages/Auth/LoginPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import AdminOverview from './pages/Admin/Overview';
import AdminWorkers from './pages/Admin/Workers';
import AdminModules from './pages/Admin/Modules';
import AdminAnalytics from './pages/Admin/Analytics';
import AdminCertificates from './pages/Admin/Certificates';
// Verification
import VerificationPage from './pages/Verification/VerificationPage';
import CertificateDetail from './pages/Verification/CertificateDetail';

// ---- Worker app (mobile-style, driven by AppContext.screen) ----
function WorkerApp() {
  const { state } = useApp();

  const screens: Record<string, JSX.Element> = {
    splash: <SplashScreen />,
    language: <LanguageScreen />,
    login: <LoginScreen />,
    home: <HomeScreen />,
    modules: <ModulesScreen />,
    'fire-ar': <FireARScreen />,
    'gas-ar': <GasARScreen />,
    assessment: <AssessmentScreen />,
    result: <ResultScreen />,
    certificate: <CertificateScreen />,
    certificates: <CertificatesListScreen />,
    profile: <ProfileScreen />,
  };

  return screens[state.screen] || <SplashScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <Routes>
            {/* Worker mobile app */}
            <Route path="/" element={<WorkerApp />} />

            {/* Certificate verification (public) */}
            <Route path="/verify" element={<VerificationPage />} />
            <Route path="/verify/:certId" element={<CertificateDetail />} />

            {/* Admin authentication + dashboard */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="workers" element={<AdminWorkers />} />
              <Route path="modules" element={<AdminModules />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="certificates" element={<AdminCertificates />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
