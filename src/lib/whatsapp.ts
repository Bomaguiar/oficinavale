export const PHONE = "+351962527006";
export const PHONE_DISPLAY = "962 527 006";
export const WHATSAPP_NUMBER = "351962527006";

export function whatsappLink(message: string) {
  const text = encodeURIComponent(message);
  // On desktop, wa.me redirects to api.whatsapp.com which is blocked on some
  // corporate / school networks. Route desktop users straight to web.whatsapp.com
  // and keep wa.me (the app-deeplink host) for mobile.
  if (typeof navigator !== "undefined") {
    const ua = navigator.userAgent || "";
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
    if (!isMobile) {
      return `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${text}&type=phone_number&app_absent=0`;
    }
  }
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function bookingWhatsappLink(data: {
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email?: string;
  car: string;
  plate: string;
}) {
  const msg = `*Marcação Oficina Vale*
Serviço: ${data.service}
Data: ${data.date} às ${data.time}
Nome: ${data.name}
Telefone: ${data.phone}${data.email ? `\nEmail: ${data.email}` : ""}
Viatura: ${data.car}
Matrícula: ${data.plate}`;
  return whatsappLink(msg);
}

export function vanRentalWhatsappLink(data: {
  van: string;
  date: string;
  startTime: string;
  hours: number;
  outsideRadius: boolean;
  price: number;
  name: string;
  phone: string;
}) {
  const msg = `*Aluguer de Carrinha — Oficina Vale*
Carrinha: ${data.van}
Data: ${data.date} a partir das ${data.startTime}
Duração: ${data.hours}h
Fora do raio de 50 km: ${data.outsideRadius ? "Sim (+10€)" : "Não"}
Valor estimado: ${data.price}€
Nome: ${data.name}
Telefone: ${data.phone}

Vou enviar os documentos necessários: Cartão de Cidadão ou Passaporte, Carta de Condução e Comprovativo de Morada.`;
  return whatsappLink(msg);
}
