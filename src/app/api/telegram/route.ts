import { NextRequest, NextResponse } from 'next/server';
import { initialProducts, fmt } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { BotT, Language } from '@/lib/translations';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Helper to format order details based on language saved in DB
function formatOrderDetails(order: any) {
  const lang = (order.lang || 'uz') as Language;
  const bt = BotT[lang] || BotT.uz;
  
  const getName = (item: any) => {
    if (lang === 'ru') return item.nameRu;
    if (lang === 'zh') return item.nameZh;
    if (lang === 'en') return item.nameEn;
    return item.nameUz;
  };

  let text = `<b>${bt.orderNum}:</b> #${order.id.slice(0, 8)}\n`;
  text += `<b>${bt.customer}:</b> ${order.name}\n`;
  text += `<b>${bt.phone}:</b> ${order.phone}\n`;
  text += `<b>${bt.address}:</b> ${order.region}, ${order.address}\n\n`;
  
  text += `<b>${bt.items}:</b>\n`;
  order.items.forEach((item: any, i: number) => {
    text += `${i + 1}. ${getName(item)} x ${item.qty} = ${fmt(item.price * item.qty)}\n`;
  });
  
  text += `\n<b>${bt.prices}:</b>\n`;
  text += `${bt.products}: ${fmt(order.sub_total || 0)}\n`;
  text += `${bt.delivery}: ${order.delivery_fee === 0 ? "Free" : fmt(order.delivery_fee || 0)}\n`;
  text += `\n<b>${bt.total}:</b> ${fmt(order.total || 0)}\n`;
  return text;
}

async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      reply_markup: replyMarkup
    })
  });
}

async function sendPhoto(chatId: number, photo: string, caption?: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photo,
      caption: caption,
      parse_mode: 'HTML'
    })
  });
}

