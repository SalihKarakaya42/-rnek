export interface CropType {
  id: string;
  name: string;
  seedCost: number;
  baseGrowTime: number; // in seconds
  baseSellValue: number;
  image: string;
  description: string;
  waterConsumption: number; // water per sec
  energyConsumption: number; // energy per sec
}

export interface PodState {
  id: string; // e.g. POD_01
  cropId: string | null; // null if empty
  growth: number; // 0 to 100
  timeLeft: number; // seconds left
}

export interface Technology {
  id: string;
  name: string;
  bonusText: string;
  cost: number;
  researched: boolean;
  minLevel: number;
  icon: string;
}

export interface District {
  id: string;
  name: string;
  cost: number;
  unlocked: boolean;
  income: {
    credits: number;
    water: number;
    xp: number;
  };
  icon: string;
  reqLevel: number;
}

export interface SystemEvent {
  id: string;
  title: string;
  description: string;
  active: boolean;
  timer: string; // e.g. "04:12" or "AKTİF"
  type: 'radiation_leak' | 'hacker_attack';
}

export interface GameState {
  level: number;
  xp: number;
  xpNeeded: number;
  credits: number;
  water: number;
  maxWater: number;
  energyPercent: number; // 0 to 100
  totalEnergyContributed: number;
  targetEnergyNeeded: number;
  inventory: { [cropId: string]: number };
  pods: PodState[];
  techs: Technology[];
  districts: District[];
  events: SystemEvent[];
}
