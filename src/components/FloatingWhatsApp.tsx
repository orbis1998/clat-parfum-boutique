import { MessageCircle } from "lucide-react";
import { useStore } from "@/lib/store";

export function FloatingWhatsApp() {
  const whatsapp = useStore((s) => s.settings.whatsapp) ?? "";
  const href = `https://wa.me/${String(whatsapp).replace(/\D/g, "")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#19110b] text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition hover:scale-105 active:scale-95 md:bottom-8 md:right-8"
    >
      <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
    </a>
  );
}
