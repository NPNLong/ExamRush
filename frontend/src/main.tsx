import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { I18nProvider } from './context/I18nContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { DialogProvider } from './context/DialogContext.tsx'
import { EffectsProvider } from './context/EffectsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <EffectsProvider>
          <I18nProvider>
            <DialogProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </DialogProvider>
          </I18nProvider>
        </EffectsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
