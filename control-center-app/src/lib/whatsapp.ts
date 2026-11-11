import { Linking } from 'react-native';

/**
 * Opens WhatsApp with a ready message. Once the WhatsApp Business API is connected,
 * the same messages are sent automatically by a server function instead.
 */
export function openWhatsApp(phone: string | undefined, text: string) {
  const digits = String(phone ?? '').replace(/\D/g, '');
  const num = digits.length === 10 ? '91' + digits : digits;
  return Linking.openURL(`https://wa.me/${num}?text=${encodeURIComponent(text)}`);
}
