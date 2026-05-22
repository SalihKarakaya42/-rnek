import { useState, useEffect } from 'react';
import { Coins, Plus, TrendingUp, TrendingDown, Minus, ShoppingBag, Droplets, Zap } from 'lucide-react';
import { CROPS } from '../data';
import { CropType } from '../types';

interface MarketTabProps {
  credits: number;
  inventory: { [cropId: string]: number };
  water: number;
  maxWater: number;
  onSellCrops: (cropId: string, countToSell: number, pricePerUnit: number) => void;
  onBuyResources: (type: 'water' | 'energy', cost: number, amount: number) => void;
  onAddMockCredits: (amount: number) => void;
}

export default function MarketTab({
  credits,
  inventory,
  water,
  maxWater,
  onSellCrops,
  onBuyResources,
  onAddMockCredits,
}: MarketTabProps) {
  const [tradeQuantity, setTradeQuantity] = useState<1 | 10 | 100>(1);
  const [showLoadCreditsModal, setShowLoadCreditsModal] = useState(false);
  const [loadCreditsAmount, setLoadCreditsAmount] = useState('5000');
  const [fluctuatingDemands, setFluctuatingDemands] = useState<{ [cropId: string]: { demand: number; trend: 'up' | 'down' | 'stable' } }>({});

  // Simulate market demand shifts every 15 seconds to give a real stock market vibe!
  useEffect(() => {
    const generateDemands = () => {
      const initial: typeof fluctuatingDemands = {};
      CROPS.forEach((crop) => {
        // Demand sits around 50% to 250%
        let demand = 100;
        let trend: 'up' | 'down' | 'stable' = 'stable';

        if (crop.id === 'lettuce') {
          demand = Math.floor(80 + Math.random() * 50); // 80% to 130%
          trend = demand > 105 ? 'up' : 'down';
        } else if (crop.id === 'potato') {
          demand = Math.floor(40 + Math.random() * 80); // 40% to 120%
          trend = demand > 75 ? 'up' : 'down';
        } else if (crop.id === 'wheat') {
          demand = Math.floor(90 + Math.random() * 60); // 90% to 150%
          trend = demand > 120 ? 'up' : 'down';
        } else if (crop.id === 'tomato') {
          demand = Math.floor(100 + Math.random() * 120); // 100% to 220%
          trend = demand > 150 ? 'up' : 'stable';
        } else {
          demand = Math.floor(120 + Math.random() * 160); // 120% to 280%
          trend = demand > 200 ? 'up' : 'down';
        }

        initial[crop.id] = { demand, trend };
      });
      setFluctuatingDemands(initial);
    };

    generateDemands();
    const interval = setInterval(generateDemands, 15000);
    return () => clearInterval(interval);
  }, []);

  const calculateSellPrice = (crop: CropType) => {
    const factor = fluctuatingDemands[crop.id]?.demand || 100;
    return Math.max(1, Math.round((crop.baseSellValue * factor) / 100));
  };

  const handleSell = (crop: CropType) => {
    const owned = inventory[crop.id] || 0;
    const toSell = Math.min(owned, tradeQuantity);
    if (toSell > 0) {
      const priceUnit = calculateSellPrice(crop);
      onSellCrops(crop.id, toSell, priceUnit);
    }
  };

  const handleSellAll = (crop: CropType) => {
    const owned = inventory[crop.id] || 0;
    if (owned > 0) {
      const priceUnit = calculateSellPrice(crop);
      onSellCrops(crop.id, owned, priceUnit);
    }
  };

  const executeAddCredits = () => {
    const amt = parseFloat(loadCreditsAmount) || 5000;
    onAddMockCredits(amt);
    setShowLoadCreditsModal(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Dynamic Load Credit Header Panel */}
      <section className="glass-panel rounded-xl p-4 flex items-center justify-between border-l-4 border-[#00f3ff]">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-[#b9cacb] uppercase tracking-wider">BİO-KREDİ HESABI</span>
          <span className="text-xl font-bold font-mono text-[#00f3ff] drop-shadow-[0_0_8px_rgba(0,243,255,0.4)]">
            {credits.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}⛃
          </span>
        </div>
        <button
          onClick={() => setShowLoadCreditsModal(true)}
          className="h-10 px-4 bg-[#00f3ff] text-neutral-950 text-xs font-mono font-bold uppercase rounded flex items-center gap-2 hover:bg-[#6ff6ff] shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          YÜKLE
        </button>
      </section>

      {/* Trade Quantifier multiplier select tab */}
      <section className="flex items-center justify-between bg-[#1c1b1c]/40 p-2.5 rounded-lg border border-white/5">
        <span className="font-mono text-[10px] text-[#b9cacb] uppercase tracking-wider font-semibold">
          Kademeli Satış Miktarı
        </span>
        <div className="flex gap-1.5">
          {([1, 10, 100] as const).map((qty) => (
            <button
              key={qty}
              onClick={() => setTradeQuantity(qty)}
              className={`w-12 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                tradeQuantity === qty
                  ? 'bg-[#00f3ff]/20 border border-[#00f3ff] text-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.15)]'
                  : 'bg-neutral-900/60 border border-white/5 text-[#849495] hover:text-white'
              }`}
            >
              {qty}
            </button>
          ))}
        </div>
      </section>

      {/* Product Crops sale lists */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-[10px] text-[#849495] uppercase tracking-widest px-1">
          HAYATSAL HASAT SATIŞI (BORSA)
        </h3>

        {CROPS.map((crop) => {
          const owned = inventory[crop.id] || 0;
          const currentDemandInfo = fluctuatingDemands[crop.id] || { demand: 100, trend: 'stable' };
          const unitPrice = calculateSellPrice(crop);
          const earnPossible = Math.min(owned, tradeQuantity) * unitPrice;
          
          return (
            <article
              key={crop.id}
              className="glass-panel rounded-xl p-3.5 flex flex-col gap-2 border-t border-t-[#00f3ff]/10 hover:border-t-[#00f3ff]/30 transition-all shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#0e0e0f] overflow-hidden border border-[#3a494b]/20">
                    <img 
                      alt={crop.name} 
                      src={crop.image} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-sans font-bold text-white uppercase tracking-tight">
                      {crop.name}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        currentDemandInfo.demand > 110
                          ? 'bg-[#36fd0f]/10 text-[#36fd0f]'
                          : currentDemandInfo.demand < 90
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-white/5 text-slate-300'
                      }`}>
                        TALEP: %{currentDemandInfo.demand}
                      </span>
                      {currentDemandInfo.trend === 'up' && (
                        <TrendingUp className="w-3.5 h-3.5 text-[#36fd0f]" />
                      )}
                      {currentDemandInfo.trend === 'down' && (
                        <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-[#00f3ff]">
                    <Coins className="w-4 h-4" />
                    <span className="text-sm font-bold font-mono">{unitPrice}</span>
                  </div>
                  <span className="text-[8px] font-mono text-[#849495] uppercase tracking-wider block mt-0.5">
                    Birim Değer
                  </span>
                </div>
              </div>

              {/* Inventory count and Action button */}
              <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-white/5">
                <span className="font-mono text-xs text-[#b9cacb]">
                  Mevcut Stok: <strong className="text-white font-bold">{owned}</strong>
                </span>
                
                <div className="flex gap-2">
                  {owned > tradeQuantity && (
                    <button
                      onClick={() => handleSellAll(crop)}
                      className="px-2.5 py-1 text-[9px] font-mono font-bold tracking-wider text-slate-300 border border-slate-600 rounded bg-[#1c1b1c]/40 hover:bg-neutral-800 cursor-pointer active:scale-95 select-none"
                    >
                      HEPSİNİ SAT
                    </button>
                  )}
                  <button
                    disabled={owned <= 0}
                    onClick={() => handleSell(crop)}
                    className={`px-4 py-1.5 text-[10px] font-mono font-bold tracking-wider rounded uppercase cursor-pointer active:scale-95 transition-all ${
                      owned > 0
                        ? 'bg-[#00f3ff] text-neutral-950 shadow-[0_0_10px_rgba(0,243,255,0.2)] hover:scale-[1.02]'
                        : 'border border-[#3a494b]/40 text-[#3a494b] cursor-not-allowed'
                    }`}
                  >
                    {owned > 0 ? `${Math.min(owned, tradeQuantity)} ADET SAT` : 'STOK YOK'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Resource Quick Support refill shop section */}
      <section className="glass-panel rounded-xl p-4 flex flex-col gap-3">
        <h3 className="font-mono text-[10px] text-[#849495] uppercase tracking-widest">
          SERA İKTİSADİ DESTEKLERİ
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Water recharge unit */}
          <div className="bg-[#0e0e0f]/80 p-3 rounded-lg border border-white/5 flex flex-col gap-2 hover:border-blue-400/20 transition-all">
            <div className="flex items-center gap-1.5 text-blue-400">
              <Droplets className="w-4 h-4" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Acil Su İkmali</span>
            </div>
            <p className="text-[10px] text-[#b9cacb]/85 leading-tight">
              Sera ana vanalarına anında +100L taze su pompalar.
            </p>
            <button
              disabled={credits < 50}
              onClick={() => onBuyResources('water', 50, 100)}
              className={`w-full py-1.5 rounded font-mono text-[10px] font-bold uppercase mt-1 cursor-pointer transition-all ${
                credits >= 50
                  ? 'bg-blue-500 text-white hover:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                  : 'border border-[#3a494b]/40 text-[#3a494b] cursor-not-allowed'
              }`}
            >
              50⛃ / AL (+100L)
            </button>
          </div>

          {/* Energy Cell injection */}
          <div className="bg-[#0e0e0f]/80 p-3 rounded-lg border border-white/5 flex flex-col gap-2 hover:border-yellow-400/20 transition-all">
            <div className="flex items-center gap-1.5 text-yellow-400">
              <Zap className="w-4 h-4 animate-bounce" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Kristal Batarya</span>
            </div>
            <p className="text-[10px] text-[#b9cacb]/85 leading-tight">
              Banka jeneratörünü +25% enerji hücresi ile besler.
            </p>
            <button
              disabled={credits < 30}
              onClick={() => onBuyResources('energy', 30, 25)}
              className={`w-full py-1.5 rounded font-mono text-[10px] font-bold uppercase mt-1 cursor-pointer transition-all ${
                credits >= 30
                  ? 'bg-yellow-500 text-neutral-950 hover:bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.3)]'
                  : 'border border-[#3a494b]/40 text-[#3a494b] cursor-not-allowed'
              }`}
            >
              30⛃ / AL (+25%)
            </button>
          </div>
        </div>
      </section>

      {/* Simulated Deposit Funding micro terminal dialog overlay */}
      {showLoadCreditsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm glass-panel-active rounded-2xl border border-[#00f3ff]/40 p-4 shadow-[0_0_30px_rgba(0,243,255,0.3)]">
            <h3 className="font-sans text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#00f3ff]/20 pb-2.5 mb-3.5">
              <Coins className="w-5 h-5 text-[#00f3ff] drop-shadow-[0_0_4px_#00f3ff]" />
              Bio-Kredi Enjeksiyon Paneli
            </h3>

            <p className="text-xs text-[#b9cacb] mb-4 leading-relaxed">
              Mull-Net terminalinizden merkez bankası bakiyesine simüle kredi aktarın. Test ve gelişim amaçlıdır.
            </p>

            <div className="flex flex-col gap-1.5 mb-4">
              <label className="font-mono text-[9px] text-[#849495] uppercase font-bold tracking-wider">Yüklenecek Tutar (Kredi)</label>
              <div className="flex gap-2">
                {['1000', '5000', '15000', '50000'].map((val) => (
                  <button
                    key={val}
                    onClick={() => setLoadCreditsAmount(val)}
                    className={`flex-1 py-1.5 text-[11px] font-mono font-bold rounded border transition-all cursor-pointer ${
                      loadCreditsAmount === val
                        ? 'bg-[#00f3ff]/15 border-[#00f3ff] text-[#00f3ff]'
                        : 'bg-[#0e0e0f] border-white/5 text-[#849495] hover:text-white'
                    }`}
                  >
                    +{parseInt(val).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLoadCreditsModal(false)}
                className="flex-1 py-2 rounded font-mono text-xs text-slate-300 border border-white/10 hover:bg-white/5 cursor-pointer"
              >
                İPTAL
              </button>
              <button
                onClick={executeAddCredits}
                className="flex-1 py-2 rounded bg-[#00f3ff] text-neutral-950 font-mono font-extrabold text-xs cursor-pointer shadow-[0_0_15px_rgba(0,243,255,0.31)] hover:bg-[#6ff6ff]"
              >
                TRANSFERİ ONAYLA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
