export type Product = {
  id: number;
  nameUz: string;
  nameRu: string;
  nameZh: string;
  nameEn: string;
  price: number;
  costPrice: number; // For profit tracking
  oldPrice: number | null;
  category: string;
  rating: number;
  reviews: number;
  stock: number;
  discount: number;
  image: string;
  isNew: boolean;
  isFeatured: boolean;
};

export const initialProducts: Product[] = [
  { id:1, nameUz:"Samsung Galaxy A54", nameRu:"Samsung Galaxy A54", nameZh:"三星Galaxy A54", nameEn:"Samsung Galaxy A54", price:3200000, costPrice:2800000, oldPrice:4000000, category:"electronics", rating:4.8, reviews:124, stock:15, discount:20, image:"https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80", isNew:false, isFeatured:true },
  { id:2, nameUz:"Erkaklar ko'ylagi", nameRu:"Мужская рубашка", nameZh:"男士衬衫", nameEn:"Men's Shirt", price:185000, costPrice:120000, oldPrice:250000, category:"clothing", rating:4.5, reviews:67, stock:42, discount:26, image:"https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80", isNew:true, isFeatured:false },
  { id:3, nameUz:"Oshxona to'plami", nameRu:"Набор для кухни", nameZh:"厨房套装", nameEn:"Kitchen Set", price:450000, costPrice:350000, oldPrice:null, category:"home_goods", rating:4.7, reviews:89, stock:8, discount:0, image:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80", isNew:false, isFeatured:true },
  { id:4, nameUz:"Futbol to'pi", nameRu:"Футбольный мяч", nameZh:"足球", nameEn:"Football", price:120000, costPrice:80000, oldPrice:150000, category:"sports", rating:4.3, reviews:45, stock:30, discount:20, image:"https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=80", isNew:false, isFeatured:false },
  { id:5, nameUz:"Yuz kremi", nameRu:"Крем для лица", nameZh:"面霜", nameEn:"Face Cream", price:95000, costPrice:60000, oldPrice:null, category:"beauty", rating:4.9, reviews:210, stock:55, discount:0, image:"https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80", isNew:true, isFeatured:true },
  { id:6, nameUz:"Laptop ASUS VivoBook", nameRu:"Ноутбук ASUS VivoBook", nameZh:"华硕笔记本", nameEn:"ASUS VivoBook Laptop", price:7500000, costPrice:6800000, oldPrice:8500000, category:"electronics", rating:4.6, reviews:88, stock:5, discount:12, image:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80", isNew:false, isFeatured:true },
  { id:7, nameUz:"Bolalar o'yinchoqi", nameRu:"Детская игрушка", nameZh:"儿童玩具", nameEn:"Children's Toy", price:75000, costPrice:50000, oldPrice:100000, category:"toys", rating:4.4, reviews:33, stock:25, discount:25, image:"https://images.unsplash.com/photo-1558060370-d644485927b4?w=400&q=80", isNew:true, isFeatured:false },
  { id:8, nameUz:"Sement (50 kg)", nameRu:"Цемент (50 кг)", nameZh:"水泥（50公斤）", nameEn:"Cement (50 kg)", price:65000, costPrice:55000, oldPrice:null, category:"construction", rating:4.2, reviews:19, stock:200, discount:0, image:"https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80", isNew:false, isFeatured:false },
  { id:9, nameUz:"Organik asal (1 kg)", nameRu:"Органический мёд", nameZh:"有机蜂蜜", nameEn:"Organic Honey (1 kg)", price:55000, costPrice:40000, oldPrice:70000, category:"food", rating:4.9, reviews:156, stock:80, discount:21, image:"https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80", isNew:false, isFeatured:true },
  { id:10, nameUz:"Ayollar ko'ylagi", nameRu:"Женское платье", nameZh:"女裙", nameEn:"Women's Dress", price:220000, costPrice:160000, oldPrice:280000, category:"clothing", rating:4.7, reviews:92, stock:18, discount:21, image:"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80", isNew:true, isFeatured:false },
  { id:11, nameUz:"Xiaomi akustika", nameRu:"Колонка Xiaomi", nameZh:"小米音响", nameEn:"Xiaomi Speaker", price:580000, costPrice:480000, oldPrice:680000, category:"electronics", rating:4.5, reviews:74, stock:12, discount:15, image:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80", isNew:false, isFeatured:false },
  { id:12, nameUz:"Yoga matı", nameRu:"Коврик для йоги", nameZh:"瑜伽垫", nameEn:"Yoga Mat", price:85000, costPrice:60000, oldPrice:null, category:"sports", rating:4.6, reviews:61, stock:40, discount:0, image:"https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80", isNew:true, isFeatured:false },
];

export const mockOrders = [
  {id:"ORD-1042",date:"2024-03-10",items:[{name:"Samsung Galaxy A54",qty:1,price:3200000}],total:3200000,status:"delivered"},
  {id:"ORD-1031",date:"2024-03-02",items:[{name:"Yuz kremi",qty:2,price:95000}],total:190000,status:"shipped"},
];

export const cats = ["all", "electronics", "clothing", "home_goods", "food", "sports", "beauty", "toys", "construction", "accessories"];
export const catLabels: Record<string, string> = {
  all: "Barchasi",
  electronics: "Elektronika",
  clothing: "Kiyim-kechak",
  home_goods: "Uy jihozlari",
  food: "Oziq-ovqatlar",
  sports: "Sport anjomlari",
  beauty: "Go'zallik va parvarish",
  toys: "O'yinchoqlar",
  construction: "Qurilish mollari",
  accessories: "Aksessuarlar"
};
export const catIcon: Record<string, string> = {
  all: "🛍️",
  electronics: "📱",
  clothing: "👗",
  home_goods: "🏠",
  food: "🥗",
  sports: "⚽",
  beauty: "💄",
  toys: "🧸",
  construction: "🔨",
  accessories: "💍"
};

export const fmt = (n: number) => new Intl.NumberFormat("uz-UZ").format(n) + " so'm";
export const stars = (r: number) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

// Mapper from DB snake_case to Frontend camelCase
export const mapProduct = (p: any): Product => ({
  id: p.id,
  nameUz: p.name_uz,
  nameRu: p.name_ru || p.name_uz,
  nameZh: p.name_zh || p.name_uz,
  nameEn: p.name_en || p.name_uz,
  price: Number(p.price),
  costPrice: p.cost_price || (Number(p.price) * 0.8), // Fallback if missing
  oldPrice: p.old_price || null,
  category: p.category || 'all',
  rating: p.rating || 5,
  reviews: p.reviews || 0,
  stock: p.stock || 0,
  discount: p.discount || 0,
  image: p.image,
  isNew: p.is_new || false,
  isFeatured: p.is_featured || false
});
