export type InstructionStep = { step: number; text: string };

export type Templates = Record<string, InstructionStep[]>;

export type Overrides = Record<string, Record<string, string>>;

export type PaymentConfig = {
  provider: string;
  meta: {
    estimated_invoice_update_minutes: number;
    placeholders: Record<string, string>;
  };
  templates: Templates;
  mappings: {
    xendit_payment_types: Record<string, string[]>;
  };
  expiry_policies: Record<string, number>;
  common_tips?: string[];
  banks: Array<{
    name: string;
    id: string;
    channels: string[];
    overrides?: Record<string, Record<string, string>>;
  }>;
  ewallets: Array<{
    name: string;
    id: string;
    channels: string[];
    overrides?: Overrides;
  }>;
  qris: {
    id: string;
    channels: string[];
    overrides?: Overrides;
  };
  retail_outlets: Array<{
    name: string;
    id: string;
    channels: string[];
    overrides?: Overrides;
  }>;
  direct_debit: Array<{
    name: string;
    id: string;
    channels: string[];
    overrides?: Overrides;
  }>;
  paylater_providers: Array<{
    name: string;
    id: string;
    channels: string[];
    overrides?: Overrides;
  }>;
  card: {
    name: string;
    id: string;
    channels: string[];
    overrides?: Overrides;
  };
};

export type ResolvedSection = { key: string; title: string; steps: InstructionStep[] };

export type ResolvedInstructions = {
  title: string;
  sections: ResolvedSection[];
  notes?: string[];
};
