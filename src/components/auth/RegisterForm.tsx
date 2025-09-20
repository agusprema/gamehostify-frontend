'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { setFieldErrors } from '@/utils/rhf/setFieldErrors';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { Mail, LockKeyhole, User } from 'lucide-react';
import { register as registerApi } from '@/lib/auth';
import "react-phone-number-input/style.css";

// Lazy-load heavy phone input to shrink initial bundle
const PhoneInput = dynamic(() => import('react-phone-number-input'), { ssr: false });

type FormValues = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string; // <-- added
  phone: string;
  birth_date: string; // YYYY-MM-DD
  gender: 'MALE' | 'FEMALE' | 'OTHER';
};

export default function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '', // <-- added
      phone: '',
      birth_date: '',
      gender: 'MALE',
    },
  });

  const pwd = watch('password');
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(data: FormValues) {
    setFormError(null);
    try {
      await registerApi({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation, // <-- added
        phone: data.phone,
        birth_date: data.birth_date,
        gender: data.gender,
      });
      router.push('/login');
    } catch (err: unknown) {
      // Tangkap error validasi dari backend (terstandardisasi lewat apiRequest): { fields, message }
      const e = err as { fields?: Record<string, string | string[] | undefined>; errors?: Record<string, string | string[] | undefined>; message?: string };
      const fields = e?.fields ?? e?.errors ?? null;
      const message = e?.message || 'Registrasi gagal';

      const known: Array<keyof FormValues> = [
        'name',
        'email',
        'password',
        'password_confirmation',
        'phone',
        'birth_date',
        'gender',
      ];
      const applied = setFieldErrors(setError, fields, known);
      if (!applied) setFormError(message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 grid-cols-1 grid md:grid-cols-2 gap-2">
      {formError && (
        <div className="col-span-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {formError}
        </div>
      )}
      {/* Nama */}
      <div className="col-span-2">
        <label className="block text-sm font-medium text-black dark:text-white mb-1">
          Nama Lengkap
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Nama kamu"
            className="w-full rounded-xl px-4 py-3 pl-10 border border-gray-300 bg-gray-100 text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white transition"
            {...register('name', {
              required: 'Nama wajib diisi',
              minLength: { value: 3, message: 'Minimal 3 karakter' },
              maxLength: { value: 255, message: 'Maksimal 255 karakter' },
            })}
          />
          <span className="absolute inset-y-0 left-3 flex items-center text-primary-500">
            <User className="w-5" />
          </span>
        </div>
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div className="col-span-1">
        <label className="block text-sm font-medium text-black dark:text-white mb-1">Email</label>
        <div className="relative">
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-xl px-4 py-3 pl-10 border border-gray-300 bg-gray-100 text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white transition"
            {...register('email', {
              required: 'Email wajib diisi',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Format email tidak valid' },
              maxLength: { value: 255, message: 'Maksimal 255 karakter' },
            })}
          />
          <span className="absolute inset-y-0 left-3 flex items-center text-primary-500">
            <Mail className="w-5" />
          </span>
        </div>
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* Nomor Telepon (Indonesia +62) */}
      <div className="col-span-1">
        <label className="block text-sm font-medium text-black dark:text-white mb-1">
          Nomor Telepon (Indonesia)
        </label>
        <div className="relative">
          <Controller
            name="phone"
            control={control}
            rules={{
              required: 'Phone wajib diisi',
              validate: (value) => {
                if (!value) return true; // opsional
                if (!isValidPhoneNumber(value)) return 'Nomor telepon tidak valid';
                if (!value.startsWith('+62')) return 'Hanya nomor Indonesia (+62) yang diperbolehkan';
                return true;
              },
            }}
            render={({ field }) => (
              <PhoneInput
                {...field}
                value={field.value || ''}
                onChange={(val) => field.onChange(val ?? '')}
                defaultCountry="ID"
                countries={['ID']}
                addInternationalOption={false}
                countryCallingCodeEditable={false}
                international={false}
                placeholder="+62 812-3456-7890"
                className={`w-full rounded-xl px-4 py-3 border border-gray-300 bg-gray-100 text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white transition ${
                  errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
            )}
          />
        </div>
        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message as string}</p>}
      </div>

      {/* Tanggal Lahir */}
      <div className="col-span-1">
        <label className="block text-sm font-medium text-black dark:text-white mb-1">
          Tanggal Lahir
        </label>
        <div className="relative">
          <input
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            min="1900-01-01"
            className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-gray-100 text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white transition"
            {...register('birth_date', {
              required: 'Tanggal Lahir wajib diisi',
              validate: (v) => {
                if (v < '1900-01-01') return 'Tanggal terlalu lama';
                if (v > new Date().toISOString().slice(0, 10)) return 'Tidak boleh di masa depan';
                return true;
              },
            })}
          />
        </div>
        {errors.birth_date && (
          <p className="mt-1 text-xs text-red-500">{errors.birth_date.message as string}</p>
        )}
      </div>

      {/* Gender */}
      <div className="col-span-1">
        <label className="block text-sm font-medium text-black dark:text-white mb-1">Gender</label>
        <div className="relative">
          <select
            className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-gray-100 text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white transition"
            {...register('gender', {
              required: 'Gender wajib diisi',
            })}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>}
      </div>

      {/* Password */}
      <div className="col-span-1">
        <label className="block text-sm font-medium text-black dark:text-white mb-1">Password</label>
        <div className="relative">
          <input
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-xl px-4 py-3 pl-10 border border-gray-300 bg-gray-100 text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white transition"
            {...register('password', {
              required: 'Password wajib diisi',
              minLength: { value: 8, message: 'Minimal 8 karakter' },
            })}
          />
          <span className="absolute inset-y-0 left-3 flex items-center text-primary-500">
            <LockKeyhole className="w-5" />
          </span>
        </div>
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
      </div>

      {/* Konfirmasi Password */}
      <div className="col-span-1">
        <label className="block text-sm font-medium text-black dark:text-white mb-1">
          Konfirmasi Password
        </label>
        <div className="relative">
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Ulangi password"
            className="w-full rounded-xl px-4 py-3 pl-10 border border-gray-300 bg-gray-100 text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white transition"
            {...register('password_confirmation', {
              required: 'Konfirmasi password wajib diisi',
              validate: (v) => (v === pwd ? true : 'Konfirmasi password tidak sama'),
            })}
          />
          <span className="absolute inset-y-0 left-3 flex items-center text-primary-500">
            <LockKeyhole className="w-5" />
          </span>
        </div>
        {errors.password_confirmation && (
          <p className="mt-1 text-xs text-red-500">{errors.password_confirmation.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer w-full col-span-2 inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 px-4 py-3 text-white font-semibold shadow-md transition"
      >
        {isSubmitting ? 'Memproses…' : 'Daftar'}
      </button>
    </form>
  );
}
