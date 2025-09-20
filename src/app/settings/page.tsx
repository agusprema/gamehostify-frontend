import SettingsClient from "../../components/settings/SettingsClient";
import { requireAuth } from '@/lib/server/auth-guard';

export default async function SettingsPage() {
  // Server-side guard to block unauthenticated access
  await requireAuth();
  return <SettingsClient />;
}
