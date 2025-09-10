"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import Center from "@/components/Center";
import { useUser } from "@/hooks/useUser";

export default function AuthConfirmPage() {
  const router = useRouter();
  const { handleAuthConfirm } = useUser();
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const token_hash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");
        const next = url.searchParams.get("next") || "/auth/update-password";

        if (!token_hash || !type) {
          setError("Missing token parameters.");
          return;
        }

        const result = await handleAuthConfirm(token_hash, type, next);
        if (result.success) {
          setDone(true);
          router.replace(result.redirectTo);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process confirmation link.");
      }
    })();
  }, [router, handleAuthConfirm]);

  return (
    <Center>
      <div className="w-full max-w-sm text-sm">
        {!done && !error && <p>Verifying your link…</p>}
        {error && (
          <div className="text-red-600" role="alert">
            {error}
          </div>
        )}
      </div>
    </Center>
  );
}
