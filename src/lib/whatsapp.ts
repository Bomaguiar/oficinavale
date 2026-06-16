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
