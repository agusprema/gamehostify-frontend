"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Form from "@/components/ui/Form";
import { setFieldErrors } from "@/utils/rhf/setFieldErrors";
import { requestPhoneChange, verifyPhoneChangeOtp } from "@/lib/auth";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

// Lazy-load phone input to keep bundle small
const PhoneInput = dynamic(() => import("react-phone-number-input"), { ssr: false });

type PhoneRequestValues = { new_phone: string };
type OtpValues = { otp: string };

export function PhoneChangeSection() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingOtp, setPendingOtp] = useState<boolean>(false);

  const {
    register: registerReq,
    control: controlReq,
    handleSubmit: handleSubmitReq,
    setError: setReqError,
    formState: { errors: reqErrors, isSubmitting: reqSubmitting },
    reset: resetReq,
  } = useForm<PhoneRequestValues>({ defaultValues: useMemo(() => ({ new_phone: '' }), []) });

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    setError: setOtpError,
    formState: { errors: otpErrors, isSubmitting: otpSubmitting },
    reset: resetOtp,
  } = useForm<OtpValues>({ defaultValues: { otp: '' } });

  async function onSubmitRequest(values: PhoneRequestValues) {
    setMessage(null);
    setError(null);
    setPendingOtp(false);
    try {
      const json = await requestPhoneChange(values);
      setMessage(json?.message || 'OTP dikirim ke email Anda');
      setPendingOtp(json?.data?.method === 'otp');
    } catch (err: unknown) {
      const e = err as { fields?: Record<string, string | string[]>; message?: string };
      const applied = setFieldErrors<PhoneRequestValues>(setReqError, e?.fields ?? null, ['new_phone']);
      if (!applied) setError(e?.message || 'Gagal mengajukan perubahan nomor');
    }
  }

  async function onSubmitOtp(values: OtpValues) {
    try {
      const json = (await verifyPhoneChangeOtp({ otp: values.otp })) as unknown as { message?: string };
      setMessage(json?.message || 'Nomor telepon berhasil diperbarui');
      setPendingOtp(false);
      resetReq({ new_phone: '' });
      resetOtp({ otp: '' });
    } catch (err: unknown) {
      const e = err as { fields?: Record<string, string | string[]>; message?: string };
      const applied = setFieldErrors<OtpValues>(setOtpError, e?.fields ?? null, ['otp']);
      if (!applied) setError(e?.message || 'Gagal verifikasi OTP');
    }
  }

  return (
    <Card
      title="Ganti Nomor Telepon"
      description="Ajukan perubahan nomor, lalu verifikasi dengan OTP."
      className="p-5"
      variant="glass"
    >
      <Form onSubmit={handleSubmitReq(onSubmitRequest)} error={error} success={message}>
        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-1">Nomor Baru</label>
          <Controller
            name="new_phone"
            control={controlReq}
            rules={{
              required: "Nomor baru wajib diisi",
              validate: (value: string) => {
                if (!value) return "Nomor baru wajib diisi";
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
                addInternationalOption={false}
                countryCallingCodeEditable={false}
                international={false}
                placeholder="+62 812-3456-7890"
                className={`w-full rounded-xl px-4 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border ${
                  reqErrors.new_phone ? "border-red-500/60" : "border-white/20 dark:border-white/10"
                } text-gray-900 dark:text-white placeholder-gray-500/80 dark:placeholder-gray-400/70 focus:outline-none focus:border-primary-400/70`}
              />)
            }
          />
          {reqErrors.new_phone?.message && (
            <p className="mt-1 text-xs text-red-400">{String(reqErrors.new_phone.message)}</p>
          )}
        </div>
        <div>
          <button
            type="submit"
            disabled={reqSubmitting}
            className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-primary-600/90 hover:bg-primary-500/90 disabled:opacity-60 px-4 py-2 text-white font-medium backdrop-blur-sm shadow-sm ring-1 ring-white/10"
          >
            {reqSubmitting ? 'Mengajukan…' : 'Ajukan Perubahan Nomor'}
          </button>
        </div>
      </Form>

      {pendingOtp && (
        <div className="mt-6">
          <Form onSubmit={handleSubmitOtp(onSubmitOtp)} spaced={false}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Masukkan OTP (6 digit)"
                placeholder="123456"
                inputMode="numeric"
                maxLength={6}
                error={otpErrors.otp?.message}
                {...registerOtp('otp', { required: 'OTP wajib diisi', minLength: { value: 6, message: 'OTP 6 digit' }, maxLength: { value: 6, message: 'OTP 6 digit' } })}
              />
              <div className="md:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={otpSubmitting}
                  className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-primary-600/90 hover:bg-primary-500/90 disabled:opacity-60 px-4 py-2 text-white font-medium backdrop-blur-sm shadow-sm ring-1 ring-white/10"
                >
                  {otpSubmitting ? 'Memverifikasi…' : 'Verifikasi OTP'}
                </button>
              </div>
            </div>
          </Form>
        </div>
      )}
    </Card>
  );
}