async function sendMediaGroup(chatId: number, media: any[]) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMediaGroup`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      media: media
    })
  });
}

async function forwardPhoto(chatId: number, messageId: number, toChatId: number) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/forwardMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: toChatId,
      from_chat_id: chatId,
      message_id: messageId
    })
  });
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // Custom Notification from Admin Panel
    if (update.type === 'notify_status') {
      const { orderId, status } = update;
      const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
      if (!order || !order.telegram_chat_id) return NextResponse.json({ ok: false });

      const lang = (order.lang || 'uz') as Language;
      const bt = BotT[lang] || BotT.uz;

      if (status === 'processing') {
        await sendMessage(order.telegram_chat_id, bt.assembling);
      } else if (status === 'resubmit') {
        const remaining = 3 - (order.receipt_attempts || 0);
        if (remaining <= 0) {
           await sendMessage(order.telegram_chat_id, bt.blockedAttempts);
           await supabase.from('orders').update({ status: 'rejected' }).eq('id', orderId);
        } else {
           const msg = bt.resubmitRequest.replace('{n}', remaining.toString());
           await sendMessage(order.telegram_chat_id, msg);
           await supabase.from('orders').update({ status: 'pending' }).eq('id', orderId);
        }
      }
      return NextResponse.json({ ok: true });
    }

    // Handle Photos (Receipts)
    if (update.message && update.message.photo) {
      const chatId = update.message.chat.id;
      const messageId = update.message.message_id;
      const fileId = update.message.photo[update.message.photo.length - 1].file_id;

      // Find the most recent order that needs a receipt (pending or verifying)
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('telegram_chat_id', chatId)
        .in('status', ['pending', 'verifying'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (order) {
        const lang = (order.lang || 'uz') as Language;
        const bt = BotT[lang] || BotT.uz;
        
        const newAttempts = (order.receipt_attempts || 0) + 1;
        
        if (newAttempts > 3) {
          await sendMessage(chatId, bt.blockedAttempts);
          await supabase.from('orders').update({ status: 'rejected' }).eq('id', order.id);
          return NextResponse.json({ ok: true });
        }

        try {
          const { error: updateErr } = await supabase.from('orders').update({ 
            receipt_file_id: fileId, 
            status: 'verifying',
            receipt_attempts: newAttempts 
          }).eq('id', order.id);

          if (updateErr) {
            console.error("⚠️ Supabase Update Error (Attempt 1):", updateErr.message);
            // Fallback: Try without receipt_attempts column
            await supabase.from('orders').update({ 
              receipt_file_id: fileId, 
              status: 'verifying' 
            }).eq('id', order.id);
          }
        } catch (err: any) {
          console.error("❌ Critical Update Error:", err.message);
        }

        await sendMessage(chatId, bt.receiptSuccess);

        if (ADMIN_CHAT_ID) {
            let adminMsg = `🔔 <b>${bt.adminNewReceipt}</b>\n\n`;
            adminMsg += formatOrderDetails(order);
            adminMsg += `\nAttempts: ${newAttempts}/3\n${bt.adminCheckReceipt}`;
            await sendMessage(Number(ADMIN_CHAT_ID), adminMsg);
            await forwardPhoto(chatId, messageId, Number(ADMIN_CHAT_ID));
        }
      } else {
        await sendMessage(chatId, BotT.uz.orderNotFound);
      }
      return NextResponse.json({ ok: true });
    }

    // Handle Text Messages
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      if (text.startsWith('/start PAY_')) {
        const parts = text.split('_');
        const orderId = parts[1];
        const paymentType = parts[2] || 'card';
        
        // Link this User's chat to their order in Supabase
        await supabase.from('orders').update({ telegram_chat_id: chatId }).eq('id', orderId);

        // Fetch Order Details
        const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
        
        if (!order) {
           await sendMessage(chatId, `❌ Order not found (#${orderId})`);
           return NextResponse.json({ ok: true });
        }

        const lang = (order.lang || 'uz') as Language;
        const bt = BotT[lang] || BotT.uz;
        const orderText = formatOrderDetails(order);

        // Prepare Media Group for products (only if images are valid URLs)
        const media = order.items
          .filter((item: any) => item.image && item.image.startsWith('http'))
          .map((item: any, idx: number) => ({
            type: 'photo',
            media: item.image,
            caption: idx === 0 ? orderText : undefined,
            parse_mode: 'HTML'
          })).slice(0, 10);

        if (media.length > 0) {
          try {
            await sendMediaGroup(chatId, media);
          } catch (err: any) {
            console.error("❌ Media group error:", err.message);
            await sendMessage(chatId, orderText); // Fallback to text only
          }
        } else {
          await sendMessage(chatId, orderText);
        }

        if (paymentType === 'click') {
          const clickLink = `https://my.click.uz/services/pay?service_id=YOUR_SERVICE_ID&merchant_id=YOUR_MERCHANT_ID&amount=${order.total}&transaction_param=${orderId}`;
          await sendMessage(
            chatId,
            `❗️ <b>${bt.payMethodClick}</b>\n${bt.clickMsg}`,
            { inline_keyboard: [[{ text: "💸 CLICK", url: clickLink }]] }
          );
        } else {
          await sendMessage(
            chatId,
            `💳 <b>${bt.payMethodCard}</b>\n\n${bt.cardMsg}`
          );
        }
        
        if (ADMIN_CHAT_ID) {
          let adminStartMsg = `${bt.adminNewOrder}\n\n`;
          adminStartMsg += orderText;
          adminStartMsg += `\n${bt.waitPayment}`;
          
          if (media.length > 0) {
            // Re-map media for admin without the caption in the first items (or with it)
            const adminMedia = media.map((m: any, idx: number) => ({
                ...m,
                caption: idx === 0 ? adminStartMsg : undefined
            }));
            await sendMediaGroup(Number(ADMIN_CHAT_ID), adminMedia);
          } else {
            await sendMessage(Number(ADMIN_CHAT_ID), adminStartMsg);
          }
        }

      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram API Error:', error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
