import { redirect } from "next/navigation";

export default function CatalogRedirectPage() {
  // Foydalanuvchi "Katalog" ni bossa, u asosiy sahifaga (barcha mahsulotlar mavjud bo'lgan joyga) qaytariladi
  redirect("/");
}
