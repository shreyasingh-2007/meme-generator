import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shuffle, Upload, Zap, Flame, Smile, Dog, Gamepad2, Film, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MemeCard from '../components/MemeCard';
import { getMemes, getRandomMeme } from '../services/api';

const CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: LayoutGrid },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'reaction', label: 'Reaction', icon: Smile },
  { id: 'animal', label: 'Animals', icon: Dog },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'movie', label: 'Movies/TV', icon: Film },
];

const CATEGORY_KEYWORDS = {
  trending: ['drake', 'boyfriend', 'winnie', 'pooh', 'change my mind', 'trade offer', 'uno'],
  reaction: ['guy', 'surprised', 'crying', 'laughing', 'disaster', 'fine', 'monkey', 'look', 'brain', 'sweating'],
  animal: ['doge', 'cheems', 'cat', 'monkey', 'pigeon', 'bird', 'seagull', 'dog', 'bear'],
  gaming: ['npc', 'among us', 'gta', 'pokemon', 'mario', 'sonic', 'san andreas', 'controller'],
  movie: ['star wars', 'anakin', 'padme', 'megamind', 'batman', 'joker', 'spiderman', 'leo', 'caprio', 'marvel', 'avengers', 'office', 'gru']
};

const Home = () => {
  const [memes, setMemes] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMemes();
  }, []);

  const fetchMemes = async () => {
    try {
      setLoading(true);
      const data = await getMemes();
      setMemes(data);
    } catch (error) {
      console.error('Error fetching memes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomMeme = async () => {
    try {
      const data = await getRandomMeme();
      navigate('/editor', { state: { meme: data } });
    } catch (error) {
      console.error('Error fetching random meme:', error);
    }
  };

  const filteredMemes = memes.filter(meme => {
    const matchesSearch = meme.name.toLowerCase().includes(search.toLowerCase());
    
    if (activeCategory === 'all') return matchesSearch;
    
    const keywords = CATEGORY_KEYWORDS[activeCategory] || [];
    const matchesCategory = keywords.some(keyword => 
      meme.name.toLowerCase().includes(keyword)
    );
    
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
    >
      <div className="text-center space-y-4 mb-12">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-medium text-sm mb-4"
        >
          <Zap size={16} className="text-pink-500" /> Voted #1 Meme Creator
        </motion.div>
        <h2 className="text-5xl md:text-7xl font-black tracking-tight flex flex-col items-center justify-center">
          <span className="text-white">Create Memes</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">at Warp Speed</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">Browse thousands of trending templates or upload your own image to instantly generate hilarious memes.</p>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-4 bg-slate-800/80 backdrop-blur border border-slate-700 p-3 rounded-2xl shadow-2xl shadow-black/50"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search templates (e.g., Drake, Distracted)..." 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder-slate-500 shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRandomMeme}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-4 px-6 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/40 border border-purple-500/30"
            >
              <Shuffle size={20} />
              Random 
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/editor')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-4 px-6 rounded-xl font-bold transition-all border border-slate-600 hover:border-slate-500 shadow-lg"
            >
              <Upload size={20} />
              Upload 
            </motion.button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex overflow-x-auto gap-2 py-2 px-1 custom-scrollbar w-full hide-scrollbar">
          {CATEGORIES.map(category => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-all ${
                  isActive 
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30 border-purple-400' 
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                } border`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
                {category.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-slate-800 rounded-2xl animate-pulse border border-slate-700"></div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          {filteredMemes.map(meme => (
            <MemeCard key={meme.id} meme={meme} onClick={() => navigate('/editor', { state: { meme } })} />
          ))}
        </motion.div>
      )}
      {!loading && filteredMemes.length === 0 && (
         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="text-center text-slate-400 py-20 bg-slate-800/50 rounded-3xl border border-slate-800 border-dashed"
         >
           <p className="text-xl font-medium">No templates found matching "{search}"</p>
           <p className="text-sm mt-2 text-slate-500">Try a different search term or upload your own.</p>
         </motion.div>
      )}
    </motion.div>
  );
};

export default Home;
