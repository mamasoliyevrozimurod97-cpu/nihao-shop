@echo off
chcp 65001 >nul
echo ==============================================
echo   NIHAO SHOP MOBIL ILOVASINI YANGILASH
echo ==============================================
echo.

cd /d "C:\Users\MAG GADJET\Desktop\dasutr\internt sayt\nihao-shop"

echo [1/3] Eski keshlarni tozalash boshlandi...
if exist out rmdir /s /q out
if exist .next rmdir /s /q .next
echo ✅ Keshlar tozalandi.
echo.

echo [2/3] Yangi dizaynni Android uchun yig'ish (build)...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ❌ XATOLIK: Kodingizni yig'ishda qandaydir muammo yuz berdi!
    pause
    exit /b %errorlevel%
)
echo.

echo [3/3] Yangi fayllarni Android Studio'ga ko'chirish (sync)...
call npx cap sync android
if %errorlevel% neq 0 (
    echo.
    echo ❌ XATOLIK: Android bilan sinxronlashda muammo yuz berdi!
    pause
    exit /b %errorlevel%
)

echo.
echo ==============================================
echo ✅ MUVAFFAQIYATLI YAKUNLANDI!
echo Eski qizil oyna to'liq o'chirildi va yangi oq dizayn yuklandi.
echo Endi Android Studio'ga kirib yangi APK yaratsangiz bo'ladi!
echo ==============================================
pause
