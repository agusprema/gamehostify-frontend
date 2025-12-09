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
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Form from '@/components/ui/Form';

// Lazy-load heavy phone input to shrink initial bundle
const PhoneInput = dynamic(() => import('react-phone-number-input'), { ssr: false });

type FormValues = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
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
      password_confirmation: '',
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
        password_confirmation: data.password_confirmation,
        phone: data.phone,
        birth_date: data.birth_date,
        gender: data.gender,
      });
      router.push('/login');
    } catch (err: unknown) {
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
    <Form onSubmit={handleSubmit(onSubmit)} error={formError} className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {/* Nama */}
      <div className="col-span-2">
        <Input
          label="Nama Lengkap"
          type="text"
          placeholder="Nama kamu"
          leftIcon={<User className="w-5" />}
          error={errors.name?.message}
          {...register('name', {
            required: 'Nama wajib diisi',
            minLength: { value: 3, message: 'Minimal 3 karakter' },
            maxLength: { value: 255, message: 'Maksimal 255 karakter' },
          })}
        />
      </div>

      {/* Email */}
      <div className="col-span-1">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="w-5" />}
          error={errors.email?.message}
          {...register('email', {
            required: 'Email wajib diisi',
            pattern: { value: /\S+@\S+\.\S+/, message: 'Format email tidak valid' },
            maxLength: { value: 255, message: 'Maksimal 255 karakter' },
          })}
        />
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
        <Input
          label="Tanggal Lahir"
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          min="1900-01-01"
          error={errors.birth_date?.message as string | undefined}
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

      {/* Gender */}
      <div className="col-span-1">
        <Select
          label="Gender"
          error={errors.gender?.message}
          {...register('gender', { required: 'Gender wajib diisi' })}
        >
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </Select>
      </div>

      {/* Password */}
      <div className="col-span-1">
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          leftIcon={<LockKeyhole className="w-5" />}
          error={errors.password?.message}
          {...register('password', {
            required: 'Password wajib diisi',
            minLength: { value: 8, message: 'Minimal 8 karakter' },
          })}
        />
      </div>

      {/* Konfirmasi Password */}
      <div className="col-span-1">
        <Input
          label="Konfirmasi Password"
          type="password"
          autoComplete="new-password"
          placeholder="Ulangi password"
          leftIcon={<LockKeyhole className="w-5" />}
          error={errors.password_confirmation?.message}
          {...register('password_confirmation', {
            required: 'Konfirmasi password wajib diisi',
            validate: (v) => (v === pwd ? true : 'Konfirmasi password tidak sama'),
          })}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer w-full col-span-2 inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 px-4 py-3 text-white font-semibold shadow-md transition"
      >
        {isSubmitting ? 'Memproses.' : 'Daftar'}
      </button>
    </Form>
  );
}
