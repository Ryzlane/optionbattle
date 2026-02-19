import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import BattlePage from './pages/BattlePage';
import JoinBattlePage from './pages/JoinBattlePage';
import ArenaPage from './pages/ArenaPage';
import JoinArenaPage from './pages/JoinArenaPage';
import AcceptInvitationPage from './pages/AcceptInvitationPage';

// Route protégée
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-battle-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

// Route publique (redirige si déjà connecté)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-battle-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, vérifier s'il y a un token en attente
  if (user) {
    const pendingInvitationToken = sessionStorage.getItem('pendingInvitationToken');
    if (pendingInvitationToken) {
      return <Navigate to={`/arena/invitations/accept/${pendingInvitationToken}`} />;
    }
    const pendingArenaToken = sessionStorage.getItem('pendingArenaToken');
    if (pendingArenaToken) {
      return <Navigate to={`/arena/join/${pendingArenaToken}`} />;
    }
    return <Navigate to="/arena" />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />

      {/* Routes protégées */}
      <Route
        path="/arena"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/battles/:id"
        element={
          <ProtectedRoute>
            <BattlePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/battle/join/:token"
        element={
          <ProtectedRoute>
            <JoinBattlePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/arena/join/:token"
        element={<JoinArenaPage />}
      />
      <Route
        path="/arena/invitations/accept/:token"
        element={<AcceptInvitationPage />}
      />
      <Route
        path="/arenas/:id"
        element={
          <ProtectedRoute>
            <ArenaPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect par défaut */}
      <Route path="/" element={<Navigate to="/arena" />} />
      <Route path="*" element={<Navigate to="/arena" />} />
    </Routes>
  );
}

export default App;
