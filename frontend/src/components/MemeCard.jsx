import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const MemeCard = ({ meme, onClick }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 500) + 10);

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, scale: 0.9 },
        show: { opacity: 1, scale: 1 }
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-800 border border-slate-700/50 hover:border-purple-500/50 transition-colors shadow-lg hover:shadow-2xl hover:shadow-purple-900/30 flex flex-col h-full"
    >
      <div className="aspect-[4/5] w-full overflow-hidden bg-slate-900 relative">
        <img 
          src={meme.url} 
          alt={meme.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
        
        <button 
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/60 backdrop-blur hover:bg-slate-900 transition-colors z-10 border border-slate-700"
        >
          <Heart 
            size={18} 
            className={`transition-colors ${liked ? 'fill-pink-500 text-pink-500' : 'text-slate-300 group-hover:text-pink-400'}`} 
          />
        </button>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
        <h3 className="font-bold text-sm text-slate-100 line-clamp-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all drop-shadow-md">
          {meme.name}
        </h3>
        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity delay-75">
          <Heart size={12} className={liked ? 'fill-pink-500 text-pink-500' : ''} />
          <span>{likesCount.toLocaleString()} favorites</span>
        </div>
      </div>
    </motion.div>
  );
};

export default MemeCard;
