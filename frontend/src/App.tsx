import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import TechBackground from './components/TechBackground'
import ProtectedRoute from './components/ProtectedRoute'
import { useEffects } from './context/EffectsContext'
import Home from './pages/Home'
import Guide from './pages/Guide'
import ApiDocs from './pages/ApiDocs'
import Login from './pages/Login'
import Register from './pages/Register'
import Practice from './pages/Practice'
import ExamEditor from './pages/ExamEditor'
import ExamTake from './pages/ExamTake'
import ExamResult from './pages/ExamResult'
import History from './pages/History'
import AttemptDetailPage from './pages/AttemptDetailPage'
import NotFound from './pages/NotFound'

export default function App() {
  const location = useLocation()
  const { effectsEnabled } = useEffects()
  // Trang làm bài chạy toàn màn hình, không hiện header/footer
  const fullscreen = /^\/exam\/\d+\/take/.test(location.pathname)

  return (
    <div className={`min-h-screen flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-300 ${effectsEnabled ? '' : 'exam-effects-off'}`}>
      <ScrollToTop />
      {!fullscreen && effectsEnabled && <TechBackground />}
      {!fullscreen && <Header />}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/practice"
              element={
                <ProtectedRoute>
                  <Practice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <ExamEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/:id/edit"
              element={
                <ProtectedRoute>
                  <ExamEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/:id/take"
              element={
                <ProtectedRoute>
                  <ExamTake />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/:id/result"
              element={
                <ProtectedRoute>
                  <ExamResult />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history/:id"
              element={
                <ProtectedRoute>
                  <AttemptDetailPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      {!fullscreen && <Footer />}
    </div>
  )
}
