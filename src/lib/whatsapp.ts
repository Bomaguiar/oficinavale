export const PHONE = "+351962527006";
export const PHONE_DISPLAY = "962 527 006";
export const WHATSAPP_NUMBER = "351962527006";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function bookingWhatsappLink(data: {
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  car: string;
  plate: string;
}) {
  const msg = `*Marcação Oficina Vale*
Serviço: ${data.service}
Data: ${data.date} às ${data.time}
Nome: ${data.name}
Telefone: ${data.phone}
Viatura: ${data.car}
Matrícula: ${data.plate}`;
  return whatsappLink(msg);
}
