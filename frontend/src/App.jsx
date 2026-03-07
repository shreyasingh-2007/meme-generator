import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Sparkles from './components/Sparkles';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-purple-500/30">
        <Sparkles />
        
        <header className="bg-slate-900/80 backdrop-blur-md p-4 shadow-xl shadow-black/20 sticky top-0 z-40 border-b border-slate-800 transition-all duration-300">
          <div className="container mx-auto flex items-center justify-between">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.location.href = '/'}
            >
              MemeGen Pro
            </motion.h1>
            <nav className="flex gap-4">
              <a href="/" className="text-slate-300 hover:text-white font-medium transition-colors hover:bg-slate-800 px-4 py-2 rounded-lg">Gallery</a>
            </nav>
          </div>
        </header>

        <main className="flex-1 container mx-auto p-4 md:p-8 relative">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/editor" element={<Editor />} />
            </Routes>
          </AnimatePresence>
        </main>
        
        <footer className="bg-slate-950 p-6 text-center text-slate-500 text-sm border-t border-slate-800">
          <p className="font-medium text-slate-400">Built with React & Express</p>
          <p className="mt-2 text-xs">Unleash your creativity</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
