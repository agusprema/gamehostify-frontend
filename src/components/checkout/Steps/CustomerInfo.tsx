"use client";

import React, {useCallback} from "react";
import { useForm, Controller } from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Gamepad2 } from "lucide-react";
import Image from "next/image";
import { CartItem, CustomerFormValues } from "@/components/checkout/types/checkout";
import { Loader2, Trash2 } from "lucide-react";

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
  onRemove,
  onUpdate,
  items,
  removingId,
  defaultValues = { name: "", email: "", phone: "" },
  serverErrors = {},
  updateCartError,
  isLoadingCartUpdate
}: Props) {

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues,
    shouldUnregister: false,
  });

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editedTarget, setEditedTarget] = React.useState<string>("");

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

  const hasServerName = !!serverErrors.name;
  const hasServerEmail = !!serverErrors.email;
  const hasServerPhone = !!serverErrors.phone;

  const handleRemove = useCallback(
    (pkgId: string) => {
      onRemove(pkgId);
    },
    [onRemove]
  );

  const handleUpdate = useCallback(
    (target: string, id:string) => {
      onUpdate(target, id);
      setEditingId(null);
    },
    [onUpdate]
  );

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Informasi Pelanggan</h2>
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
        autoComplete="on"
      >
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
          <input
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            className={`w-full bg-white dark:bg-gray-800 border rounded-lg px-4 py-3 text-black dark:text-white focus:outline-none focus:border-primary-500 ${
              errors.name || hasServerName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            }`}
            {...register("name", {
              required: "Full name is required",
              minLength: { value: 3, message: "Name must be at least 3 characters" },
            })}
          />
          {(errors.name?.message || serverErrors.name) && (
            <p className="mt-1 text-xs text-red-500">
              {errors.name?.message ?? serverErrors.name}
            </p>
          )}
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
                  errors.phone || hasServerPhone ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              />
            )}
          />
          {(errors.phone?.message || serverErrors.phone) && (
            <p className="mt-1 text-xs text-red-500">
              {errors.phone?.message ?? serverErrors.phone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
        <input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={`w-full bg-white dark:bg-gray-800 border rounded-lg px-4 py-3 text-black dark:text-white focus:outline-none focus:border-primary-500 ${
            errors.email || hasServerEmail ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          }`}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email format",
            },
          })}
        />
        {(errors.email?.message || serverErrors.email) && (
          <p className="mt-1 text-xs text-red-500">
            {errors.email?.message ?? serverErrors.email}
          </p>
        )}
      </div>

      {items.length > 0 && (
        <div className=" pt-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Gamepad2 className="h-5 w-5 mr-2 text-green-500" />
            Game Account Information
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Please provide your game account details for top-up delivery
          </p>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.packages?.name} className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
                <div className="flex items-center mb-3">
                  <Image src={item.image} alt={item.name} width={48} height={48} className="w-12 h-12 object-cover rounded-lg mr-3" />
                  <div>
                    <h4 className="text-gray-800 dark:text-white font-medium">{item.name}</h4>
                    <span className="text-primary-500 text-xs uppercase tracking-wide">{item.packages.name}</span>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {item.packages.items.map((entry, idx) => {
                  const isEditing = editingId === entry.id;

                  return (
                    <div key={idx} className="p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Game Account ID / Username
                        </label>
                        <span className="text-xs bg-primary-500 text-center text-white px-2 py-0.5 rounded-full">
                          {entry.quantity}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={isEditing ? editedTarget : entry.target}
                          onChange={(e) => setEditedTarget(e.target.value)}
                          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100 disabled:dark:bg-gray-700"
                          placeholder="Enter your game account ID or username"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            console.log("editingId", editingId, "entry.id", entry.id, "loading?", isLoadingCartUpdate);

                            if(isEditing){
                              handleUpdate(editedTarget,  entry.id);
                              entry.target = editedTarget
                            }else if(!isEditing){
                              setEditingId(entry.id);
                              setEditedTarget(entry.target);
                            }
                          }}
                          className={`px-3 py-2 cursor-pointer rounded-md text-white transition
                            ${
                              isLoadingCartUpdate && isEditing
                                ? 'hover:bg-blue-600 bg-blue-500'
                                : isEditing
                                ? 'hover:bg-green-600 bg-green-500'
                                : 'hover:bg-yellow-600 bg-yellow-500'
                              }
                            `}
                        >
                          
                          {isLoadingCartUpdate && editingId === entry.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-500 dark:text-red-400" />
                          ) : isEditing ? (
                            <>Apply</>
                          ) : (
                            <>Edit</>
                          )}
                        </button>

                        <button
                          onClick={() => handleRemove(entry.id)}
                          disabled={removingId === entry.id}
                          className="border cursor-pointer border-gray-300 dark:border-gray-600 rounded-md p-2 text-black dark:text-white hover:text-red-500 dark:hover:text-red-400 bg-gray-200 dark:bg-gray-700 hover:bg-gray-200/50 hover:dark:bg-gray-700/50 transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Remove package ${entry.target}`}
                        >
                          {removingId === entry.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-500 dark:text-red-400" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {updateCartError && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">{updateCartError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-all"
      >
        {isSubmitting ? "Validating..." : "Continue to Payment"}
      </button>
    </form>
    </>
  );
}
