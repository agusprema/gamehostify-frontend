import type { PaymentConfig, ResolvedInstructions, InstructionStep } from "./types";
import type { TransactionAction } from "@/components/checkout/types/checkout";

const findAction = (actions: TransactionAction[] = [], type: string, descriptor: string) =>
  actions.find((a) => a.type === type && a.descriptor === descriptor);

const isLink = (value: string) => /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value);

export function resolveInstructions(
  config: PaymentConfig | null,
  channelCode: string | undefined,
  actions: TransactionAction[] = []
): ResolvedInstructions | null {
  if (!config || !channelCode) return null;

  const va = findAction(actions, "PRESENT_TO_CUSTOMER", "VIRTUAL_ACCOUNT_NUMBER");
  const pc = findAction(actions, "PRESENT_TO_CUSTOMER", "PAYMENT_CODE");
  const qr = findAction(actions, "PRESENT_TO_CUSTOMER", "QR_STRING");
  const rd = actions.find(
    (a) =>
      (a.type === "REDIRECT_CUSTOMER" || a.type === "REDIRECT") &&
      (a.descriptor === "WEB_URL" || a.descriptor === "DEEPLINK_URL")
  );
  const rdValue = rd?.value ?? "";
  const rdWrapped = rdValue && isLink(rdValue)
    ? `<a href="${rdValue}" target="_blank" rel="noreferrer">Klick Link !</a>`
    : rdValue;

  const code = channelCode.trim().toUpperCase();
  const findIn = <T extends { id: string }>(list: T[]) =>
    list.find((x) => x.id.trim().toUpperCase() === code) || null;

  const bank = findIn(config.banks);
  if (bank) {
    const placeholders = buildPlaceholders(config, bank.name, {
      va: va?.value ?? "",
      pc: pc?.value ?? "",
      qr: qr?.value ?? "",
      rd: rdWrapped,
      atm: bank.overrides?.ATM?.atm_menu_path ?? "",
      ib: bank.overrides?.IBANKING?.ib_menu_path ?? "",
      mb: bank.overrides?.MBANKING?.mb_menu_path ?? "",
    });
    const notes: string[] = [];
    const vaMins = config.expiry_policies?.VA_minutes;
    if (vaMins) notes.push(`Masa berlaku kode VA: ${vaMins} menit.`);
    const ibExtra = bank.overrides?.IBANKING as Record<string, string> | undefined;
    if (ibExtra?.extra) notes.push(ibExtra.extra);
    const mbExtra = bank.overrides?.MBANKING as Record<string, string> | undefined;
    if (mbExtra?.app_hint) notes.push(mbExtra.app_hint);
    return buildVAInstructions(config, bank.name, bank.channels, placeholders, notes);
  }

  const ewallet = findIn(config.ewallets);
  if (ewallet) {
    const placeholders = buildPlaceholders(config, ewallet.name, {
      va: "",
      pc: "",
      qr: "",
      rd: rdWrapped,
    });
    const notes: string[] = [];
    const mins = config.expiry_policies?.EWALLET_minutes;
    if (mins) notes.push(`Selesaikan pembayaran dalam ${mins} menit.`);
    const hint = ewallet.overrides?.EWALLET?.hint;
    if (hint) notes.push(hint);
    return buildSingleSection(config, ewallet.name, "EWALLET", placeholders, undefined, notes);
  }

  if (config.qris && config.qris.id.trim().toUpperCase() === code) {
    const placeholders = buildPlaceholders(config, "QRIS", { qr: qr?.value ?? "" });
    const notes: string[] = [];
    const mins = config.expiry_policies?.QRIS_minutes;
    if (mins) notes.push(`QR kedaluwarsa dalam ${mins} menit.`);
    const tips = config.qris.overrides?.QRIS?.tips;
    if (tips) notes.push(tips);
    return buildSingleSection(config, "QRIS", "QRIS", placeholders, undefined, notes);
  }

  const outlet = findIn(config.retail_outlets);
  if (outlet) {
    const placeholders = buildPlaceholders(config, outlet.name, { pc: pc?.value ?? "" });
    const notes: string[] = [];
    const days = config.expiry_policies?.RETAIL_OUTLET_days;
    if (days) notes.push(`Pembayaran harus dilakukan sebelum ${days} hari.`);
    const cashHint = outlet.overrides?.RETAIL_OUTLET?.cash_only_hint;
    if (cashHint) notes.push(cashHint);
    return buildSingleSection(config, outlet.name, "RETAIL_OUTLET", placeholders, undefined, notes);
  }

  const dd = findIn(config.direct_debit);
  if (dd) {
    const placeholders = buildPlaceholders(config, dd.name, { rd: rdWrapped });
    const notes: string[] = [];
    const mins = config.expiry_policies?.DIRECT_DEBIT_minutes;
    if (mins) notes.push(`Selesaikan otorisasi dalam ${mins} menit.`);
    const banksHint = dd.overrides?.DIRECT_DEBIT?.banks_hint;
    if (banksHint) notes.push(banksHint);
    return buildSingleSection(config, dd.name, "DIRECT_DEBIT", placeholders, undefined, notes);
  }

  const pl = findIn(config.paylater_providers);
  if (pl) {
    const placeholders = buildPlaceholders(config, pl.name, { rd: rdWrapped });
    const notes: string[] = [];
    const mins = config.expiry_policies?.PAYLATER_minutes;
    if (mins) notes.push(`Selesaikan proses paylater dalam ${mins} menit.`);
    const inst = pl.overrides?.PAYLATER?.installment_hint;
    if (inst) notes.push(inst);
    return buildSingleSection(config, pl.name, "PAYLATER", placeholders, undefined, notes);
  }

  if (config.card && config.card.id.trim().toUpperCase() === code) {
    const placeholders = buildPlaceholders(config, config.card.name, {});
    const notes: string[] = [];
    const mins = config.expiry_policies?.CARD_minutes;
    if (mins) notes.push(`Selesaikan otentikasi dalam ${mins} menit.`);
    const tips = config.card.overrides?.CARD?.tips;
    if (tips) notes.push(tips);
    const nets = config.card.overrides?.CARD?.supported_networks as string[] | undefined;
    if (nets?.length) notes.push(`Jaringan didukung: ${nets.join(", ")}.`);
    return buildSingleSection(config, config.card.name, "CARD", placeholders, "Kartu Kredit/Debit", notes);
  }

  return null;
}

