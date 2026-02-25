import React, { useState, useRef, useEffect } from 'react';

const GreetingsGenerator: React.FC = () => {
    const [logoLeft, setLogoLeft] = useState('[ libre');
    const [logoIcon, setLogoIcon] = useState('@');
    const [logoRight, setLogoRight] = useState('toi ]');
    const [hashtag, setHashtag] = useState('#2026');
    const [footer, setFooter] = useState('causecommune.fm');
    const [layout, setLayout] = useState<'layout-right' | 'layout-left'>('layout-right');
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const cardRef = useRef<HTMLDivElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setBgImage(event.target.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);

        try {
            // @ts-ignore
            const { htmlToImage } = window;
            if (!htmlToImage) throw new Error("html-to-image not found");

            await document.fonts.ready;

            // Warm up fonts
            const warmUp = document.createElement('div');
            warmUp.style.fontFamily = "'Roboto Condensed', 'Roboto', 'Roboto Mono'";
            warmUp.style.visibility = 'hidden';
            warmUp.style.position = 'absolute';
            warmUp.textContent = "DE PASSER UNE BONNE ANNÉE [ libre @ toi ] 2026";
            document.body.appendChild(warmUp);

            await new Promise(resolve => setTimeout(resolve, 1500));
            await htmlToImage.toPng(cardRef.current, { cacheBust: false });
            await new Promise(resolve => setTimeout(resolve, 300));

            const dataUrl = await htmlToImage.toPng(cardRef.current, {
                quality: 1.0,
                pixelRatio: 3,
                cacheBust: true,
                includeQueryParams: true,
                skipFonts: false,
                style: {
                    transform: 'scale(1)',
                }
            });

            const link = document.createElement('a');
            link.download = `carte-voeux-2026-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            document.body.removeChild(warmUp);
        } catch (error) {
            console.error('Erreur lors de la génération:', error);
            alert('Erreur lors de la génération de l\'image.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            {/* Editor Panel */}
            <aside className="w-80 bg-white neo-border border-t-0 border-b-0 border-l-0 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <h2 className="font-syne font-black text-2xl uppercase border-b-4 border-black pb-2 mb-6">Éditeur Vœux</h2>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase">Image de fond</label>
                    <label className="block w-full bg-white neo-border-fine p-3 font-bold uppercase text-sm cursor-pointer text-center neo-hover neo-active transition-all">
                        Sélectionner une image
                        <input type="file" hidden onChange={handleFileUpload} accept="image/*" />
                    </label>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase">Disposition</label>
                    <select
                        value={layout}
                        onChange={(e) => setLayout(e.target.value as any)}
                        className="w-full neo-border-fine p-3 font-roboto-condensed font-bold bg-[#FFFAE5] text-sm"
                    >
                        <option value="layout-right">Droit (Éléments à droite)</option>
                        <option value="layout-left">Gauche (Éléments à gauche)</option>
                    </select>
                </div>

                <div className="space-y-4 pt-4 border-t-2 border-black/10">
                    <div>
                        <label className="text-[10px] font-black uppercase">Logo Parties</label>
                        <div className="space-y-2 mt-1">
                            <input value={logoLeft} onChange={e => setLogoLeft(e.target.value)} placeholder="[ libre" className="w-full neo-border-fine p-2 text-sm font-mono bg-[#FFFAE5] shadow-[2px_2px_0_black]" />
                            <input value={logoIcon} onChange={e => setLogoIcon(e.target.value)} placeholder="@" maxLength={2} className="w-full neo-border-fine p-2 text-sm font-mono bg-[#FFFAE5] shadow-[2px_2px_0_black]" />
                            <input value={logoRight} onChange={e => setLogoRight(e.target.value)} placeholder="toi ]" className="w-full neo-border-fine p-2 text-sm font-mono bg-[#FFFAE5] shadow-[2px_2px_0_black]" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase">Hashtag</label>
                        <input value={hashtag} onChange={e => setHashtag(e.target.value)} placeholder="#2026" className="w-full neo-border-fine p-2 text-sm font-mono bg-[#FFFAE5] shadow-[2px_2px_0_black]" />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase">Texte pied de page</label>
                        <input value={footer} onChange={e => setFooter(e.target.value)} placeholder="your-radio.fm" className="w-full neo-border-fine p-2 text-sm font-mono bg-[#FFFAE5] shadow-[2px_2px_0_black]" />
                    </div>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="w-full bg-[#D20A33] text-white p-4 font-black uppercase text-sm neo-active neo-shadow-sm mt-8 hover:bg-[#b0082a] transition-colors"
                >
                    {isGenerating ? 'Génération...' : 'Télécharger l\'image'}
                </button>
            </aside>

            {/* Preview Area */}
            <main className="flex-1 bg-gray-200 flex items-center justify-center overflow-auto p-12 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]">
                <div className="transform scale-[0.8] origin-center">
                    <div
                        ref={cardRef}
                        className={`relative w-[800px] h-[533px] bg-white overflow-hidden border-4 border-black shadow-[15px_15px_0px_rgba(0,0,0,0.8)] ${layout}`}
                    >
                        {bgImage && <img src={bgImage} className="absolute inset-0 w-full h-full object-cover" alt="Fond" />}

                        {/* Logo Zone */}
                        <div className={`absolute flex items-center flex-wrap bg-white border-4 border-black px-[15px] py-[5px] shadow-[6px_6px_0_#D20A33] z-10 transition-all duration-300 ${layout === 'layout-right' ? 'top-5 left-5 -rotate-1' : 'top-[30px] right-[30px] rotate-1'
                            }`}>
                            <span className="font-roboto-condensed font-bold text-5xl tracking-tighter text-black whitespace-nowrap leading-none">{logoLeft}</span>
                            <div className="bg-[#D20A33] text-white w-12 h-12 flex items-center justify-center text-3xl mx-2 border-2 border-black shrink-0 leading-none font-bold">
                                {logoIcon}
                            </div>
                            <span className="font-roboto-condensed font-bold text-5xl tracking-tighter text-black whitespace-nowrap leading-none">{logoRight}</span>
                        </div>

                        {/* Message Block */}
                        <div className={`absolute bg-black text-white px-10 py-[10px] pr-10 pl-5 font-roboto-condensed text-3xl font-bold uppercase z-10 whitespace-nowrap transition-all duration-300 ${layout === 'layout-right' ? 'top-[45%] -right-[10px] rotate-1' : 'top-1/2 -left-[10px] -rotate-1'
                            }`}>
                            de passer une <span className="text-[#D20A33] ml-[10px]">bonne année</span>
                        </div>

                        {/* Year Block */}
                        <div className={`absolute bg-[#D20A33] text-white font-black text-8xl leading-[0.8] px-5 py-[10px] border-4 border-black transition-all duration-300 ${layout === 'layout-right' ? 'bottom-10 right-5 -rotate-2 shadow-[-6px_-6px_0px_black]' : 'bottom-10 left-5 rotate-2 shadow-[6px_-6px_0px_black]'
                            }`}>
                            2026
                        </div>

                        {/* Hashtag */}
                        <div className={`absolute bg-white text-black font-bold px-[15px] py-[5px] text-2xl border-2 border-black whitespace-nowrap z-20 transition-all duration-300 ${layout === 'layout-right' ? 'bottom-[30px] right-[240px] rotate-[5deg]' : 'bottom-[30px] left-[250px] -rotate-[5deg]'
                            }`}>
                            {hashtag}
                        </div>

                        {/* Footer Text */}
                        <div className={`absolute bottom-0 bg-black text-white px-[15px] py-[5px] text-sm font-mono transition-all duration-300 ${layout === 'layout-right' ? 'left-0' : 'right-0'
                            }`}>
                            {footer}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GreetingsGenerator;
