import React, { useState, useEffect } from 'react';
import { Code, Upload, Image as ImageIcon, X, Check, Edit3 } from 'lucide-react';

/* 
  =============================================================================
  EDIT LOGO HERE IN CODE:
  Paste your Image URL (https://...), Base64 string, or raw <svg>...</svg> code 
  into the variable below!
  =============================================================================
*/
export const CUSTOM_LOGO_CODE = 'https://i.postimg.cc/h40QcJtm/Flawsome-Logo-400x200px.png'; // <--- Paste your image URL, Base64, or raw <svg> string here!

interface FlawsomeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
}

export const FlawsomeLogo: React.FC<FlawsomeLogoProps> = ({
  className = '',
  size = 'lg',
  variant = 'light',
}) => {
  const [logoInput, setLogoInput] = useState<string>('');
  const [activeLogo, setActiveLogo] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Priority 1: Check code constant CUSTOM_LOGO_CODE
    if (CUSTOM_LOGO_CODE && CUSTOM_LOGO_CODE.trim().length > 0) {
      setActiveLogo(CUSTOM_LOGO_CODE.trim());
      setLogoInput(CUSTOM_LOGO_CODE.trim());
      return;
    }

    // Priority 2: Check localStorage
    const saved = localStorage.getItem('flawsome_custom_logo_code');
    if (saved) {
      setActiveLogo(saved);
      setLogoInput(saved);
    }
  }, []);

  const handleSaveCode = () => {
    const trimmed = logoInput.trim();
    setActiveLogo(trimmed);
    if (trimmed) {
      localStorage.setItem('flawsome_custom_logo_code', trimmed);
    } else {
      localStorage.removeItem('flawsome_custom_logo_code');
    }
    setIsModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setLogoInput(result);
          setActiveLogo(result);
          localStorage.setItem('flawsome_custom_logo_code', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setLogoInput('');
    setActiveLogo('');
    localStorage.removeItem('flawsome_custom_logo_code');
  };

  const sizeClasses = {
    sm: 'w-28 h-auto',
    md: 'w-44 h-auto',
    lg: 'w-64 sm:w-80 h-auto',
    xl: 'w-80 sm:w-96 h-auto',
  }[size];

  const textColor = variant === 'light' ? 'text-white' : 'text-zinc-900';
  const subtitleColor = variant === 'light' ? 'text-purple-200/90' : 'text-purple-900/90';

  const isSvg = activeLogo.trim().startsWith('<svg');

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${sizeClasses} ${className}`}>
      {/* Logo Display or Placeholder */}
      <div className="w-full relative group flex items-center justify-center">
        {activeLogo ? (
          <div className="relative w-full flex items-center justify-center">
            {isSvg ? (
              <div
                className="w-full max-h-48 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                dangerouslySetInnerHTML={{ __html: activeLogo }}
              />
            ) : (
              <img
                src={activeLogo}
                alt="Flawsome Custom Logo"
                className="max-w-full max-h-48 object-contain mix-blend-screen"
              />
            )}

            {/* Quick Edit Overlay */}
            <div className="absolute inset-0 bg-black/75 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Code className="w-4 h-4" />
                <span>Edit Logo Code / URL</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Logo</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsModalOpen(true)}
            className="w-full aspect-[4/3] sm:aspect-square rounded-3xl border-2 border-dashed border-purple-400/40 hover:border-purple-300 bg-purple-950/20 hover:bg-purple-900/30 backdrop-blur-md flex flex-col items-center justify-center p-6 text-purple-200 transition-all cursor-pointer group-hover:scale-[1.01]"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center mb-2 text-purple-300 group-hover:scale-110 transition-transform">
              <Code className="w-6 h-6" />
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
              Click to Edit Logo Code / URL
            </p>
            <p className="text-[11px] text-purple-300/80 mt-1 font-medium">
              Paste SVG code, Image URL, or upload file
            </p>
          </div>
        )}
      </div>

      {/* Brand Title */}
      <h1
        className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.24em] uppercase ${textColor} mt-4`}
        style={{ fontFamily: "'Cinzel', Georgia, serif" }}
      >
        FLAWSOME
      </h1>

      {/* Subtitle */}
      <p
        className={`text-xl sm:text-2xl md:text-3xl font-normal ${subtitleColor} mt-1`}
        style={{ fontFamily: "'Great Vibes', 'Playfair Display', cursive, serif" }}
      >
        Flawlessly Awesome
      </p>

      {/* CODE & URL EDITOR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 text-left animate-in fade-in">
          <div className="bg-[#18181b] border border-purple-500/40 rounded-3xl max-w-xl w-full p-6 text-white space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Set Logo Code or Image Source
                </h3>
                <p className="text-xs text-zinc-400">
                  You can edit the code directly in <code className="text-purple-300 bg-purple-950/50 px-1.5 py-0.5 rounded">src/components/FlawsomeLogo.tsx</code> or paste below!
                </p>
              </div>
            </div>

            {/* Input textarea */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 block">
                Paste raw &lt;svg&gt; code, Base64, or Image URL:
              </label>
              <textarea
                value={logoInput}
                onChange={(e) => setLogoInput(e.target.value)}
                rows={6}
                placeholder="<svg xmlns=... or https://example.com/logo.png"
                className="w-full p-3 rounded-2xl bg-[#09090b] border border-zinc-700 text-xs font-mono text-purple-200 focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Option to upload local image file into code */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-800">
              <label className="cursor-pointer px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-zinc-700">
                <Upload className="w-3.5 h-3.5 text-purple-400" />
                <span>Choose Local File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCode}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Logo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};