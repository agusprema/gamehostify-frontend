export interface GamePackage {
  id: string;
  name: string;
  amount: string;
  type: string;
  final_price: number;
  original_price?: number;
  is_popular?: boolean;
  has_discount: boolean;
  metadata?: { bonus?: string };
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  logo: string;
  category: string;
  rating?: number;
  label: string;
  placeholder: string;
  is_popular?: boolean;
  packages: GamePackage[];
}

export interface GameTopUpProps {
  games: Game[];
  nextCursor?: string | null;
  hasMore?: boolean;
  isHome?: boolean;
  scrollTriggerRatio?: number;
  height?: number;
}

export interface Category {
  key: string;
  value:string;
}