"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Form from "@/components/ui/Form";
import { setFieldErrors } from "@/utils/rhf/setFieldErrors";
import { requestEmailChange, verifyEmailChangeOtp } from "@/lib/auth";

type EmailRequestValues = {
  new_email: string;
};

type OtpValues = { otp: string };

export function EmailChangeSection() {
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [pendingOtp, setPendingOtp] = useState<boolean>(false);

  const {
    register: registerReq,
    handleSubmit: handleSubmitReq,
    setError: setReqError,
    formState: { errors: reqErrors, isSubmitting: reqSubmitting },
    reset: resetReq,
  } = useForm<EmailRequestValues>({
    defaultValues: useMemo(() => ({ new_email: "", method: 'magic_link' }), []),
  });

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    setError: setOtpError,
    formState: { errors: otpErrors, isSubmitting: otpSubmitting },
    reset: resetOtp,
  } = useForm<OtpValues>({ defaultValues: { otp: "" } });

  async function onSubmitRequest(values: EmailRequestValues) {
    setRequestMessage(null);
    setRequestError(null);
    setPendingOtp(false);
    try {
      const payload = { new_email: values.new_email };
      const json = await requestEmailChange(payload);
      setRequestMessage(
        json?.message || (json?.data?.method === 'otp' ? 'OTP dikirim ke email baru' : 'Tautan verifikasi telah dikirim')
      );
      if (json?.data?.method === 'otp') setPendingOtp(true);
    } catch (err: unknown) {
      const e = err as { fields?: Record<string, string | string[]>; message?: string };
      const applied = setFieldErrors<EmailRequestValues>(setReqError, e?.fields ?? null, ['new_email']);
      if (!applied) setRequestError(e?.message || 'Gagal mengajukan perubahan email');
    }
  }

  async function onSubmitOtp(values: OtpValues) {
    try {
      const json = (await verifyEmailChangeOtp({ otp: values.otp })) as unknown as { message?: string };
      setRequestMessage(json?.message || 'Email berhasil diperbarui');
      setPendingOtp(false);
      resetReq({ new_email: '' });
      resetOtp({ otp: '' });
    } catch (err: unknown) {
      const e = err as { fields?: Record<string, string | string[]>; message?: string };
      const applied = setFieldErrors<OtpValues>(setOtpError, e?.fields ?? null, ['otp']);
      if (!applied) setRequestError(e?.message || 'Gagal verifikasi OTP');
    }
  }

  return (
    <Card
      title="Ganti Email"
      description="Ajukan perubahan email dengan magic link atau OTP."
      className="p-5"
      variant="glass"
    >
      <Form onSubmit={handleSubmitReq(onSubmitRequest)} spaced={true} error={requestError} success={requestMessage}>
        <div>
          <Input
            label="Email Baru"
            type="email"
            placeholder="user-baru@example.com"
            error={reqErrors.new_email?.message}
            variant="glass"
            {...registerReq('new_email', { required: 'Email baru wajib diisi' })}
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={reqSubmitting}
            className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-primary-600/90 hover:bg-primary-500/90 disabled:opacity-60 px-4 py-2 text-white font-medium backdrop-blur-sm shadow-sm ring-1 ring-white/10"
          >
            {reqSubmitting ? 'Mengajukan…' : 'Ajukan Perubahan Email'}
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
