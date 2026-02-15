import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CollaborationProvider } from './contexts/CollaborationContext.jsx';
import { SoundProvider } from './contexts/SoundContext.jsx';
import { Toaster } from 'sonner';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CollaborationProvider>
          <SoundProvider>
            <App />
            <Toaster position="top-right" richColors />
          </SoundProvider>
        </CollaborationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
