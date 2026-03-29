import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const BOT_USERNAME = 'nixouo_bot'; // From the user's message

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, region, address, items, subTotal, deliveryFee, total, paymentMethod, lang, userId } = body;

    // 1. Save to Supabase
    // Make sure you have an 'orders' table in Supabase 
    // columns: id (uuid), name, phone, region, address, items (jsonb), total (int), status (text)
    const { data, error } = await supabase
      .from('orders')
      .insert([
        { 
          name, 
          phone, 
          region, 
          address, 
          items,
          sub_total: subTotal,
          delivery_fee: deliveryFee, 
          total, 
          status: 'pending',
          payment_method: paymentMethod || 'card',
          lang: lang || 'uz'
        }
      ])
      .select('id')
      .single();

    if (error) {
      console.error('CRITICAL: Supabase orders insert error:', error);
      // Return error to frontend for debugging
      return NextResponse.json({ 
        ok: false, 
        error: error.message,
        details: error.details,
        hint: error.hint
      }, { status: 400 });
    }

    const orderId = data.id;

    return NextResponse.json({ 
      ok: true, 
      orderId, 
      botLink: `https://t.me/${BOT_USERNAME}?start=PAY_${orderId}_${paymentMethod || 'card'}` 
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to create order' }, { status: 500 });
  }
}
