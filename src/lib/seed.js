
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cdzwtoedvrdnxghazaux.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkend0b2VkdnJkbnhnaGF6YXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MzMxMTksImV4cCI6MjA5MDIwOTExOX0.p619_rhy1A7esZ3N3PvtPPnyqeIbQfoHYrXA3UA-0VA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const productsData = [
  // Electronics
  { name_uz: "iPhone 15 Pro Max", price: 16500000, old_price: 18000000, category: "electronics", image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80", is_featured: true, variants: [{name: "Natural Titanium", image_url: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80"}, {name: "Blue Titanium"}] },
  { name_uz: "Sony WH-1000XM5 Headphones", price: 4200000, old_price: 4800000, category: "electronics", image: "https://images.unsplash.com/photo-1675243171806-2f085731777d?w=800&q=80", is_featured: false },
  { name_uz: "iPad Air M2 (2024)", price: 8900000, old_price: 9500000, category: "electronics", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80", is_featured: true },

  // Clothing
  { name_uz: "Zara Erkaklar Ko'ylagi", price: 345000, old_price: 450000, category: "clothing", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80", is_featured: true, variants: [{name: "S"}, {name: "M"}, {name: "L"}, {name: "XL"}] },
  { name_uz: "Nike Air Force 1 Low", price: 1200000, old_price: 1500000, category: "clothing", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80", is_featured: true, variants: [{name: "White", image_url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80"}, {name: "Black"}] },
  { name_uz: "H&M Ayollar Ko'ylagi (Summer)", price: 285000, old_price: 350000, category: "clothing", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80", is_featured: false },

  // Home Goods
  { name_uz: "Xiaomi Robot Vacuum S10", price: 2900000, old_price: 3200000, category: "home_goods", image: "https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?w=800&q=80", is_featured: true },
  { name_uz: "Nespresso Coffee Machine", price: 2100000, old_price: null, category: "home_goods", image: "https://images.unsplash.com/photo-1510522134121-2238423dbbb3?w=800&q=80", is_featured: false },
  { name_uz: "IKEA Stol Lampasi", price: 145000, old_price: 180000, category: "home_goods", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80", is_featured: false },

  // Food
  { name_uz: "Ferrero Rocher (24 dona)", price: 125000, old_price: 150000, category: "food", image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&q=80", is_featured: true },
  { name_uz: "Premium Coffee Beans (1 kg)", price: 245000, old_price: null, category: "food", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80", is_featured: false },
  { name_uz: "Zaytun moyi (Extra Virgin)", price: 95000, old_price: 110000, category: "food", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80", is_featured: false },

  // Sports
  { name_uz: "Apple Watch SE (2nd Gen)", price: 3400000, old_price: 3800000, category: "sports", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80", is_featured: true },
  { name_uz: "Yoga Kit (Mat + Bricks)", price: 185000, old_price: 220000, category: "sports", image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&q=80", is_featured: false },
  { name_uz: "Wilson Basketball NBA", price: 450000, old_price: 550000, category: "sports", image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&q=80", is_featured: false },

  // Beauty
  { name_uz: "Dior Sauvage Elixir", price: 1850000, old_price: 2100000, category: "beauty", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80", is_featured: true },
  { name_uz: "MAC Matte Lipstick (Red)", price: 245000, old_price: null, category: "beauty", image: "https://images.unsplash.com/photo-1586776977607-310e9c725c37?w=800&q=80", is_featured: false },
  { name_uz: "The Ordinary Hyaluronic Acid", price: 125000, old_price: 150000, category: "beauty", image: "https://images.unsplash.com/photo-1601049541289-9b1b7be71a34?w=800&q=80", is_featured: false },

  // Toys
  { name_uz: "LEGO Star Wars Millennium Falcon", price: 1450000, old_price: 1700000, category: "toys", image: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&q=80", is_featured: true },
  { name_uz: "Barbie Dreamhouse 2024", price: 2800000, old_price: null, category: "toys", image: "https://images.unsplash.com/photo-1559466273-d95e72debaf8?w=800&q=80", is_featured: false },
  { name_uz: "DJI Mini 3 Drone", price: 7800000, old_price: 8500000, category: "toys", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80", is_featured: true },

  // Construction
  { name_uz: "Bosch Professional Drill", price: 850000, old_price: 950000, category: "construction", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80", is_featured: true },
  { name_uz: "Xiaomi Wiha Screwdriver Set", price: 345000, old_price: 390000, category: "construction", image: "https://images.unsplash.com/photo-1530124560676-cb83713f0691?w=800&q=80", is_featured: false },
  { name_uz: "Qurilish kaskasi (Safety)", price: 85000, old_price: 110000, category: "construction", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80", is_featured: false },

  // Accessories
  { name_uz: "Casio G-Shock GA-2100", price: 1450000, old_price: 1700000, category: "accessories", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80", is_featured: true },
  { name_uz: "Leather Wallet (Polo)", price: 285000, old_price: 350000, category: "accessories", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80", is_featured: false },
  { name_uz: "Ray-Ban Aviator Classic", price: 1850000, old_price: 2100000, category: "accessories", image: "https://images.unsplash.com/photo-1511499767350-a1590fdb730e?w=800&q=80", is_featured: true },
];

async function seed() {
  console.log("Seeding started...");
  
  for (const item of productsData) {
    const { variants, ...p } = item;
    const { data: product, error } = await supabase.from('products').insert({
      ...p,
      name_ru: p.name_uz,
      name_en: p.name_uz,
      name_zh: p.name_uz,
      description: `Ushbu ${p.name_uz} mahsuloti yuqori sifatli va zamonaviy dizaynga ega. Uzum do'konida eng ko'p sotilgan mahsulotlardan biri.`,
      stock: 50,
      discount_percent: p.old_price ? Math.round(((p.old_price - p.price) / p.old_price) * 100) : 0,
      cost_price: p.price * 0.8
    }).select().single();

    if (error) {
      console.error(`Error inserting ${p.name_uz}:`, error.message);
      continue;
    }

    if (variants && variants.length > 0) {
      const variantsToInsert = variants.map(v => ({
        product_id: product.id,
        name: v.name,
        image_url: v.image_url || null,
        price_override: null
      }));
      const { error: vError } = await supabase.from('product_variants').insert(variantsToInsert);
      if (vError) console.error(`Error inserting variants for ${p.name_uz}:`, vError.message);
    }
  }

  console.log("Seeding completed successfully!");
}

seed().catch(err => console.error("Fatal Error:", err));
