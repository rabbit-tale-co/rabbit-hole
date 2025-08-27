"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Center from "@/components/Center";

export default function AuthConfirmPage() {
  const router = useRouter();
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

        if (type === "recovery") {
          const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash });
          if (error) {
            setError(error.message || "Invalid or expired recovery link.");
            return;
          }
          setDone(true);
          router.replace(next);
          return;
        }

        // Unsupported type for now
        setError("Unsupported confirmation type.");
      } catch {
        setError("Failed to process confirmation link.");
      }
    })();
  }, [router]);

  return (
    <Center>
      <div className="w-full max-w-sm text-sm">
        {!done && !error && (
          <p>Verifying your link…</p>
        )}
        {error && (
          <div className="text-red-600" role="alert">{error}</div>
        )}
      </div>
    </Center>
  );
}
