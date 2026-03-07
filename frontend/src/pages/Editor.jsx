import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload as UploadIcon, Image as ImageIcon, Type, Palette, MoveHorizontal, Sparkles as SparklesIcon, Plus, Trash2, Share2, Copy, Twitter, MessageCircle, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';
import DraggableText from '../components/DraggableText';
import { uploadImage as apiUploadImage, generateCaption } from '../services/api';

const FONTS = ['Impact', 'Anton', 'Bangers', 'Arial Black', 'Comic Sans MS'];

const Editor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const passedMeme = location.state?.meme;
  
  const [meme, setMeme] = useState(passedMeme || null);
  const [image] = useImage(meme?.url, 'anonymous');

  // Node state instead of static top/bottom text
  const [texts, setTexts] = useState([
    { id: 'top', text: '', x: 50, y: 20, fontSize: 40, fontFamily: 'Impact', fill: '#ffffff' },
    { id: 'bottom', text: '', x: 50, y: 400, fontSize: 40, fontFamily: 'Impact', fill: '#ffffff' }
  ]);
  
  const [selectedId, selectShape] = useState(null);
  
  const [uploading, setUploading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [filterSettings, setFilterSettings] = useState({
      grayscale: false,
      sepia: false,
      blur: 0,
      brightness: 0,
      contrast: 0
  });
  
  const fileInputRef = useRef(null);
  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 600, height: 600 });

  useEffect(() => {
    if (image) {
       const maxCanvasWidth = 600;
       const ratio = image.width / image.height;
       
       let canvasWidth = image.width;
       let canvasHeight = image.height;
       
       if (canvasWidth > maxCanvasWidth) {
         canvasWidth = maxCanvasWidth;
         canvasHeight = maxCanvasWidth / ratio;
       }
       
       setStageSize({ width: canvasWidth, height: canvasHeight });
       
       // Reposition default texts
       setTexts(prev => prev.map(t => {
           if (t.id === 'top') return { ...t, x: canvasWidth/2 - 100, y: 20 };
           if (t.id === 'bottom') return { ...t, x: canvasWidth/2 - 100, y: canvasHeight - 60 };
           return t;
       }));
    }
  }, [image]);

  useEffect(() => {
    if (image && imageRef.current) {
        imageRef.current.cache();
    }
  }, [image, filterSettings, stageSize]);

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.hasName('bg-image');
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  const addTextNode = () => {
    const newId = `text_${Date.now()}`;
    setTexts([...texts, {
        id: newId,
        text: 'New Text',
        x: stageSize.width / 2 - 50,
        y: stageSize.height / 2,
        fontSize: 40,
        fontFamily: 'Impact',
        fill: '#ffffff'
    }]);
    selectShape(newId);
  };

  const removeTextNode = (idToRemove) => {
    setTexts(texts.filter(t => t.id !== idToRemove));
    if (selectedId === idToRemove) selectShape(null);
  };

  const addEmojiNode = (emoji) => {
    const newId = `emoji_${Date.now()}`;
    setTexts([...texts, {
        id: newId,
        text: emoji,
        x: stageSize.width / 2,
        y: stageSize.height / 2,
        fontSize: 60,
        fontFamily: 'Arial', // Fallback for emojis
        fill: '#ffffff'
    }]);
    selectShape(newId);
  };

  const updateSelectedNode = (key, value) => {
      if (!selectedId) return;
      setTexts(texts.map(t => t.id === selectedId ? { ...t, [key]: value } : t));
  };

  const handleDownload = () => {
      if (!stageRef.current) return;
      // Deselect before downlaoding so transformer box hides
      selectShape(null);
      
      setTimeout(() => {
          const uri = stageRef.current.toDataURL();
          const link = document.createElement('a');
          link.download = `meme-${Date.now()}.png`;
          link.href = uri;
          link.click();
      }, 100);
  };

  const copyToClipboard = async () => {
    if (!stageRef.current) return;
    selectShape(null);
    setTimeout(async () => {
      try {
        const uri = stageRef.current.toDataURL();
        const blob = await (await fetch(uri)).blob();
        await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
        alert('🎨 Meme copied to clipboard!');
      } catch (err) { 
        console.error('Failed to copy', err);
        alert('Failed to copy to clipboard.');
      }
    }, 100);
  };

  const shareToTwitter = () => {
     const text = encodeURIComponent("Check out this masterpiece I made on Meme Lab! 🔥");
     window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareToWhatsApp = () => {
     const text = encodeURIComponent("Check out this masterpiece I made on Meme Lab! 🔥");
     window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const [aiError, setAiError] = useState('');

  const handleGenerateAI = async () => {
      if (!meme) return;
      try {
          setGeneratingAI(true);
          setAiError('');
          const aiText = await generateCaption(meme.name);
          
          setTexts(prev => prev.map(t => {
              if (t.id === 'top' && aiText.topText) return { ...t, text: aiText.topText.toUpperCase() };
              if (t.id === 'bottom' && aiText.bottomText) return { ...t, text: aiText.bottomText.toUpperCase() };
              return t;
          }));
      } catch (err) {
          console.error(err);
          setAiError(err.response?.data?.error || 'Failed to generate AI caption.');
      } finally {
          setGeneratingAI(false);
      }
  };

  const handleUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
          setUploading(true);
          const uploadedMeme = await apiUploadImage(file);
          setMeme({
              id: uploadedMeme.id,
              name: uploadedMeme.name,
              url: uploadedMeme.url,
              box_count: 2
          });
          // Reset text to empty on new upload
          setTexts(prev => prev.map(t => ({...t, text: ''})));
      } catch (err) {
          console.error('Failed to upload', err);
      } finally {
          setUploading(false);
      }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto"
    >
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 hover:bg-slate-800 rounded-lg w-fit"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
        Back to Gallery
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-12">
        {/* Editor Controls */}
        <div className="lg:col-span-2 bg-slate-800/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-700/50 h-fit space-y-6">
          <div className="flex flex-col gap-2 border-b border-slate-700 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                   <ImageIcon className="text-purple-400" size={24} />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white leading-tight">Meme Lab</h2>
                   <p className="text-xs text-slate-400">Click text to edit</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateAI}
                disabled={generatingAI || !meme}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${
                  generatingAI || !meme ? 'bg-slate-700 text-slate-500' : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400'
                }`}
              >
                <SparklesIcon size={16} />
                {generatingAI ? 'Thinking...' : 'AI Caption'}
              </motion.button>
            </div>
            {aiError && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="text-amber-400 text-xs font-medium bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg"
              >
                {aiError}
              </motion.div>
            )}
          </div>
          
          {selectedId ? (
             <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
               <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                 <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
                   <Type size={16} className="text-purple-400" /> Editing Selected Text
                 </span>
                 {selectedId !== 'top' && selectedId !== 'bottom' && (
                   <button onClick={() => removeTextNode(selectedId)} className="text-rose-400 hover:text-rose-300 p-1 bg-rose-500/10 rounded-md">
                     <Trash2 size={16} />
                   </button>
                 )}
               </div>

               <input 
                 type="text" 
                 value={texts.find(t => t.id === selectedId)?.text || ''}
                 onChange={(e) => updateSelectedNode('text', e.target.value)}
                 placeholder="Type caption here..." 
                 className="w-full bg-slate-900 border border-slate-600 rounded-xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-bold placeholder-slate-600 uppercase shadow-inner text-lg"
               />

               <div className="space-y-3">
                 <label className="text-sm font-semibold text-slate-300">Font Family</label>
                 <select 
                   value={texts.find(t => t.id === selectedId)?.fontFamily || 'Impact'}
                   onChange={(e) => updateSelectedNode('fontFamily', e.target.value)}
                   className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none font-bold"
                 >
                   {FONTS.map(font => (
                     <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                   ))}
                 </select>
               </div>

               <div className="space-y-3">
                 <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
                     <span className="flex justify-between w-full">
                       <span className="flex items-center gap-2"><MoveHorizontal size={14} className="text-indigo-400" /> Size</span>
                       <span className="text-indigo-400 font-bold">{Math.round(texts.find(t => t.id === selectedId)?.fontSize || 40)}px</span>
                     </span>
                 </label>
                 <input 
                   type="range" 
                   min="10" 
                   max="150" 
                   value={texts.find(t => t.id === selectedId)?.fontSize || 40}
                   onChange={(e) => updateSelectedNode('fontSize', parseInt(e.target.value))}
                   className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                 />
               </div>
               
               <div className="space-y-3">
                 <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Palette size={14} className="text-rose-400" /> Color
                 </label>
                 <div className="flex gap-3 items-center bg-slate-900/50 p-2 rounded-xl border border-slate-600/50">
                     <input 
                       type="color" 
                       value={texts.find(t => t.id === selectedId)?.fill || '#ffffff'}
                       onChange={(e) => updateSelectedNode('fill', e.target.value)}
                       className="h-10 w-16 rounded cursor-pointer border-0 bg-transparent p-0"
                     />
                     <span className="text-slate-300 font-mono tracking-wider">{texts.find(t => t.id === selectedId)?.fill?.toUpperCase()}</span>
                 </div>
               </div>
             </div>
          ) : (
             <div className="text-center py-12 px-4 bg-slate-900/30 rounded-2xl border border-slate-700 border-dashed">
                <p className="text-slate-400 font-medium">Click on a text block in the preview to edit its content and styling, or add a new one.</p>
             </div>
          )}

          <div className="pt-4 flex flex-col gap-3">
            <button 
              onClick={addTextNode}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition-all border border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
            >
              <Plus size={20} />
              Add Text Block
            </button>
            
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Add Sticker</label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                {['😂','🔥','💀','😭','🎉','💯','👀','🤡','💅','✨'].map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => addEmojiNode(emoji)}
                    className="text-2xl hover:scale-125 transition-transform p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-slate-700/50">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2"><SlidersHorizontal size={14}/> Image Filters</label>
              <div className="grid grid-cols-2 gap-3 mb-1">
                 <button onClick={() => setFilterSettings(p => ({...p, grayscale: !p.grayscale}))} className={`py-2 px-3 rounded-lg text-sm font-bold transition-colors ${filterSettings.grayscale ? 'bg-indigo-500 text-white shadow-inner' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}>Grayscale</button>
                 <button onClick={() => setFilterSettings(p => ({...p, sepia: !p.sepia}))} className={`py-2 px-3 rounded-lg text-sm font-bold transition-colors ${filterSettings.sepia ? 'bg-amber-600 text-white shadow-inner' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-amber-900/30'}`}>Vintage</button>
              </div>
              <div className="space-y-4 p-4 bg-slate-900/40 rounded-xl border border-slate-700/30">
                 <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-widest"><span>Brightness</span><span className="text-indigo-400">{Math.round(filterSettings.brightness*100)}%</span></div>
                    <input type="range" min="-1" max="1" step="0.05" value={filterSettings.brightness} onChange={(e) => setFilterSettings(p => ({...p, brightness: parseFloat(e.target.value)}))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                 </div>
                 <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-widest"><span>Contrast</span><span className="text-indigo-400">{Math.round(filterSettings.contrast)}</span></div>
                    <input type="range" min="-100" max="100" step="5" value={filterSettings.contrast} onChange={(e) => setFilterSettings(p => ({...p, contrast: parseFloat(e.target.value)}))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                 </div>
                 <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-widest"><span>Blur</span><span className="text-indigo-400">{filterSettings.blur}px</span></div>
                    <input type="range" min="0" max="40" step="1" value={filterSettings.blur} onChange={(e) => setFilterSettings(p => ({...p, blur: parseInt(e.target.value)}))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                 </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col gap-4">
            <div className="flex gap-2">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-4 px-4 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/40"
              >
                <Download size={20} />
                Download
              </motion.button>

              <div className="flex gap-2 relative group">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center bg-slate-800 border border-slate-600 hover:bg-slate-700 text-white px-4 rounded-xl shadow-lg transition-all"
                >
                  <Share2 size={20} />
                </motion.button>
                
                {/* Share Dropdown (Hover) */}
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-800 border border-slate-700 rounded-xl p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity shadow-2xl flex flex-col gap-1 z-50">
                  <button onClick={copyToClipboard} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors w-full text-left font-medium">
                    <Copy size={16} /> Copy Image
                  </button>
                  <button onClick={shareToWhatsApp} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-green-600/20 hover:text-green-400 rounded-lg transition-colors w-full text-left font-medium">
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                  <button onClick={shareToTwitter} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg transition-colors w-full text-left font-medium">
                    <Twitter size={16} /> Twitter / X
                  </button>
                </div>
              </div>
            </div>
            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleUpload}
                accept="image/*"
                className="hidden"
              />
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-4 px-6 rounded-xl font-bold transition-all shadow-lg border border-slate-600 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><UploadIcon size={20} /> Upload Custom Image</>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Canvas Preview Area */}
        <div className="lg:col-span-3 bg-slate-900/50 backdrop-blur border border-slate-700/50 p-6 sm:p-8 rounded-3xl flex items-center justify-center min-h-[500px] shadow-inner relative overflow-hidden group">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          
          {meme ? (
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
               <div className="p-2 sm:p-4 bg-white/5 rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-w-full inline-block">
                 <Stage 
                   width={stageSize.width} 
                   height={stageSize.height} 
                   ref={stageRef}
                   onMouseDown={checkDeselect}
                   onTouchStart={checkDeselect}
                   className="cursor-crosshair w-full h-auto bg-black rounded shadow object-contain"
                   style={{ 
                      width: '100%', 
                      height: 'auto', 
                      maxWidth: `${stageSize.width}px`,
                      aspectRatio: `${stageSize.width} / ${stageSize.height}`
                   }}
                 >
                   <Layer>
                      <KonvaImage 
                        ref={imageRef}
                        image={image} 
                        width={stageSize.width} 
                        height={stageSize.height}
                        name="bg-image"
                        filters={[
                           filterSettings.grayscale && Konva.Filters.Grayscale,
                           filterSettings.sepia && Konva.Filters.Sepia,
                           filterSettings.blur > 0 && Konva.Filters.Blur,
                           filterSettings.brightness !== 0 && Konva.Filters.Brighten,
                           filterSettings.contrast !== 0 && Konva.Filters.Contrast
                        ].filter(Boolean)}
                        blurRadius={filterSettings.blur}
                        brightness={filterSettings.brightness}
                        contrast={filterSettings.contrast}
                      />
                      
                      {texts.map((textNode) => (
                        <DraggableText
                          key={textNode.id}
                          shapeProps={textNode}
                          isSelected={textNode.id === selectedId}
                          onSelect={() => selectShape(textNode.id)}
                          onChange={(newAttrs) => {
                            const nodes = texts.slice();
                            const idx = nodes.findIndex(n => n.id === textNode.id);
                            nodes[idx] = newAttrs;
                            setTexts(nodes);
                          }}
                          onDelete={() => removeTextNode(textNode.id)}
                        />
                      ))}
                   </Layer>
                 </Stage>
               </div>
               
               <motion.div 
                 initial={{ y: -20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.5 }}
                 className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur text-xs px-4 py-2 rounded-full text-purple-400 border border-purple-500/30 font-bold tracking-widest uppercase shadow-lg shadow-black/50 pointer-events-none"
               >
                 Live Preview
               </motion.div>
            </div>
          ) : (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-center p-12 flex flex-col items-center justify-center relative z-10"
            >
               <motion.div 
                 animate={{ y: [0, -10, 0] }}
                 transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                 className="w-32 h-32 bg-slate-800/80 rounded-full flex items-center justify-center mb-8 border border-slate-700 shadow-xl"
               >
                  <ImageIcon size={48} className="text-slate-500" />
               </motion.div>
               <h3 className="text-3xl font-black text-slate-300 mb-4 tracking-tight">No Canvas Selected</h3>
               <p className="text-slate-500 max-w-sm text-lg mb-8 leading-relaxed">Choose a template from our trending gallery or upload your own image to get started.</p>
               <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/')}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-purple-900/40 border border-purple-500/50"
               >
                  Browse Gallery →
               </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Editor;
