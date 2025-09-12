"use client";

import React from "react";

export interface ChannelExtraFieldsProps {
  selectedChannel: string;
  channelProperties: Record<string, unknown>;
  handleChannelPropertyChange: (key: string, value: string) => void;
  onValidityChange?: (isValid: boolean, errors: Record<string, string>) => void;
  serverErrors?: Record<string, string>;
}

// -------------------- Helpers --------------------
const digitOnly = (v: string) => v.replace(/\D/g, "");

const isIndoMobile = (v: string): boolean => {
  if (!v) return false;
  const d = digitOnly(v.startsWith("+") ? v.slice(1) : v);
  if (d.startsWith("62")) {
    return /^62(8\d{7,13})$/.test(d);
  }
  if (d.startsWith("08")) {
    return /^08\d{7,13}$/.test(d);
  }
  return false;
};

const luhnValid = (num: string): boolean => {
  const digits = digitOnly(num);
  if (digits.length < 12 || digits.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (dbl) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    dbl = !dbl;
  }
  return sum % 10 === 0;
};

const validMonth = (m: string) => {
  const mm = parseInt(digitOnly(m), 10);
  return mm >= 1 && mm <= 12;
};

const validYear = (y: string) => {
  const yy = digitOnly(y);
  if (yy.length === 2) {
    const yr = 2000 + parseInt(yy, 10);
    return yr >= 2000 && yr < 2100;
  }
  if (yy.length === 4) {
    const yr = parseInt(yy, 10);
    return yr >= 2000 && yr < 2100;
  }
  return false;
};

const notExpired = (m: string, y: string) => {
  if (!validMonth(m) || !validYear(y)) return false;
  const now = new Date();
  const mm = parseInt(digitOnly(m), 10);
  const rawYear = digitOnly(y);
  const yyyy = rawYear.length === 2 ? 2000 + parseInt(rawYear, 10) : parseInt(rawYear, 10);
  const expiry = new Date(yyyy, mm, 0);
  return expiry >= new Date(now.getFullYear(), now.getMonth(), 1);
};

const validCVV = (cvv: string) => /^\d{3,4}$/.test(digitOnly(cvv));
const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const getPathValue = (path: string, obj: Record<string, unknown>): unknown => {
  const keys = path.split(".");
  let value: unknown = obj;
  for (const k of keys) {
    if (value && typeof value === "object" && k in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return "";
    }
  }
  return value;
};

const mapServerKeyToLocal = (k: string): string => {
  if (k.startsWith("channel_properties.")) {
    return k.replace(/^channel_properties\./, "");
  }
  return k;
};

