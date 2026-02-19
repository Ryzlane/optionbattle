import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CollaborationProvider } from './contexts/CollaborationContext.jsx';
import { ArenaProvider } from './contexts/ArenaContext.jsx';
import { SoundProvider } from './contexts/SoundContext.jsx';
import { Toaster } from 'sonner';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CollaborationProvider>
            <ArenaProvider>
              <SoundProvider>
                <App />
                <Toaster position="top-right" richColors closeButton />
              </SoundProvider>
            </ArenaProvider>
          </CollaborationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
