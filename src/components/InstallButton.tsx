import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallButton: React.FC = () => {
  const [hidden, setHidden] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const showToast = useStore((s) => s.showToast);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) { setHidden(true); return; }
    const onBeforeInstall = (e: Event) => { e.preventDefault(); setDeferredPrompt(e as BeforeInstallPromptEvent); };
    const onInstalled = () => { setHidden(true); setDeferredPrompt(null); showToast('تم تثبيت التطبيق ✓'); };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [showToast]);

  if (hidden) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    showToast(isIOS ? 'على الآيفون: اضغط زر المشاركة ثم "إضافة إلى الشاشة الرئيسية"' : 'من قائمة المتصفح ⋮ اختار "تثبيت التطبيق"', 5000);
  };

  return (
    <button
      onClick={handleInstallClick}
      aria-label="تثبيت التطبيق"
      title="تثبيت التطبيق"
      className="fixed top-[calc(12px+env(safe-area-inset-top,0px))] left-3 z-20 w-[52px] h-[52px] rounded-full border-2 border-[#ffc300] p-0 overflow-hidden bg-[#0a0a0a] cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.4)]"
    >
      <img src="icons/icon-192.png" alt="" className="w-full h-full block" />
    </button>
  );
};
