import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SmoothScroll from './components/SmoothScroll'
import TargetCursor from './components/TargetCursor'

import Hero from './pages/Hero'
import Minds from './pages/Minds'
import MindDetail from './pages/MindDetail'
import Events from './pages/Events'
import BuildInPublic from './pages/BuildInPublic'
import BipAdmin from './pages/BipAdmin'
import NotFound from './pages/NotFound'

function App() {
  const location = useLocation()
  
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const hideNavAndFooter = location.pathname.startsWith('/minds/')
  
  return (
    <SmoothScroll>
      <TargetCursor />
      {!hideNavAndFooter && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Hero />} />
          <Route path="/minds" element={<Minds />} />
          <Route path="/minds/:slug" element={<MindDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/build-in-public" element={<BuildInPublic />} />
          <Route path="/build-in-public/secrate-genda" element={<BipAdmin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      {!hideNavAndFooter && <Footer />}
    </SmoothScroll>
  )
}

export default App
