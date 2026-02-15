import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BattlePage from './pages/BattlePage';
import JoinBattlePage from './pages/JoinBattlePage';

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

  return user ? <Navigate to="/arena" /> : children;
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

      {/* Redirect par défaut */}
      <Route path="/" element={<Navigate to="/arena" />} />
      <Route path="*" element={<Navigate to="/arena" />} />
    </Routes>
  );
}

export default App;
