-- Order jadvaliga to'lov ma'lumotlari qo'shish
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT DEFAULT 'cash';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentMonths" INTEGER;

-- Eski status qiymatlarini yangilash (agar kerak bo'lsa)
UPDATE "Order" SET "paymentMethod" = 'cash' WHERE "paymentMethod" IS NULL;
