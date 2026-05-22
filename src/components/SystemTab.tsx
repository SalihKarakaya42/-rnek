import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, HelpCircle, Laptop, Power, Terminal, Landmark, Compass, Dna, MapPin, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { District, SystemEvent } from '../types';

interface SystemTabProps {
  districts: District[];
  events: SystemEvent[];
  level: number;
  credits: number;
  totalEnergyContributed: number;
  targetEnergyNeeded: number;
  onUnlockDistrict: (districtId: string, cost: number) => void;
  onMitigateEvent: (type: 'radiation_leak' | 'hacker_attack') => void;
  onContributeEnergy: (amount: number) => void;
  onResetGame: () => void;
}

export default function SystemTab({
  districts,
  events,
  level,
  credits,
  totalEnergyContributed,
  targetEnergyNeeded,
  onUnlockDistrict,
  onMitigateEvent,
  onContributeEnergy,
  onResetGame,
}: SystemTabProps) {
  const [showResetModal, setShowResetModal] = useState(false);
  const [showHackingGame, setShowHackingGame] = useState(false);
  const [hackingTargetCode, setHackingTargetCode] = useState('');
  const [hackingCodeOptions, setHackingCodeOptions] = useState<string[]>([]);
  const [hackingPassCheck, setHackingPassCheck] = useState<number>(0); // how many stages solved, need 3

  const startDecryptHacker = () => {
    // Generate simple cyberpunk hexadecimal code puzzles
    const randomHex = () => Math.floor(16 + Math.random() * 239).toString(16).toUpperCase();
    const target = randomHex();
    const options = [target, randomHex(), randomHex(), randomHex(), randomHex()].sort();
    
    setHackingTargetCode(target);
    setHackingCodeOptions(options);
    setHackingPassCheck(0);
    setShowHackingGame(true);
  };

  const handleSelectCode = (selected: string) => {
    if (selected === hackingTargetCode) {
      if (hackingPassCheck >= 2) {
        // Solved 3 stages! Block hacker attack
        onMitigateEvent('hacker_attack');
        setShowHackingGame(false);
      } else {
        // Go next stage
        const nextTarget = Math.floor(16 + Math.random() * 239).toString(16).toUpperCase();
        const nextOptions = [nextTarget, Math.floor(16 + Math.random() * 239).toString(16).toUpperCase(), Math.floor(16 + Math.random() * 239).toString(16).toUpperCase(), Math.floor(16 + Math.random() * 239).toString(16).toUpperCase(), Math.floor(16 + Math.random() * 239).toString(16).toUpperCase()].sort();
        setHackingTargetCode(nextTarget);
        setHackingCodeOptions(nextOptions);
        setHackingPassCheck((p) => p + 1);
      }
    } else {
      // Failed stage, decrement or simple warning shake
      alert('GÜVENLİK HATASI: Yanlış kod seçimi! Firewall çöktü, sistem sıfırlandı.');
      setShowHackingGame(false);
    }
  };

  const activeRegionCount = districts.filter((d) => d.unlocked).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Operator profile row */}
      <section className="flex items-center gap-4 bg-[#201f20]/40 p-3.5 rounded-xl border border-white/5 backdrop-blur-sm">
        <div className="relative w-16 h-16 flex-shrink-0">
          <div className="absolute inset-0 bg-[#00f3ff] hex-clip opacity-20 blur-[2px]" />
          <div className="absolute inset-[1px] bg-[#00f3ff] hex-clip" />
          <div className="absolute inset-[3px] bg-[#201f20] hex-clip overflow-hidden">
            <img
              alt="Avatar Operator"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAn2vPwiHRLja1Jal8DgVAlIOo1OVwdCCZOP1I1j0hsi9UVthheJkUyki3W4fHqX3kszv0QrNb-4XHmQutVGvHPoo_erM5g2-3MQ4clfAV_Mb9a-Iu6-LX4LsKAB6HJpijFSI5vJ6ea30nfXy-3E1DFBn-gduGmlxXzkhuA-iIiasBxuyA9h6_2PqeiDv0Gc1WfJaAb0lOOvtUkMCYNFNzmvb5rsGc0oS6xmoKyvLZSXjpZBuz69jOMMD8hE-KQSaJ14BZfS1pD0F0P"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover mix-blend-luminosity opacity-80"
            />
          </div>
        </div>
        <div>
          <h2 className="font-sans text-base font-extrabold text-[#00f3ff] tracking-tight uppercase leading-tight">
            V3X-99 OPERATÖR
          </h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#36fd0f] animate-pulse shadow-[0_0_6px_#36fd0f]" />
            <span className="font-mono text-[9px] text-[#b9cacb]/85 uppercase tracking-wider font-semibold">
              S Sistem Bağlantısı Aktif
            </span>
          </div>
        </div>
      </section>

      {/* Discovered / Unlockable Districts section bar */}
      <section className="flex flex-col gap-3.5">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-mono text-[10px] text-[#849495] uppercase tracking-widest font-bold">
            BÖLGELER (MADENLER)
          </h3>
          <span className="text-[9px] font-mono text-[#00f3ff] font-bold bg-[#00f3ff]/10 px-2 py-0.5 rounded">
            {activeRegionCount}/{districts.length} KEŞFEDİLDİ
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {districts.map((dis) => {
            const hasLvl = level >= dis.reqLevel;
            const canAfford = credits >= dis.cost;

            return (
              <div
                key={dis.id}
                className={`border rounded-lg p-3 flex items-center justify-between ${
                  dis.unlocked
                    ? 'bg-[#1c1b1c]/70 border-[#3a494b]/20 hover:border-[#00f3ff]/20'
                    : 'bg-[#1c1b1c]/10 border-white/5 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded bg-[#0e0e0f] flex items-center justify-center border ${
                    dis.unlocked ? 'border-[#00f3ff]/20' : 'border-white/5'
                  }`}>
                    {dis.unlocked ? (
                      <MapPin className="w-4 h-4 text-[#00f3ff]" />
                    ) : (
                      <KeyRound className="w-4 h-4 text-[#849495]" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-white text-xs">{dis.name}</h4>
                    {dis.unlocked ? (
                      <div className="flex gap-2 text-[9px] font-mono mt-0.5">
                        <span className="text-emerald-400">+{dis.income.credits} CR</span>
                        {dis.income.water > 0 && (
                          <span className="text-blue-400">+{dis.income.water}L SU</span>
                        )}
                        {dis.income.xp > 0 && (
                          <span className="text-[#36fd0f]">+{dis.income.xp} XP</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[9px] font-mono text-[#849495]">
                        Açılış Bedeli: {dis.cost.toLocaleString('tr-TR')} CR
                      </span>
                    )}
                  </div>
                </div>

                {!dis.unlocked && (
                  <button
                    disabled={!hasLvl || !canAfford}
                    onClick={() => onUnlockDistrict(dis.id, dis.cost)}
                    className={`px-3 py-1.5 rounded font-mono text-[9px] font-bold uppercase cursor-pointer transition-all ${
                      hasLvl && canAfford
                        ? 'bg-[#00f3ff] text-neutral-950 shadow-[0_0_8px_rgba(0,243,255,0.3)]'
                        : 'border border-[#3a494b]/40 text-[#3a494b] cursor-not-allowed'
                    }`}
                  >
                    {!hasLvl ? `LVL ${dis.reqLevel}` : 'AÇ'}
                  </button>
                )}

                {dis.unlocked && (
                  <span className="font-mono text-[10px] text-[#36fd0f] font-bold uppercase tracking-wider bg-[#36fd0f]/5 border border-[#36fd0f]/20 px-2 py-0.5 rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#36fd0f] rounded-full" />
                    BAĞLI
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Cyberpunk Dynamic active emergency alert systems */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-[10px] text-[#849495] uppercase tracking-widest px-1">
          Sistem Olayları (Tehditler)
        </h3>

        <div className="flex flex-col gap-2">
          {events.map((evt) => {
            if (!evt.active) return null;

            return (
              <div
                key={evt.id}
                className={`border p-3.5 rounded-lg flex items-start gap-3.5 ${
                  evt.type === 'radiation_leak'
                    ? 'bg-red-950/20 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.05)]'
                    : 'bg-[#5e0053]/15 border-[#ff24e4]/30 shadow-[0_0_12px_rgba(255,36,228,0.05)]'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {evt.type === 'radiation_leak' ? (
                    <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
                  ) : (
                    <Terminal className="w-5 h-5 text-[#ff24e4] animate-bounce" />
                  )}
                </div>

                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <p className={`font-mono text-xs uppercase font-extrabold ${
                      evt.type === 'radiation_leak' ? 'text-red-400' : 'text-[#ff24e4]'
                    }`}>
                      {evt.title}
                    </p>
                    <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded leading-none ${
                      evt.type === 'radiation_leak' ? 'bg-red-500/15 text-red-400' : 'bg-[#ff24e4]/15 text-[#ff24e4]'
                    }`}>
                      {evt.timer}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#b9cacb]/85 mt-1.5 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="mt-3">
                    {evt.type === 'radiation_leak' ? (
                      <button
                        onClick={() => onMitigateEvent('radiation_leak')}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-mono text-[9px] font-bold uppercase rounded border border-white/5 cursor-pointer shadow-md"
                      >
                        MÜDAHALE ET (Maliyet: 100⛃, 50L su)
                      </button>
                    ) : (
                      <button
                        onClick={startDecryptHacker}
                        className="px-3 py-1 bg-[#ff24e4] text-neutral-950 hover:bg-[#fface8] font-mono text-[9px] font-extrabold uppercase rounded border border-white/5 cursor-pointer shadow-[#ff24e4]/30 shadow-md"
                      >
                        GÜVENLİK DUVARI AÇ (Uygulama Şifre Çöz)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {events.every((e) => !e.active) && (
            <div className="border border-white/5 bg-[#1c1b1c]/30 p-4 rounded-lg text-center flex items-center justify-center gap-2 select-none">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                Tüm Tehditler Etkisiz Hale Getirildi
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Prestige project: Civilization blueprint */}
      <section className="bg-neutral-950/40 border border-[#00f3ff]/20 p-4 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00f3ff]/50" />
        <div className="relative z-10 select-none">
          <div className="flex items-center gap-2 mb-3">
            <Landmark className="w-4 h-4 text-[#00f3ff]" />
            <h3 className="font-mono text-[10px] text-[#00f3ff] uppercase tracking-widest font-extrabold">
              PRESTİJ: UYGARLIK TASLAĞI
            </h3>
          </div>

          <p className="text-[10px] text-[#b9cacb]/80 mb-3 leading-relaxed">
            Şehir şebekelerine taze besin ve yedek elektrik enerjisi transfer edin. Hedefe ulaştığınızda prestij basıp kalıcı hız çarpanı kazanırsınız!
          </p>

          <div className="flex justify-between items-center text-[9px] font-mono text-[#849495] mb-1">
            <span>TOPLAM GÖNDERİLEN ENERJİ / KAYNAK</span>
            <span className="text-[#00f3ff] font-bold">
              {totalEnergyContributed.toLocaleString('tr-TR')} / {targetEnergyNeeded.toLocaleString('tr-TR')} EXP
            </span>
          </div>

          <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/5 mb-3.5">
            <div
              className="h-full bg-gradient-to-r from-[#00f3ff] to-cyan-500 animate-pulse"
              style={{ width: `${Math.min(100, (totalEnergyContributed / targetEnergyNeeded) * 100)}%` }}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onContributeEnergy(500)}
              className="flex-1 py-1 px-2.5 bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/30 rounded font-mono text-[8px] font-bold uppercase cursor-pointer"
            >
              Uygarlığa Destek Ver (+500 GÜÇ / -50 Kredi)
            </button>
            <button
              disabled={totalEnergyContributed < targetEnergyNeeded}
              className={`flex-1 py-1 rounded font-mono text-[8px] font-extrabold uppercase text-center ${
                totalEnergyContributed >= targetEnergyNeeded
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-bounce shadow-lg cursor-pointer'
                  : 'bg-neutral-800 text-[#3a494b] border border-white/5 cursor-not-allowed'
              }`}
            >
              Taslağı Güncelle (Yükselt)
            </button>
          </div>
        </div>
        <div className="absolute inset-0 scanline-overlay opacity-5 pointer-events-none" />
      </section>

      {/* Shutdown Reset Destructive Panel */}
      <section className="mt-4 pt-4 border-t border-[#3a494b]/15">
        <button
          onClick={() => setShowResetModal(true)}
          className="w-full bg-[#1c1b1c]/30 hover:bg-[#ff24e4]/10 border border-[#ff24e4]/30 rounded-lg py-3 px-4 flex items-center justify-center gap-2 group transition-all cursor-pointer"
        >
          <Power className="w-4 h-4 text-[#ff24e4] group-hover:animate-spin" />
          <span className="font-mono text-[10px] text-[#ff24e4] uppercase tracking-widest font-extrabold">
            Oturumu Kapat (Sera Sıfırla)
          </span>
        </button>
      </section>

      {/* Interactive Firewall decrypter hacker defense minigame */}
      <AnimatePresence>
        {showHackingGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="w-full max-w-sm glass-panel-active rounded-xl border border-[#ff24e4]/50 p-4 shadow-[0_0_25px_rgba(255,36,228,0.3)]">
              <div className="flex items-center gap-1.5 border-b border-[#ff24e4]/20 pb-2 mb-3">
                <Laptop className="w-5 h-5 text-[#ff24e4]" />
                <h3 className="font-sans text-xs font-bold text-white uppercase tracking-wider">
                  Firewall Sızma Tespit & Dekriptör
                </h3>
              </div>

              <p className="text-[11px] text-[#b9cacb] mb-4">
                Sızan malware'i durdurmak için aşağıdaki <strong className="text-white font-bold">Hedef Hex Kodunu</strong> bulun ({hackingPassCheck + 1}/3 aşama):
              </p>

              <div className="bg-[#0e0e0f]/90 p-3 rounded border border-white/5 mb-4 text-center select-none">
                <span className="text-[10px] font-mono text-[#849495] block mb-1 uppercase tracking-widest font-bold">HEDEF SEKTÖR KODU</span>
                <span className="text-2xl font-mono text-[#ff24e4] font-extrabold tracking-widest animate-pulse">
                  0x{hackingTargetCode}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 mb-5">
                {hackingCodeOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectCode(opt)}
                    className="py-2.5 bg-neutral-900 border border-white/5 rounded font-mono text-xs font-bold text-white uppercase hover:bg-neutral-800 hover:border-[#ff24e4]/40 active:scale-90 transition-all cursor-pointer"
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowHackingGame(false)}
                  className="w-full py-1.5 rounded font-mono text-[10px] text-white/60 bg-neutral-800 hover:bg-neutral-700 cursor-pointer"
                >
                  DURDUR ve SİSTEMDEN ATIL
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Reset Warning Modal popup dialog details */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
            <div className="w-full max-w-xs glass-panel rounded-xl border border-[#ff24e4]/50 p-4 text-center shadow-lg">
              <h4 className="font-sans font-bold text-white uppercase text-sm mb-2 text-[#ff24e4]">
                Fabrika Ayarlarına Dön?
              </h4>
              <p className="text-xs text-[#b9cacb] mb-4 leading-relaxed">
                Tüm teknoloji kayıtları, birikmiş krediler ve ekili mahsuller silinecektir. Emin misiniz?
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-1.5 rounded bg-neutral-900 border border-white/5 text-[#849495] font-mono text-[10px] cursor-pointer"
                >
                  VAZGEÇ
                </button>
                <button
                  onClick={() => {
                    onResetGame();
                    setShowResetModal(false);
                  }}
                  className="flex-1 py-1.5 rounded bg-[#ff24e4] text-neutral-950 font-mono text-[10px] font-extrabold cursor-pointer"
                >
                  SERAYI SIFIRLA
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
