import type { Game } from "@/components/sections/Game/types";
import type { Operator } from "@/components/sections/pulsa-data/types";
import type { Hiburan } from "@/components/sections/hiburan/types";

export type ApiResponse<T> = { data: T };

export type GamesData = {
  games: Game[];
  next_cursor: string | null;
  has_more: boolean;
};

export type OperatorsData = {
  operators: Operator[];
};

export type EntertainmentsData = {
  entertainment: Hiburan[];
};

