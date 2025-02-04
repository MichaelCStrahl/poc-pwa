"use client"; // Indica que este componente é executado no cliente

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  prompt(): Promise<void>;
}

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Verifica se o dispositivo é iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault(); // Impede o prompt automático
      setDeferredPrompt(event); // Armazena o evento para uso posterior
      setShowInstallPrompt(true); // Mostra o popup personalizado
    };

    // Adiciona o listener apenas se não for iOS
    if (!isIOSDevice) {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
    }

    return () => {
      if (!isIOSDevice) {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // Mostra o prompt de instalação
      const { outcome } = await deferredPrompt.userChoice; // Aguarda a escolha do usuário
      if (outcome === "accepted") {
        console.log("Usuário aceitou a instalação");
      } else {
        console.log("Usuário recusou a instalação");
      }
      setDeferredPrompt(null); // Limpa o evento
      setShowInstallPrompt(false); // Esconde o popup
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <h1>Esse é um novo PWA</h1>

      {showInstallPrompt && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-500 text-white p-4 flex justify-between items-center">
          <p>Deseja instalar este app?</p>
          <button onClick={handleInstallClick} className="bg-white text-blue-500 px-4 py-2 rounded">
            Instalar
          </button>
        </div>
      )}

      {isIOS && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-500 text-white p-4 flex justify-between items-center">
          <p>Para instalar este app, toque no ícone de compartilhar e selecione {"Adicionar à Tela Inicial"}.</p>
        </div>
      )}
    </div>
  );
}