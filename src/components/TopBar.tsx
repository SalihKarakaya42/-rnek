import { Coins, Droplet, Zap, Settings, Star } from 'lucide-react';

interface TopBarProps {
  credits: number;
  water: number;
  maxWater: number;
  energyPercent: number;
  level: number;
  xp: number;
  xpNeeded: number;
  onOpenSettings: () => void;
}

export default function TopBar({
  credits,
  water,
  maxWater,
  energyPercent,
  level,
  xp,
  xpNeeded,
  onOpenSettings,
}: TopBarProps) {
  const xpPercent = Math.min(100, Math.floor((xp / xpNeeded) * 100));

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#131314]/95 backdrop-blur-md border-b border-[#3a494b]/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col pt-2 transition-all">
      {/* Top micro info row */}
      <div className="flex justify-between items-center px-4 h-11 border-b border-[#3a494b]/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse"></span>
          <span className="font-mono text-[10px] text-[#00f3ff] uppercase tracking-widest">
            SİSTEM DURUMU: NOMİNAL
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-[#00f3ff]" />
            <span className="font-mono text-xs text-white font-bold">LVL {level}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#b9cacb]/80">TECRÜBE (EXP)</span>
            <div className="w-24 h-1.5 bg-[#353436] rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-[#006b71] to-[#00f3ff] transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              ></div>
            </div>
            <span className="font-mono text-[10px] text-[#b9cacb] font-medium">{xp}/{xpNeeded}</span>
          </div>
        </div>
      </div>

      {/* Main resource stats bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#0e0e0f]/40">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5">
          {/* Bio Credits */}
          <div className="flex items-center gap-2 bg-[#1c1b1c]/60 px-3 py-1 rounded-lg border border-white/5 flex-shrink-0 hover:border-[#00f3ff]/30 transition-colors">
            <Coins className="w-4 h-4 text-[#00f3ff] drop-shadow-[0_0_4px_rgba(0,243,255,0.4)]" />
            <span className="font-mono text-xs text-white uppercase tracking-wider font-semibold">
              {credits.toLocaleString('tr-TR')} <span className="text-[#00f3ff] text-[10px] font-bold">KREDİ</span>
            </span>
          </div>

          {/* Water */}
          <div className="flex items-center gap-2 bg-[#1c1b1c]/60 px-3 py-1 rounded-lg border border-white/5 flex-shrink-0 hover:border-blue-400/30 transition-colors">
            <Droplet className="w-4 h-4 text-blue-400 drop-shadow-[0_0_4px_rgba(96,165,250,0.4)]" />
            <span className="font-mono text-xs text-white uppercase tracking-wider font-semibold">
              {Math.floor(water)}L <span className="text-blue-400 text-[10px] font-bold">SU</span>
            </span>
          </div>

          {/* Energy */}
          <div className="flex items-center gap-2 bg-[#1c1b1c]/60 px-3 py-1 rounded-lg border border-white/5 flex-shrink-0 hover:border-yellow-400/30 transition-colors">
            <Zap className="w-4 h-4 text-yellow-500 drop-shadow-[0_0_4px_rgba(234,179,8,0.4)] animate-pulse" />
            <span className="font-mono text-xs text-white uppercase tracking-wider font-semibold">
              {energyPercent}% <span className="text-[#ea580c] text-[10px] font-bold">ENERJİ</span>
            </span>
          </div>
        </div>

        {/* Settings button */}
        <button 
          onClick={onOpenSettings}
          className="p-1.5 text-[#00f3ff] hover:text-white rounded-lg hover:bg-neutral-800/50 transition-all cursor-pointer active:scale-90"
          title="Ayarlar / Sistem"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