// -------------------- Component --------------------
const ChannelExtraFields: React.FC<ChannelExtraFieldsProps> = ({
  selectedChannel,
  channelProperties,
  handleChannelPropertyChange,
  onValidityChange,
  serverErrors = {},
}) => {
  const fieldDefs = React.useMemo(() => {
    if (selectedChannel === "OVO") {
      return [
        {
          name: "account_mobile_number",
          label: "OVO Phone Number *",
          placeholder: "08xxxxxxxxxx",
          type: "tel",
        },
      ];
    }
    if (selectedChannel === "CARDS") {
      return [
        { name: "card_details.card_number", label: "Card Number *", placeholder: "4111 1111 1111 1111", type: "text" },
        { name: "card_details.expiry_month", label: "Expiry Month (MM) *", placeholder: "12", type: "text" },
        { name: "card_details.expiry_year", label: "Expiry Year (YY) *", placeholder: "25", type: "text" },
        { name: "card_details.cvn", label: "CVV *", placeholder: "123", type: "password" },
        { name: "card_details.cardholder_first_name", label: "Cardholder First Name *", placeholder: "John", type: "text" },
        { name: "card_details.cardholder_last_name", label: "Cardholder Last Name *", placeholder: "Doe", type: "text" },
        { name: "card_details.cardholder_email", label: "Cardholder Email *", placeholder: "john@example.com", type: "email" },
        { name: "card_details.cardholder_phone_number", label: "Cardholder Phone Number *", placeholder: "08xxxxxxxxxx", type: "tel" },
      ];
    }
    return [];
  }, [selectedChannel]);

  const localErrors = React.useMemo(() => {
    const errs: Record<string, string> = {};
    if (fieldDefs.length === 0) return errs;

    fieldDefs.forEach(({ name }) => {
      const raw = String(getPathValue(name, channelProperties) ?? "").trim();
      if (!raw) {
        errs[name] = "Required.";
        return;
      }

      switch (name) {
        case "account_mobile_number":
        case "card_details.cardholder_phone_number":
          if (!isIndoMobile(raw)) errs[name] = "Nomor Indonesia tidak valid.";
          break;
        case "card_details.card_number":
          if (!luhnValid(raw)) errs[name] = "Card number invalid.";
          break;
        case "card_details.expiry_month":
          if (!validMonth(raw)) errs[name] = "MM tidak valid (01-12).";
          break;
        case "card_details.expiry_year":
          if (!validYear(raw)) errs[name] = "Tahun tidak valid.";
          break;
        case "card_details.cvn":
          if (!validCVV(raw)) errs[name] = "CVV 3-4 digit.";
          break;
        case "card_details.cardholder_email":
          if (!validEmail(raw)) errs[name] = "Email tidak valid.";
          break;
        default:
          if (raw.length < 2) errs[name] = "Terlalu pendek.";
          break;
      }
    });

    if (
      selectedChannel === "CARDS" &&
      !errs["card_details.expiry_month"] &&
      !errs["card_details.expiry_year"]
    ) {
      const m = String(getPathValue("card_details.expiry_month", channelProperties) ?? "");
      const y = String(getPathValue("card_details.expiry_year", channelProperties) ?? "");
      if (!notExpired(m, y)) {
        errs["card_details.expiry_year"] = "Kartu kadaluarsa.";
      }
    }

    return errs;
  }, [fieldDefs, channelProperties, selectedChannel]);

  const mergedErrors = React.useMemo(() => {
    const out = { ...localErrors };
    Object.entries(serverErrors).forEach(([k, msg]) => {
      const localKey = mapServerKeyToLocal(k);
      out[localKey] = msg;
    });
    return out;
  }, [localErrors, serverErrors]);

  const isValid = React.useMemo(() => Object.keys(mergedErrors).length === 0, [mergedErrors]);

  React.useEffect(() => {
    onValidityChange?.(isValid, mergedErrors);
  }, [isValid, mergedErrors, onValidityChange]);

  if (fieldDefs.length === 0) return null;

  return (
    <fieldset className="mb-4 space-y-4" aria-labelledby="extra-fields-heading">
      <legend id="extra-fields-heading" className="sr-only">Informasi Tambahan Pembayaran</legend>
      {fieldDefs.map(({ name, label, placeholder, type }) => {
        const val = String(getPathValue(name, channelProperties) ?? "");
        const hasErr = !!mergedErrors[name];
        return (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {label}
            </label>
            <input
              id={name}
              name={name}
              type={type || "text"}
              required
              value={val}
              onChange={(e) => handleChannelPropertyChange(name, e.target.value)}
              className={`w-full rounded-lg px-4 py-3 border text-sm focus:outline-none focus:ring-1 transition
                bg-white text-black border-gray-300 focus:ring-primary-500
                dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:ring-primary-500
                ${hasErr ? "border-red-500 focus:ring-red-500 dark:border-red-500" : ""}
              `}
              placeholder={placeholder}
              aria-invalid={hasErr}
              aria-describedby={hasErr ? `${name}-error` : undefined}
            />
            {hasErr && (
              <p id={`${name}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                {mergedErrors[name]}
              </p>
            )}
          </div>
        );
      })}
    </fieldset>
  );
};

export default React.memo(ChannelExtraFields);