function buildPlaceholders(
  config: PaymentConfig,
  entityName: string,
  opts: Partial<{
    va: string;
    pc: string;
    qr: string;
    rd: string;
    atm: string;
    ib: string;
    mb: string;
  }>
) {
  return {
    va_number: opts.va ?? "",
    bank_name: entityName ?? "",
    atm_menu_path: opts.atm ?? "",
    ib_menu_path: opts.ib ?? "",
    mb_menu_path: opts.mb ?? "",
    ewallet_name: entityName ?? "",
    ewallet_deeplink: opts.rd ?? "",
    ewallet_ref_id: "",
    qris_string: opts.qr ?? "",
    qris_expiry_minutes: String(config.expiry_policies?.QRIS_minutes ?? 15),
    outlet_name: entityName ?? "",
    payment_code: opts.pc ?? "",
    payment_barcode_url: "",
    outlet_expiry_days: String(config.expiry_policies?.RETAIL_OUTLET_days ?? 1),
    dd_bank_name: entityName ?? "",
    dd_consent_url: opts.rd ?? "",
    dd_mandate_ref: "",
    paylater_name: entityName ?? "",
    paylater_checkout_url: opts.rd ?? "",
    card_last4: "",
    card_network: "",
    three_ds_url: opts.rd ?? "",
    estimated_minutes: String(config.meta?.estimated_invoice_update_minutes ?? 5),
  } as Record<string, string>;
}

function applyTemplate(list: InstructionStep[] | undefined, placeholders: Record<string, string>) {
  return (list || []).map((s) => ({
    step: s.step,
    text: Object.keys(placeholders).reduce((acc, key) => {
      const re = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      return acc.replace(re, placeholders[key] ?? "");
    }, s.text),
  }));
}

function buildVAInstructions(
  config: PaymentConfig,
  title: string,
  channels: string[],
  placeholders: Record<string, string>,
  notes?: string[]
): ResolvedInstructions {
  const sections: ResolvedInstructions["sections"] = [];
  if (channels.includes("ATM"))
    sections.push({ key: "ATM", title: "ATM", steps: applyTemplate(config.templates.ATM, placeholders) });
  if (channels.includes("IBANKING"))
    sections.push({ key: "IBANKING", title: "Internet Banking", steps: applyTemplate(config.templates.IBANKING, placeholders) });
  if (channels.includes("MBANKING"))
    sections.push({ key: "MBANKING", title: "Mobile Banking", steps: applyTemplate(config.templates.MBANKING, placeholders) });
  return { title, sections, notes };
}

function buildSingleSection(
  config: PaymentConfig,
  title: string,
  key: keyof PaymentConfig["templates"],
  placeholders: Record<string, string>,
  sectionTitle?: string,
  notes?: string[]
): ResolvedInstructions {
  return {
    title,
    sections: [
      {
        key: String(key),
        title: sectionTitle ?? title,
        steps: applyTemplate(config.templates[key as string], placeholders),
      },
    ],
    notes,
  };
}
