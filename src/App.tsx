import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Cpu, ShoppingBag, Laptop, AlertOctagon, HelpCircle, Check, Info } from 'lucide-react';

import TopBar from './components/TopBar';
import FarmTab from './components/FarmTab';
import ResearchTab from './components/ResearchTab';
import MarketTab from './components/MarketTab';
import SystemTab from './components/SystemTab';

import { CROPS, INITIAL_TECHS, INITIAL_DISTRICTS, INITIAL_EVENTS } from './data';
import { PodState, Technology, District, SystemEvent, GameState } from './types';

// Default initial game state if local storage is blank
const getInitialState = (): GameState => ({
  level: 12,
  xp: 450,
  xpNeeded: 1000,
  credits: 2450,
  water: 120,
  maxWater: 1500,
  energyPercent: 85,
  totalEnergyContributed: 45290,
  targetEnergyNeeded: 100000,
  inventory: {
    lettuce: 4,
    potato: 1,
    wheat: 0,
    tomato: 0,
    berry: 0,
  },
  pods: [
    { id: 'POD_01', cropId: 'lettuce', growth: 100, timeLeft: 0 },
    { id: 'POD_02', cropId: 'potato', growth: 45, timeLeft: 22 },
    { id: 'POD_03', cropId: 'wheat', growth: 89, timeLeft: 10 },
    { id: 'POD_04', cropId: 'tomato', growth: 12, timeLeft: 140 },
    { id: 'POD_05', cropId: 'berry', growth: 62, timeLeft: 114 },
    { id: 'POD_06', cropId: null, growth: 0, timeLeft: 0 },
  ],
  techs: INITIAL_TECHS,
  districts: INITIAL_DISTRICTS,
  events: INITIAL_EVENTS,
});

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem('neon_agricorp_save');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse load data', e);
    }
    return getInitialState();
  });

  const [activeTab, setActiveTab] = useState<'FARM' | 'RESEARCH' | 'MARKET' | 'SYSTEM'>('FARM');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'alert' | 'info' } | null>(null);

  // Save game automatically to localStorage on state changes
  useEffect(() => {
    localStorage.setItem('neon_agricorp_save', JSON.stringify(gameState));
  }, [gameState]);

  // Toast alert trigger auto-hide helper
  const triggerNotification = (text: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Real-time server gameloop tick (every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState((prev) => {
        // Find if events are currently active
        const hasRadiation = prev.events.find((e) => e.id === 'radiation_leak')?.active ?? false;
        const hasHacker = prev.events.find((e) => e.id === 'hacker_attack')?.active ?? false;

        // Upgrades checks
        const hasEfficiencyTech = prev.techs.find((t) => t.id === 'hydro_efficiency_1')?.researched ?? false;
        const hasWellTech = prev.techs.find((t) => t.id === 'deep_well_1')?.researched ?? false;
        const hasReactorTech = prev.techs.find((t) => t.id === 'basic_reactor_1')?.researched ?? false;
        const hasWaterMgmtTech = prev.techs.find((t) => t.id === 'hydro_water_mgmt_1')?.researched ?? false;
        const hasCapacitorTech = prev.techs.find((t) => t.id === 'capacitor_bank_1')?.researched ?? false;
        const hasLabTech = prev.techs.find((t) => t.id === 'lab_systems')?.researched ?? false;

        // Calculate rates
        let waterDraw = 1.25; // Base draw water (L/sec)
        if (hasWellTech) waterDraw *= 1.15; // +15% Su Çekimi

        let energyGeneration = 0.5; // Base percentage restore per sec
        if (hasReactorTech) energyGeneration *= 1.2; // +20% Enerji Üretimi

        // Track consumption rates of growing plants
        let totalWaterConsumption = 0;
        let totalEnergyConsumption = 0;

        const updatedPods = prev.pods.map((pod) => {
          if (!pod.cropId || pod.growth >= 100) return pod;

          const crop = CROPS.find((c) => c.id === pod.cropId);
          if (!crop) return pod;

          // Water & energy check to see if growth is paused
          if (prev.water <= 2 || prev.energyPercent <= 2) {
            return pod; // growth paused
          }

          // Compute consumption rates
          let cWater = crop.waterConsumption;
          if (hasWaterMgmtTech) cWater *= 0.85; // -15% Su Tüketimi
          if (hasRadiation) cWater *= 1.2; // Radiation leak causes hyper water usage

          totalWaterConsumption += cWater;
          totalEnergyConsumption += crop.energyConsumption;

          // Calculate acceleration factor
          let speedFactor = 1.0;
          if (hasEfficiencyTech) speedFactor += 0.2; // +20% Hasat Hızı
          if (hasLabTech) speedFactor += 0.25; // +25% Tohum Çimlenme Hızı
          if (hasRadiation) speedFactor -= 0.25; // Radiation leak degrades overall speed by 25%

          const percentPerTick = (100 / crop.baseGrowTime) * speedFactor;
          const nextGrowth = Math.min(100, pod.growth + percentPerTick);
          const nextTimeLeft = Math.max(0, pod.timeLeft - 1);

          return {
            ...pod,
            growth: parseFloat(nextGrowth.toFixed(1)),
            timeLeft: nextGrowth >= 100 ? 0 : nextTimeLeft,
          };
        });

        // Compute district passive increments
        let passiveCredits = 0;
        let passiveWater = 0;
        let passiveXP = 0;

        prev.districts.forEach((d) => {
          if (d.unlocked) {
            // Apply passive credits (suspended if hacking block is active!)
            if (!hasHacker) {
              passiveCredits += d.income.credits / 10;
            }
            passiveWater += d.income.water / 10;
            passiveXP += d.income.xp / 10;
          }
        });

        // Calculate next resources
        const nextWater = Math.min(
          prev.maxWater,
          Math.max(0, prev.water + waterDraw - totalWaterConsumption + passiveWater)
        );

        let maxCap = 100;
        if (hasCapacitorTech) maxCap += 30; // increase capacitor threshold
        const nextEnergy = Math.min(
          maxCap,
          Math.max(0, prev.energyPercent + energyGeneration - totalEnergyConsumption)
        );

        const nextCredits = prev.credits + Math.round(passiveCredits);
        
        // Handle gradual XP intake from stations
        let nextXP = prev.xp + passiveXP;
        let nextLevel = prev.level;
        let nextXPNeeded = prev.xpNeeded;

        if (nextXP >= nextXPNeeded) {
          nextXP -= nextXPNeeded;
          nextLevel += 1;
          nextXPNeeded = Math.round(nextXPNeeded * 1.3);
          // Auto level-up toast
          setTimeout(() => {
            triggerNotification(`TEBRİKLER! LEVEL ${nextLevel} SEVİYESİNE ULAŞTINIZ! Yeni sistemler kilitleri açıldı.`, 'success');
          }, 0);
        }

        return {
          ...prev,
          level: nextLevel,
          xp: Math.round(nextXP),
          xpNeeded: nextXPNeeded,
          credits: nextCredits,
          water: nextWater,
          energyPercent: Math.round(nextEnergy),
          pods: updatedPods,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // SEED PLANT ACTION
  const handlePlantSeed = (podId: string, cropId: string) => {
    const crop = CROPS.find((c) => c.id === cropId);
    if (!crop) return;

    if (gameState.credits < crop.seedCost) {
      triggerNotification('Yetersiz Bio-Kredi!', 'alert');
      return;
    }

    setGameState((prev) => {
      const updatedPods = prev.pods.map((pod) => {
        if (pod.id === podId) {
          return {
            ...pod,
            cropId,
            growth: 0,
            timeLeft: crop.baseGrowTime,
          };
        }
        return pod;
      });

      return {
        ...prev,
        credits: prev.credits - crop.seedCost,
        pods: updatedPods,
      };
    });

    triggerNotification(`${crop.name} başarıyla ekildi! Entegre otomasyon başladı.`, 'success');
  };

  // CROP HARVEST ACTION
  const handleHarvestCrop = (podId: string) => {
    setGameState((prev) => {
      const pod = prev.pods.find((p) => p.id === podId);
      if (!pod || !pod.cropId) return prev;

      const crop = CROPS.find((c) => c.id === pod.cropId);
      if (!crop) return prev;

      // Update inventory and give XP
      const currentCount = prev.inventory[crop.id] || 0;
      const updatedInventory = {
        ...prev.inventory,
        [crop.id]: currentCount + 1,
      };

      const updatedPods = prev.pods.map((p) => {
        if (p.id === podId) {
          return { ...p, cropId: null, growth: 0, timeLeft: 0 };
        }
        return p;
      });

      // Award XP
      const xpEarned = Math.round(crop.baseSellValue / 3);
      let nextXP = prev.xp + xpEarned;
      let nextLevel = prev.level;
      let nextXPNeeded = prev.xpNeeded;

      if (nextXP >= nextXPNeeded) {
        nextXP -= nextXPNeeded;
        nextLevel += 1;
        nextXPNeeded = Math.round(nextXPNeeded * 1.3);
        setTimeout(() => {
          triggerNotification(`TEBRİKLER! LEVEL ${nextLevel} SEVİYESİNE ULAŞTINIZ! Yeni yetenekler aktif.`, 'success');
        }, 0);
      }

      setTimeout(() => {
        triggerNotification(`${crop.name} hasat edildi! Envantere eklendi (+${xpEarned} XP)`, 'success');
      }, 0);

      return {
        ...prev,
        inventory: updatedInventory,
        pods: updatedPods,
        xp: nextXP,
        level: nextLevel,
        xpNeeded: nextXPNeeded,
      };
    });
  };

  // RESEARCH TECHNOLOGY ACTION
  const handleResearchTech = (techId: string) => {
    const tech = gameState.techs.find((t) => t.id === techId);
    if (!tech) return;

    if (gameState.credits < tech.cost) {
      triggerNotification('Gereken bütçeniz yetersiz!', 'alert');
      return;
    }

    setGameState((prev) => {
      const updatedTechs = prev.techs.map((t) => {
        if (t.id === techId) {
          return { ...t, researched: true };
        }
        return t;
      });

      return {
        ...prev,
        credits: prev.credits - tech.cost,
        techs: updatedTechs,
      };
    });

    triggerNotification(`${tech.name} başarıyla devreye alındı! Yeni bonus aktif.`, 'success');
  };

  // SELL CROPS TRADING ACTION
  const handleSellCrops = (cropId: string, countToSell: number, pricePerUnit: number) => {
    setGameState((prev) => {
      const currentOwned = prev.inventory[cropId] || 0;
      if (currentOwned < countToSell) return prev;

      const profitEarned = countToSell * pricePerUnit;
      const updatedInventory = {
        ...prev.inventory,
        [cropId]: currentOwned - countToSell,
      };

      setTimeout(() => {
        triggerNotification(`${countToSell} adet mahsul satıldı: +${profitEarned.toLocaleString()} Kredi aktarıldı.`, 'success');
      }, 0);

      return {
        ...prev,
        credits: prev.credits + profitEarned,
        inventory: updatedInventory,
      };
    });
  };

  // RESOURCE RECHARGE PURCHASE
  const handleBuyResources = (type: 'water' | 'energy', cost: number, amount: number) => {
    if (gameState.credits < cost) {
      triggerNotification('Kredi bakiye yetersiz!', 'alert');
      return;
    }

    setGameState((prev) => {
      let nextWater = prev.water;
      let nextEnergy = prev.energyPercent;

      if (type === 'water') {
        nextWater = Math.min(prev.maxWater, prev.water + amount);
      } else {
        nextWater = prev.water;
        nextEnergy = Math.min(100, prev.energyPercent + amount);
      }

      return {
        ...prev,
        credits: prev.credits - cost,
        water: nextWater,
        energyPercent: nextEnergy,
      };
    });

    triggerNotification(`Servis alımı tamamlandı: +${amount}${type === 'water' ? 'L taze su' : '% jeneratör şarjı'} sağlandı.`, 'success');
  };

  // DEPOSIT BIO CREDITS MOCK ACTIONS
  const handleAddMockCredits = (amount: number) => {
    setGameState((prev) => ({
      ...prev,
      credits: prev.credits + amount,
    }));
    triggerNotification(`Mull-Net bankası simüle enjeksiyonu onaylandı: +${amount} Kredi yüklendi!`, 'success');
  };

  // MITIGATE SYSTEM EMERGENCY OUTAGE
  const handleMitigateEvent = (type: 'radiation_leak' | 'hacker_attack') => {
    if (type === 'radiation_leak') {
      // Radiation leak requires 100 Credits and 50L Water to fix
      if (gameState.credits < 100 || gameState.water < 50) {
        triggerNotification('Sızıntıyı onarmak için 100 Kredi & 50L su gereklidir!', 'alert');
        return;
      }
      setGameState((prev) => {
        const updatedEvents = prev.events.map((e) => {
          if (e.id === 'radiation_leak') return { ...e, active: false };
          return e;
        });

        // Award heavy XP for containment
        return {
          ...prev,
          credits: prev.credits - 100,
          water: prev.water - 50,
          events: updatedEvents,
          xp: prev.xp + 400,
        };
      });

      triggerNotification('Siber-onarım ekipleri sızıntıyı kapattı! Verimlilik normale döndü (+400 XP).', 'success');
    } else {
      // Hacker attack defused from the SystemTab minigame
      setGameState((prev) => {
        const updatedEvents = prev.events.map((e) => {
          if (e.id === 'hacker_attack') return { ...e, active: false };
          return e;
        });

        return {
          ...prev,
          events: updatedEvents,
          xp: prev.xp + 500,
        };
      });

      triggerNotification('Sızma engellendi, güvenlik duvarı yenilendi! Pasif gelirler aktif edildi (+500 XP).', 'success');
    }
  };

  // UNLOCK NEIGHBORHOOD PASSIVE DISTRICT
  const handleUnlockDistrict = (districtId: string, cost: number) => {
    if (gameState.credits < cost) {
      triggerNotification('Bölge kilit onayı için kredi bakiye yetersiz!', 'alert');
      return;
    }

    setGameState((prev) => {
      const updatedDistricts = prev.districts.map((d) => {
        if (d.id === districtId) return { ...d, unlocked: true };
        return d;
      });

      return {
        ...prev,
        credits: prev.credits - cost,
        districts: updatedDistricts,
      };
    });

    triggerNotification('Yeni maden bölgesi başarıyla sera şebekesine bağlandı!', 'success');
  };

  // PRESTIGE TRANSFER TO CITY GRID
  const handleContributeEnergy = (amount: number) => {
    if (gameState.credits < 50) {
      triggerNotification('Bakiye yetersiz! Her enerji transfer servisi için 50 Kredi bütçe ayrılmalıdır.', 'alert');
      return;
    }

    setGameState((prev) => ({
      ...prev,
      credits: prev.credits - 50,
      totalEnergyContributed: prev.totalEnergyContributed + amount,
      xp: prev.xp + 300,
    }));

    triggerNotification(`Uygarlığa enerji pompalandı: +${amount} MW elektrik ve taze gıda transfer edildi (+300 XP).`, 'success');
  };

  // REPLAY GAME AND FACTORY RESET DATA
  const handleResetGame = () => {
    setGameState(getInitialState());
    triggerNotification('Sera sistem kayıtları başarıyla sıfırlandı. İyi şanslar!', 'info');
  };

  return (
    <div className="min-h-screen text-[#e5e2e3] font-body-lg flex flex-col pb-24 relative select-none selection:bg-cyan-500/20">
      {/* Top ambient cosmic design glow */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[350px] height-[350px] bg-gradient-to-b from-[#00f3ff]/5 to-transparent rounded-full pointer-events-none blur-[80px]" />

      {/* Screen notifications custom overlay toasts */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-4 right-4 z-50 flex justify-center pointer-events-none"
          >
            <div className={`p-3 rounded-lg border flex items-center gap-2 max-w-sm shadow-xl pointer-events-auto ${
              notification.type === 'success'
                ? 'bg-[#107000]/95 border-[#36fd0f] text-white shadow-green-950/20'
                : notification.type === 'alert'
                ? 'bg-red-950/95 border-red-500 text-red-200'
                : 'bg-neutral-900/95 border-[#00f3ff] text-slate-200'
            }`}>
              {notification.type === 'success' ? (
                <span className="material-symbols-outlined text-[18px] text-[#36fd0f]">check_circle</span>
              ) : (
                <span className="material-symbols-outlined text-[18px] text-red-400">warning</span>
              )}
              <span className="text-xs font-sans font-medium">{notification.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar navigation headers */}
      <TopBar
        credits={gameState.credits}
        water={gameState.water}
        maxWater={gameState.maxWater}
        energyPercent={gameState.energyPercent}
        level={gameState.level}
        xp={gameState.xp}
        xpNeeded={gameState.xpNeeded}
        onOpenSettings={() => setActiveTab('SYSTEM')}
      />

      {/* Core Tabs content layout viewer */}
      <main className="flex-grow pt-[112px] px-4 max-w-md mx-auto w-full flex flex-col gap-4 pb-6 mt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'FARM' && (
              <FarmTab
                pods={gameState.pods}
                onHarvest={handleHarvestCrop}
                onPlant={handlePlantSeed}
                credits={gameState.credits}
                water={gameState.water}
                radiationActive={gameState.events.find((e) => e.id === 'radiation_leak')?.active ?? false}
                onCleanRadiation={() => handleMitigateEvent('radiation_leak')}
              />
            )}

            {activeTab === 'RESEARCH' && (
              <ResearchTab
                techs={gameState.techs}
                credits={gameState.credits}
                level={gameState.level}
                onResearch={handleResearchTech}
              />
            )}

            {activeTab === 'MARKET' && (
              <MarketTab
                credits={gameState.credits}
                inventory={gameState.inventory}
                water={gameState.water}
                maxWater={gameState.maxWater}
                onSellCrops={handleSellCrops}
                onBuyResources={handleBuyResources}
                onAddMockCredits={handleAddMockCredits}
              />
            )}

            {activeTab === 'SYSTEM' && (
              <SystemTab
                districts={gameState.districts}
                events={gameState.events}
                level={gameState.level}
                credits={gameState.credits}
                totalEnergyContributed={gameState.totalEnergyContributed}
                targetEnergyNeeded={gameState.targetEnergyNeeded}
                onUnlockDistrict={handleUnlockDistrict}
                onMitigateEvent={handleMitigateEvent}
                onContributeEnergy={handleContributeEnergy}
                onResetGame={handleResetGame}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom trans-HUD navigation toolbar menu tabs */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe-area-bottom h-20 bg-[#131314]/90 backdrop-blur-xl border-t border-[#3a494b]/30 shadow-[0_-5px_25px_rgba(0,0,0,0.6)]">
        {/* Farm (ÇİFTLİK) */}
        <button
          onClick={() => setActiveTab('FARM')}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer w-16 h-full relative ${
            activeTab === 'FARM' ? 'text-[#00f3ff]' : 'text-[#b9cacb]/60 hover:text-white'
          }`}
        >
          {activeTab === 'FARM' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]" />
          )}
          <span className="material-symbols-outlined text-[20px] mb-1 leading-none select-none">potted_plant</span>
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase select-none">ÇİFTLİK</span>
        </button>

        {/* Equipment or Tech tree (EKİPMAN / ARAŞTIRMA) */}
        <button
          onClick={() => setActiveTab('RESEARCH')}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer w-16 h-full relative ${
            activeTab === 'RESEARCH' ? 'text-[#00f3ff]' : 'text-[#b9cacb]/60 hover:text-white'
          }`}
        >
          {activeTab === 'RESEARCH' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]" />
          )}
          <span className="material-symbols-outlined text-[20px] mb-1 leading-none select-none">science</span>
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase select-none">ARAŞTIR</span>
        </button>

        {/* Trade Market (PAZAR / MARKET) */}
        <button
          onClick={() => setActiveTab('MARKET')}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer w-16 h-full relative ${
            activeTab === 'MARKET' ? 'text-[#00f3ff]' : 'text-[#b9cacb]/60 hover:text-white'
          }`}
        >
          {activeTab === 'MARKET' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]" />
          )}
          <span className="material-symbols-outlined text-[20px] mb-1 leading-none select-none">storefront</span>
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase select-none">PAZAR</span>
        </button>

        {/* System & Configuration view tab */}
        <button
          onClick={() => setActiveTab('SYSTEM')}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer w-16 h-full relative ${
            activeTab === 'SYSTEM' ? 'text-[#00f3ff]' : 'text-[#b9cacb]/60 hover:text-white'
          }`}
        >
          {activeTab === 'SYSTEM' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]" />
          )}
          <span className="material-symbols-outlined text-[20px] mb-1 leading-none select-none">account_circle</span>
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase select-none">SİSTEM</span>
        </button>
      </nav>
    </div>
  );
}
