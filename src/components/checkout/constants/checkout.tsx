import type { CustomerFormValues } from "../types/checkout";

export const CUSTOMER_FIELD_ALIASES: Record<string, keyof CustomerFormValues> = {
  name: "name",
  "customer.name": "name",
  email: "email",
  "customer.email": "email",
  phone: "phone",
  phone_number: "phone",
  "customer.phone": "phone",
  "customer.phone_number": "phone",
};