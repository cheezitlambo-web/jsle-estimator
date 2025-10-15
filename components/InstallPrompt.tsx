// components/InstallPrompt.tsx
"use client";
import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !deferred) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 mx-auto max-w-md rounded-2xl bg-white shadow-lg border p-3 flex items-center gap-3 z-50">
      <div className="text-sm">
        Install <b>JSLE Estimator</b> to your Home Screen.
      </div>
      <button
        className="ml-auto rounded-xl bg-emerald-600 text-white px-3 py-2 text-sm"
        onClick={async () => {
          deferred.prompt();
          const { outcome } = await deferred.userChoice;
          // outcome: 'accepted' | 'dismissed'
          setDeferred(null);
        }}
      >
        Install
      </button>
    </div>
  );
}
