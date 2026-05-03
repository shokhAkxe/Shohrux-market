const BOT_TOKEN = "8648793669:AAHQTxhX2pt4E2oebBuA2SVQj60eWtwCHu0";
const CHAT_ID = "1705981374";

export const sendOrderToTelegram = async (cartItems, totalPrice, customerInfo) => {
  const date = new Date();
  const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

  let message = `🛍 *YANGI BUYURTMA!*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📅 *Vaqt:* ${formattedDate}\n\n`;
  message += `👤 *MIJOZ:* ${customerInfo.name}\n`;
  message += `📞 *TEL:* ${customerInfo.phone}\n`;
  message += `📍 *MANZIL:* ${customerInfo.address}\n`;
  message += `💳 *TO'LOV:* ${
    customerInfo.paymentMethod === "cash"
      ? "Naqd pul"
      : customerInfo.paymentMethod === "card"
      ? "Plastik karta"
      : `Bo'lib to'lash (${customerInfo.months} oy)`
  }\n\n`;
  message += `📦 *MAHSULOTLAR:*\n`;
  cartItems.forEach((item, idx) => {
    const name = item.nomi.uz;
    const total = item.narxi * (item.quantity || 1);
    message += `${idx + 1}. ${name} x${item.quantity || 1} = ${total.toLocaleString()} so'm\n`;
  });
  message += `\n💰 *JAMI:* ${totalPrice.toLocaleString()} so'm\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n✅ *Buyurtma qabul qilindi!*`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: "Markdown" }),
    });
    return res.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
};