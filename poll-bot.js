const https = require('https');
const http = require('http');

// Tokenni avtomatik .env.local faylidan olamiz yoki to'g'ridan to'g'ri kiritamiz
const token = "7958005935:AAE2Hl_8xY3mLMpv4Mx9D-1XzqMMA0XkZEE";
let lastUpdateId = 0;

console.log("Local Telegram Bot Poller ishga tushdi... (Saytingizni bot bilan ulamoqda)");

function poll() {
  https.get(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.ok && json.result.length > 0) {
          json.result.forEach(update => {
            lastUpdateId = update.update_id;
            console.log(`[${new Date().toLocaleTimeString()}] Yangi xabar! Next.js ga forward qilinmoqda...`);
            
            // Forward to Next.js API
            const req = http.request('http://localhost:3000/api/telegram', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            }, (apiRes) => {
              console.log("✅ Next.js API qabul qildi, status:", apiRes.statusCode);
            });
            req.on('error', (e) => console.error("❌ Xatolik:", e.message));
            req.write(JSON.stringify(update));
            req.end();
          });
        }
      } catch (err) {}
      poll();
    });
  }).on('error', (err) => {
    setTimeout(poll, 2000);
  });
}

// Delete any existing webhook to allow getUpdates to work
https.get(`https://api.telegram.org/bot${token}/deleteWebhook`, (res) => {
  console.log("Eski Webhook tozalandi, xabarlar kutilmoqda...");
  poll();
});
