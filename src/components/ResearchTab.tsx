import { Technology } from '../types';
import { Sprout, Waves, Zap, Droplets, BatteryCharging, Flame, Binary, Cpu, Award, Milestone, Lock, CheckCircle2 } from 'lucide-react';

interface ResearchTabProps {
  techs: Technology[];
  credits: number;
  level: number;
  onResearch: (techId: string) => void;
}

export default function ResearchTab({ techs, credits, level, onResearch }: ResearchTabProps) {
  // Helpers to assign nice corresponding React Icons for our sci-fi technologies
  const renderTechIcon = (techId: string, className: string) => {
    switch (techId) {
      case 'hydro_efficiency_1':
        return <Sprout className={className} />;
      case 'deep_well_1':
        return <Waves className={className} />;
      case 'basic_reactor_1':
        return <Zap className={className} />;
      case 'hydro_water_mgmt_1':
        return <Droplets className={className} />;
      case 'capacitor_bank_1':
        return <BatteryCharging className={className} />;
      case 'geothermal_drilling':
        return <Flame className={className} />;
      case 'lab_systems':
        return <Binary className={className} />;
      case 'excavation_protocol':
        return <Cpu className={className} />;
      case 'civilization_plane':
        return <Award className={className} />;
      default:
        return <Milestone className={className} />;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header section with description */}
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-xl font-body-lg font-bold text-[#00f3ff] uppercase tracking-wider">
          Teknoloji Ağacı
        </h2>
        <p className="text-xs text-[#b9cacb]/85">
          Sera otomasyonlarını ve yer altı jeneratörlerini geliştirmek için bütçe ayır.
        </p>
      </div>

      {/* Grid of technological nodes */}
      <div className="flex flex-col gap-3">
        {techs.map((tech) => {
          const isResearched = tech.researched;
          const isLocked = level < tech.minLevel;
          const isAffordable = credits >= tech.cost;

          return (
            <div
              key={tech.id}
              className={`rounded-xl p-4 flex flex-col gap-3.5 relative ${
                isResearched
                  ? 'glass-panel-active border-[#36fd0f]/40 shadow-[0_0_15px_rgba(54,253,15,0.08)]'
                  : isLocked
                  ? 'glass-panel opacity-50'
                  : 'glass-panel hover:border-white/15'
              }`}
            >
              {/* If locked, display a sleek holographic overlay barrier */}
              {isLocked && (
                <div className="absolute inset-0 bg-[#0e0e0f]/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-20">
                  <div className="flex items-center gap-1.5 bg-[#0e0e0f]/90 border border-[#ea580c]/50 px-3 py-1.5 rounded-lg shadow-lg">
                    <Lock className="w-3.5 h-3.5 text-[#ea580c] animate-pulse" />
                    <span className="font-mono text-[10px] text-[#ea580c] uppercase font-bold tracking-wider">
                      SEVİYE {tech.minLevel} KİLİDİ
                    </span>
                  </div>
                </div>
              )}

              {/* Main tech statistics row */}
              <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-lg bg-[#0e0e0f] flex items-center justify-center border ${
                    isResearched ? 'border-[#36fd0f]/30' : 'border-[#3a494b]/30'
                  }`}>
                    {renderTechIcon(
                      tech.id,
                      isResearched
                        ? 'w-5 h-5 text-[#36fd0f] drop-shadow-[0_0_4px_#36fd0f]'
                        : 'w-5 h-5 text-[#b9cacb]'
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                      {tech.name}
                    </h3>
                    <span className={`font-mono text-[10px] ${
                      isResearched ? 'text-[#36fd0f] font-semibold' : 'text-[#b9cacb]/80'
                    }`}>
                      {tech.bonusText}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#1c1b1c] px-2 py-0.5 rounded border border-white/5">
                  <span className="font-mono text-xs text-[#00f3ff] font-bold">
                    {tech.cost}
                  </span>
                  <span className="font-mono text-[8px] text-[#00f3ff]">CR</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="w-full z-10">
                {isResearched ? (
                  <div className="w-full py-2 bg-[#107000]/20 border border-[#107000]/40 rounded text-[10px] font-mono font-bold text-[#36fd0f] flex items-center justify-center gap-1.5 select-none">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#36fd0f]" />
                    GELİŞTİRİLDİ
                  </div>
                ) : (
                  <button
                    disabled={!isAffordable}
                    onClick={() => onResearch(tech.id)}
                    className={`w-full py-2 rounded font-mono text-[10px] font-bold uppercase transition-all tracking-wider cursor-pointer ${
                      isAffordable
                        ? 'bg-[#00f3ff] text-neutral-950 hover:shadow-[0_0_12px_rgba(0,243,255,0.3)] hover:scale-[1.01] active:scale-95'
                        : 'border border-[#3a494b]/40 text-[#3a494b] cursor-not-allowed text-center'
                    }`}
                  >
                    {isAffordable ? 'ARAŞTIR' : 'YETERSİZ BİO-KREDİ'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
