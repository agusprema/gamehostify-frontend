"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { listTokens, refresh, revokeOtherTokens, revokeToken } from "@/lib/auth";
import Card from "@/components/ui/Card";

type TokenItem = { id: number | string; name?: string | null; created_at?: string | null; last_used_at?: string | null };

function TokensSectionInner() {
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [tokensMessage, setTokensMessage] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | number | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  type ListTokensResponse =
    | { data?: { tokens?: TokenItem[] | null } | null }
    | { tokens?: TokenItem[] | null }
    | null;

  const loadTokens = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setTokensLoading(true);
    setTokensMessage(null);
    try {
      const json = (await listTokens()) as ListTokensResponse;
      const container = (json && typeof json === 'object' && 'data' in json ? json.data : json) ?? {};
      const arr: TokenItem[] = (container && typeof container === 'object' && 'tokens' in container
        ? (container as { tokens?: TokenItem[] | null }).tokens ?? []
        : []) as TokenItem[];
      if (!ctrl.signal.aborted) setTokens(Array.isArray(arr) ? arr : []);
    } catch (err: unknown) {
      const e = err as { message?: string };
      if (!ctrl.signal.aborted) {
        setTokens([]);
        setTokensMessage(e?.message || "Gagal memuat token");
      }
    } finally {
      if (!ctrl.signal.aborted) setTokensLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTokens();
    return () => abortRef.current?.abort();
  }, [loadTokens]);

  async function onRevoke(id: number | string) {
    setActionId(id);
    try {
      await revokeToken(id);
      await loadTokens();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setTokensMessage(e?.message || "Gagal mencabut token");
    } finally {
      setActionId(null);
    }
  }

  async function onRevokeOthers() {
    setRevokingOthers(true);
    try {
      await revokeOtherTokens();
      await loadTokens();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setTokensMessage(e?.message || "Gagal mencabut token lain");
    } finally {
      setRevokingOthers(false);
    }
  }

  async function onRefreshToken() {
    setRefreshing(true);
    try {
      await refresh();
      setTokensMessage("Token diperbarui.");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setTokensMessage(e?.message || "Gagal refresh token");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Card title="Personal Access Tokens" className="p-5" variant="glass">
      <div className="flex items-center justify-between mb-4">
        <div />
        <div className="flex gap-2">
          <button
            onClick={onRefreshToken}
            disabled={refreshing}
            className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-primary-600/90 hover:bg-primary-500/90 disabled:opacity-60 px-3 py-2 text-white text-sm backdrop-blur-sm shadow-sm ring-1 ring-white/10"
          >{refreshing ? 'Merefresh.' : 'Refresh Token'}</button>
          <button
            onClick={onRevokeOthers}
            disabled={revokingOthers}
            className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-rose-600/90 hover:bg-rose-500/90 disabled:opacity-60 px-3 py-2 text-white text-sm backdrop-blur-sm shadow-sm ring-1 ring-white/10"
          >{revokingOthers ? 'Mencabut.' : 'Cabut Token Lain'}</button>
        </div>
      </div>
      {tokensMessage && (
        <div className={`mb-3 text-sm rounded-lg p-3 border ${tokensMessage.toLowerCase().includes('gagal') ? 'text-red-400 bg-red-500/10 border-red-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'}`}>
          {tokensMessage}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-200/80 dark:text-gray-200/80">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Nama</th>
              <th className="py-2 pr-4">Dibuat</th>
              <th className="py-2 pr-4">Terakhir Dipakai</th>
              <th className="py-2 pr-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tokensLoading ? (
              <tr><td className="py-3 text-gray-300/80" colSpan={5}>Memuat.</td></tr>
            ) : tokens.length === 0 ? (
              <tr><td className="py-3 text-gray-300/80" colSpan={5}>Belum ada token.</td></tr>
            ) : (
              tokens.map((t) => (
                <tr key={String(t.id)} className="border-t border-white/10 text-gray-100/90">
                  <td className="py-2 pr-4">{t.id}</td>
                  <td className="py-2 pr-4">{t.name || '-'}</td>
                  <td className="py-2 pr-4">{t.created_at || '-'}</td>
                  <td className="py-2 pr-4">{t.last_used_at || '-'}</td>
                  <td className="py-2 pr-4">
                    <button
                      onClick={() => onRevoke(t.id)}
                      disabled={actionId === t.id}
                      className="cursor-pointer inline-flex items-center justify-center rounded-md bg-rose-600/90 hover:bg-rose-500/90 disabled:opacity-60 px-3 py-1.5 text-white backdrop-blur-sm shadow-sm ring-1 ring-white/10"
                    >{actionId === t.id ? 'Mencabut.' : 'Cabut'}</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export const TokensSection = memo(TokensSectionInner);
