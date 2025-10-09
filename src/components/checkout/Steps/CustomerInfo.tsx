"use client";

import React from "react";
import TextInput from "@/components/ui/inputs/TextInput";
import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { setFieldErrors } from "@/utils/rhf/setFieldErrors";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { CartItem, CustomerFormValues } from "@/components/checkout/types/checkout";
import { useAuthStatus } from "@/hooks/useAuthStatus";

// Lazy-load heavy phone input to shrink initial bundle
const PhoneInput = dynamic(() => import("react-phone-number-input"), { ssr: false });

interface Props {
  onSubmit: (data: CustomerFormValues) => void;
  onRemove: (id: string) => void;
  onUpdate: (target:string, id:string) => void;
  removingId: string | null;
  items: CartItem[];
  defaultValues?: CustomerFormValues;
  serverErrors?: Partial<Record<keyof CustomerFormValues, string>>;
  updateCartError: string | null;
  isLoadingCartUpdate: boolean;
}

export default function CustomerInfoForm({
  onSubmit,
  defaultValues = { name: "", email: "", phone: "" },
  serverErrors = {},
}: Props) {
  const { loading, authenticated, user } = useAuthStatus();

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues,
    shouldUnregister: false,
  });

  const prevRef = React.useRef(defaultValues);
  React.useEffect(() => {
    const prev = prevRef.current;
    const next = defaultValues;
    if (prev.name !== next.name || prev.email !== next.email || prev.phone !== next.phone) {
      reset(next);
      prevRef.current = next;
    }
  }, [defaultValues, reset]);

  const formRef = React.useRef<HTMLFormElement>(null);
  React.useEffect(() => {
    const formEl = formRef.current;
    if (!formEl) return;
    const sync = () => {
      const nameEl = formEl.querySelector<HTMLInputElement>('input[name="name"]');
      const emailEl = formEl.querySelector<HTMLInputElement>('input[name="email"]');
      if (nameEl?.value) setValue("name", nameEl.value, { shouldDirty: true, shouldValidate: true });
      if (emailEl?.value) setValue("email", emailEl.value, { shouldDirty: true, shouldValidate: true });
    };
    sync();
    const t = setTimeout(sync, 300);
    return () => clearTimeout(t);
  }, [setValue]);

  // Terapkan error dari server ke RHF setiap kali serverErrors berubah
  React.useEffect(() => {
    const known: Array<keyof CustomerFormValues> = ["name", "email", "phone"];
    setFieldErrors<CustomerFormValues>(
      setError,
      serverErrors as Record<string, string | string[] | undefined>,
      known
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverErrors]);

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Informasi Pelanggan</h2>
      {authenticated ? (
        <>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 p-4 mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Anda sudah login. Kami akan menggunakan data akun Anda.</p>
            <div className="text-sm space-y-1 text-gray-800 dark:text-gray-100">
              <p><span className="font-medium">Nama:</span> {user?.name || "-"}</p>
              <p><span className="font-medium">Email:</span> {user?.email || "-"}</p>
              <p><span className="font-medium">Nomor HP:</span> {user?.phone || "-"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSubmit({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" })}
            disabled={loading}
            className="cursor-pointer w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-all"
          >
            Lanjut ke Pembayaran
          </button>
        </>
      ) : (
        <form
          ref={formRef}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
          autoComplete="on"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <TextInput
                label="Full Name *"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                errorMessages={errors.name?.message ? [String(errors.name.message)] : []}
                {...register("name", {
                  required: "Full name is required",
                  minLength: { value: 3, message: "Name must be at least 3 characters" },
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: "Nomor telepon wajib diisi",
                  validate: (value) => {
                    if (!value) return "Nomor telepon wajib diisi";
                    if (!isValidPhoneNumber(value)) return "Nomor telepon tidak valid.";
                    if (!value.startsWith("+62")) return "Hanya nomor Indonesia (+62) yang diperbolehkan.";
                    return true;
                  },
                }}
                render={({ field }) => (
                  <PhoneInput
                    {...field}
                    value={field.value || ""}
                    onChange={(val) => field.onChange(val ?? "")}
                    defaultCountry="ID"
                    countries={["ID"]}
                    autoComplete="tel"
                    addInternationalOption={false}
                    countryCallingCodeEditable={false}
                    international={false}
                    placeholder="+62 812-3456-7890"
                    className={`w-full bg-white dark:bg-gray-800 border rounded-lg px-4 py-3 text-black dark:text-white focus:outline-none focus:border-primary-500 ${
                      errors.phone ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                )}
              />
              {errors.phone?.message && (
                <p className="mt-1 text-xs text-red-500">{errors.phone?.message}</p>
              )}
            </div>
          </div>
          <div>
            <TextInput
              label="Email Address *"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              errorMessages={errors.email?.message ? [String(errors.email.message)] : []}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              })}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-all"
          >
            {isSubmitting ? "Validating..." : "Continue to Payment"}
          </button>
        </form>
      )}
    </>
  );
}
