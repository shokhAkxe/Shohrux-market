const BOT_TOKEN = "8648793669:AAHQTxhX2pt4E2oebBuA2SVQj60eWtwCHu0";
const CHAT_ID = "1705981374";

export const sendOrderToTelegram = async (cartItems, totalPrice, customerInfo) => {
    let message = `🛍 **Yangi buyurtma!**\n\n`;
    message += `👤 Mijoz: ${customerInfo.name}\n`;
    message += `📞 Tel: ${customerInfo.phone}\n`;
    message += `📍 Manzil: ${customerInfo.address}\n\n`;
    message += `📦 Mahsulotlar:\n`;

    cartItems.forEach((item) => {
        message += `- ${item.name} (${item.quantity} dona) - ${item.price * item.quantity} so'm\n`;
    });

    message += `\n💰 **Jami: ${totalPrice} so'm**`;

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        return response.ok;
    } catch (error) {
        console.error("Telegram error:", error);
        return false;
    }
};