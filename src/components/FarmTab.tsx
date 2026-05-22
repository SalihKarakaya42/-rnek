import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Info, Sprout, ShoppingBag, Eye, Timer } from 'lucide-react';
import { CROPS } from '../data';
import { PodState, CropType } from '../types';

interface FarmTabProps {
  pods: PodState[];
  onHarvest: (podId: string) => void;
  onPlant: (podId: string, cropId: string) => void;
  credits: number;
  water: number;
  radiationActive: boolean;
  onCleanRadiation: () => void;
}

export default function FarmTab({
  pods,
  onHarvest,
  onPlant,
  credits,
  water,
  radiationActive,
  onCleanRadiation,
}: FarmTabProps) {
  const [selectedPodId, setSelectedPodId] = useState<string | null>(null);
  const [isPlantingModalOpen, setIsPlantingModalOpen] = useState(false);
  const [hoveredCrop, setHoveredCrop] = useState<CropType | null>(null);

  const getCropById = (id: string | null): CropType | undefined => {
    if (!id) return undefined;
    return CROPS.find((c) => c.id === id);
  };

  const handleOpenPlantMenu = (podId: string) => {
    setSelectedPodId(podId);
    setIsPlantingModalOpen(true);
    setHoveredCrop(CROPS[0]); // default detail view
  };

  const handleSelectSeed = (cropId: string) => {
    if (selectedPodId) {
      onPlant(selectedPodId, cropId);
      setIsPlantingModalOpen(false);
      setSelectedPodId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Radiation Alert Section */}
      <section className="glass-panel rounded-xl p-3.5 flex items-center justify-between border-l-2 border-[#ff24e4]">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg bg-[#ff24e4]/10 text-[#ff24e4] ${radiationActive ? 'flash-animation' : ''}`}>
            {/* Pulsating bio hazard symbol indicator */}
            <span className="material-symbols-outlined text-[20px] font-bold select-none">radioactive</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#b9cacb] uppercase tracking-wider">RADYASYON SEVİYESİ</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${radiationActive ? 'bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]' : 'bg-green-500 shadow-[0_0_8px_#22c55e]'}`} />
              <span className={`font-mono text-xs font-bold ${radiationActive ? 'text-red-400' : 'text-green-400'}`}>
                {radiationActive ? 'YÜKSEK / TEHLİKELİ' : 'GÜVENLİ VEYA SINIRLI'}
              </span>
            </div>
          </div>
        </div>

        {radiationActive && (
          <button
            onClick={onCleanRadiation}
            className="px-3 py-1 bg-gradient-to-r from-[#5e0053] to-[#ff24e4] hover:from-[#ff24e4] hover:to-[#5e0053] text-white font-mono text-[10px] font-bold uppercase rounded border border-white/10 shadow-[0_0_12px_rgba(255,36,228,0.3)] transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Sızıntıyı Temizle (+400 XP kazanın, maliyet: 100 Kredi, 50L su)"
          >
            ARIT / ONAR
          </button>
        )}
      </section>

      {/* Cyberpunk Warning Notice Banner */}
      <div className="glass-panel rounded-xl p-3 flex items-start gap-3 border-l-2 border-l-[#ff24e4]/40">
        <ShieldAlert className="w-5 h-5 text-[#ff24e4] flex-shrink-0 mt-0.5 animate-bounce" />
        <div className="flex flex-col">
          <span className="font-mono text-[10px] font-semibold text-[#ff24e4] uppercase tracking-wider">SİSTEM UYARISI</span>
          <span className="font-sans text-xs text-[#b9cacb]">
            Sektör 4'te besin devirdaimi yavaşladı. Otomasyon üniteleri devrede.
          </span>
        </div>
      </div>

      {/* Pods Grid */}
      <section className="grid grid-cols-2 gap-3">
        {pods.map((pod) => {
          const crop = getCropById(pod.cropId);
          const isGrowing = crop && pod.growth < 100;
          const isReady = crop && pod.growth >= 100;

          return (
            <div
              key={pod.id}
              className={`rounded-lg p-3 flex flex-col gap-2.5 relative group ${
                isReady ? 'glass-panel-active ring-1 ring-[#00f3ff]/40 shadow-[0_0_20px_rgba(0,243,255,0.1)]' : 'glass-panel'
              }`}
            >
              {/* Scanline pattern layer overlay */}
              <div className="scanline-overlay z-0" />
              
              {/* Top Pod meta details */}
              <div className="flex justify-between items-center w-full z-10">
                <span className="font-mono text-[10px] text-[#849495] font-semibold">{pod.id}</span>
                {isGrowing && (
                  <div className="flex items-center gap-1 text-[9px] text-yellow-400 font-mono">
                    <Timer className="w-2.5 h-2.5 animate-spin" />
                    <span>{pod.timeLeft}s</span>
                  </div>
                )}
              </div>

              {/* Crop image module */}
              <div className="w-full aspect-square bg-[#0e0e0f]/80 rounded-lg relative flex items-center justify-center overflow-hidden border border-[#3a494b]/20 z-10">
                {crop ? (
                  <>
                    <img
                      alt={crop.name}
                      src={crop.image}
                      referrerPolicy="no-referrer"
                      className={`object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                        isGrowing ? 'opacity-85 saturate-[0.8] brightness-90' : 'glowing-crop'
                      }`}
                    />
                    {isReady && (
                      <div className="absolute inset-0 bg-gradient-to-t from-[#00f3ff]/20 to-transparent animate-pulse pointer-events-none" />
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 select-none">
                    <span className="material-symbols-outlined text-[32px] text-[#3a494b] group-hover:text-[#00f3ff]/40 transition-colors">
                      energy_savings_leaf
                    </span>
                    <span className="font-mono text-[9px] text-[#849495] uppercase tracking-widest">BOŞ SLOT</span>
                  </div>
                )}
              </div>

              {/* Crop Stats Section */}
              <div className="w-full flex flex-col gap-1 z-10">
                <div className="flex justify-between items-center w-full">
                  <span className="font-sans text-[11px] font-bold text-white tracking-tight uppercase truncate max-w-[70%]">
                    {crop ? crop.name : 'BOŞ SLOT'}
                  </span>
                  <span className="font-mono text-[10px] text-[#00f3ff] font-bold">
                    {pod.growth}%
                  </span>
                </div>

                <div className="progress-bar-container">
                  <div
                    className={`progress-bar-fill ${
                      isReady ? 'bg-gradient-to-r from-[#107000] to-[#36fd0f] scanner-effect' : 'bg-[#00f3ff]'
                    }`}
                    style={{ width: `${pod.growth}%` }}
                  />
                </div>
              </div>

              {/* Action trigger button */}
              <div className="w-full mt-1 z-10">
                {crop ? (
                  isReady ? (
                    <button
                      onClick={() => onHarvest(pod.id)}
                      className="w-full py-1.5 bg-[#00f3ff] text-[#0e0e0f] font-mono text-[10px] font-extrabold uppercase rounded shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_22px_rgba(0,243,255,0.6)] cursor-pointer transform transition-all active:scale-95 text-center block"
                    >
                      HASAT ET
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-1.5 rounded font-mono text-[10px] text-[#3a494b] border border-[#3a494b]/40 text-center uppercase select-none opacity-80"
                    >
                      BÜYÜYOR...
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => handleOpenPlantMenu(pod.id)}
                    className="w-full py-1.5 border border-[#00f3ff]/60 text-[#00f3ff] hover:bg-[#00f3ff]/10 font-mono text-[10px] uppercase rounded transition-all cursor-pointer text-center block"
                  >
                    EKİM YAP
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Seeding & Planting Option popup overlay */}
      <AnimatePresence>
        {isPlantingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-[#131314] rounded-t-2xl border-t border-[#00f3ff]/30 p-4 pb-8 shadow-[0_-10px_35px_rgba(0,243,255,0.2)]"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-[#00f3ff]" />
                  <h3 className="font-sans text-base font-bold text-white uppercase tracking-wider">
                    Sera Ekim Protokolü
                  </h3>
                </div>
                <button
                  onClick={() => setIsPlantingModalOpen(false)}
                  className="p-1 text-on-surface-variant hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  KAPAT
                </button>
              </div>

              {/* Crops Grid list inside the popup */}
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-5 gap-2">
                  {CROPS.map((crop) => {
                    const isAffordable = credits >= crop.seedCost;
                    const isSelected = hoveredCrop?.id === crop.id;

                    return (
                      <button
                        key={crop.id}
                        onClick={() => {
                          setHoveredCrop(crop);
                        }}
                        className={`aspect-square p-1.5 rounded-lg flex flex-col items-center justify-center gap-1 border transition-all ${
                          isSelected
                            ? 'bg-[#00f3ff]/15 border-[#00f3ff]'
                            : 'bg-neutral-900 border-white/5 hover:border-white/10'
                        } ${!isAffordable ? 'opacity-50' : ''}`}
                      >
                        <img
                          alt={crop.name}
                          src={crop.image}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span className="text-[8px] font-mono text-[#b9cacb] truncate w-full text-center">
                          {crop.seedCost}⛃
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Seed dynamic explanation & attributes */}
                {hoveredCrop && (
                  <div className="bg-[#0e0e0f]/80 p-3 rounded-lg border border-white/5 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          {hoveredCrop.name}
                          <span className="text-[9px] font-mono text-[#00f3ff] bg-[#00f3ff]/10 px-1.5 py-0.5 rounded">
                            Tohum: {hoveredCrop.seedCost} Kredi
                          </span>
                        </h4>
                        <p className="text-xs text-[#b9cacb]/85 mt-1 leading-relaxed">
                          {hoveredCrop.description}
                        </p>
                      </div>
                    </div>

                    {/* Technical stats container */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[10px] font-mono text-[#849495]">
                      <div className="flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-[#00f3ff]/80" />
                        <span>Büyüme Süresi: <strong className="text-white">{hoveredCrop.baseGrowTime}s</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-green-400" />
                        <span>Hasat Getirisi: <strong className="text-white">{hoveredCrop.baseSellValue}⛃</strong></span>
                      </div>
                      <div className="col-span-2 flex items-center gap-3 mt-1 text-[9px]">
                        <span>• Su Tüketimi: <b className="text-[#36fd0f]">{hoveredCrop.waterConsumption}L/sn</b></span>
                        <span>• Enerji Tüketimi: <b className="text-yellow-400">{hoveredCrop.energyConsumption}kW/sn</b></span>
                      </div>
                    </div>

                    {/* Plant execution trigger */}
                    <button
                      disabled={credits < hoveredCrop.seedCost}
                      onClick={() => handleSelectSeed(hoveredCrop.id)}
                      className={`w-full py-2.5 mt-2 rounded font-mono font-bold uppercase text-xs cursor-pointer transform active:scale-95 transition-all text-center ${
                        credits >= hoveredCrop.seedCost
                          ? 'bg-[#00f3ff] text-neutral-950 shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                          : 'bg-neutral-800 text-white/40 cursor-not-allowed'
                      }`}
                    >
                      {credits >= hoveredCrop.seedCost
                        ? 'TOHUMU EK VE SİSTEMİ BAŞLAT'
                        : 'YETERSİZ BİO-KREDİ'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
