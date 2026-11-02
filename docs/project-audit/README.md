# ممیزی وضعیت پروژه Elluria / Lamora

تاریخ ممیزی: ۱۴۰۵/۰۸/۱۱ (2026-11-02)  
دامنه: همهٔ فایل‌های موجود در ریشهٔ `Elluria_Ecommerce`، بدون تغییر کد یا داده

## جمع‌بندی مدیریتی

این مخزن یک بک‌اند فروشگاه اینترنتی Node.js/Express با PostgreSQL و Sequelize است. دامنه‌های پیاده‌سازی‌شده شامل کاربر و احراز هویت، کاتالوگ و دسته‌بندی/برند، ویژگی و تنوع محصول، سبد، سفارش، کوپن، کمپین، پرداخت شبیه‌سازی‌شده، ارسال، نظر، گزارش/ورود‌وخروج فایل، تنظیمات، گفت‌وگوی AI و Jobهای بکاپ/انقضای سفارش است. نقطهٔ ورود فعال `server.js` و API بدون version prefix زیر `/api` است.

وضعیت کلی «نمونهٔ بک‌اند گسترده اما ناپایدار و ناسازگار پس از مهاجرت از Product به ProductVariant» ارزیابی می‌شود. بخش‌هایی مانند خواندن کاتالوگ، CRUDهای ساده، ساخت کمپین و نمایش داده از نظر ایستا مسیر کامل دارند؛ ولی چند جریان حیاتی در وضعیت فعلی قابل اتکا نیستند:

- `ProductService.createProduct/updateProduct` از متغیر تعریف‌نشدهٔ `db` استفاده می‌کند و ثبت `InventoryLog` نیز `variant_id` اجباری را نمی‌فرستد (`src/services/productService.js:90`, `src/models/inventorylog.js:27`).
- اعتبارسنجی کوپن نام ستون‌ها و associationهایی را به‌کار می‌برد که در مدل وجود ندارند (`start_date`, `end_date`, `usage_limit_per_user`, `min_order_amount`, `usages`) و شناسهٔ variant را به‌جای product دریافت می‌کند (`src/services/couponValidationService.js:18-68`, `src/repositories/couponRepository.js:48-53`, `src/services/orderService.js:35-53`).
- callback پرداخت هنوز با ساختار قدیمی `CartItem.product_id` و association `product` کار می‌کند، درحالی‌که مدل فعلی `variant_id`/`variant` است؛ افزون بر آن callback هیچ تأیید واقعی درگاه ندارد (`src/controllers/paymentController.js:55-200`, `src/models/cartitem.js:13-33`).
- Job انقضای سفارش نیز `OrderItem.product`/`product_id` قدیمی را مصرف می‌کند (`src/utils/orderCleanupService.js:18-64`, `src/models/orderitem.js:11-23`).
- مسیر عمومی کمپین فعال عملاً پشت `/:id` قرار گرفته و قابل رسیدن نیست؛ در مقابل import محصولات کمپین فاقد احراز هویت است و از هر دو mount عمومی/ادمین قابل فراخوانی است (`src/routes/campaignRoutes.js:202,496,548`, `server.js:153-154`).
- Middleware اصلی JWT بدون توکن درخواست را عبور می‌دهد؛ بنابراین routeهایی که فقط `authenticateToken` دارند واقعاً اجباری نیستند و غالباً با dereference کردن `req.user` به 500 می‌رسند (`src/middlewares/authMiddleware.js:10-17`).

## سطح تأیید

- **تأیید ایستا:** تمام ۱۶۰ فایل JavaScript با `node --check` بررسی نحوی شدند؛ صفر خطای Parse.
- **تأیید اجرایی:** انجام نشد. `node_modules` موجود نیست، تستی وجود ندارد، اسکریپت `npm test` فقط خطا برمی‌گرداند، و اجرای سرور نیازمند PostgreSQL و Gemini/ایمیل/SMS است. مطابق محدودیت ممیزی، dependency نصب، Migration/Seeder، DB، درگاه، ایمیل، SMS و AI اجرا نشد.
- **Git:** پوشه `.git` ندارد؛ branch، تغییرات قبلی و history قابل احراز نیست.

## وضعیت تکمیل حوزه‌ها

| حوزه | ارزیابی | توضیح کوتاه |
|---|---|---|
| کاربران/نقش‌ها | ناقص و پرریسک | ثبت‌نام و ورود رمز مسیر دارند؛ OTP شکسته، refresh endpoint ندارد، خواندن آدرس IDOR دارد |
| کاتالوگ | ناقص | خواندن محتمل؛ create/update محصول به‌علت `db` تعریف‌نشده خراب |
| تنوع/ویژگی | نسبتاً کامل ایستا | CRUD و روابط وجود دارد؛ قیود ترکیب ویژگی و ثبت انبار ناقص |
| سبد | ناقص | منطق variant دارد؛ ادغام هنگام login متد repository گمشده و افزایش آیتم موجود سقف موجودی را دور می‌زند |
| سفارش | ناقص/بحرانی | رزرو موجودی تراکنشی است؛ آدرس مالکیت چک نمی‌شود، پاک‌کردن سبد بیرون تراکنش است، کوپن شکسته |
| پرداخت | Mock و ناسازگار | URL شبیه‌سازی؛ callback قابل جعل و وابسته به schema قدیمی |
| کوپن | مدل غنی، اجرای شکسته | percentage/fixed/free_shipping تعریف شده، اما validator با مدل هم‌نام نیست |
| کمپین | فعال با رخنهٔ دسترسی | CRUD و import پیاده شده؛ route ordering و auth import بحرانی |
| ارسال | ناقص | ایجاد/به‌روزرسانی تراکنشی؛ status آزاد و history description ذخیره نمی‌شود |
| گزارش/import/export | گسترده ولی کم‌آزمون | پنل ادمین محافظت شده؛ controller بسیار بزرگ و قراردادها پراکنده |
| AI chat | فعال مشروط | Socket.IO + Gemini؛ هویت payload قابل جعل و تاریخچه در RAM است |
| Job/Backup | فعال مشروط | cron تعریف شده؛ DB توسعه hard-code معنایی، command shell و پاسخ زودهنگام بکاپ |

## راهنمای گزارش‌ها

- [فهرست فایل‌ها](./file-inventory.md)
- [معماری و راه‌اندازی](./architecture.md)
- [کاتالوگ دامنه](./domain-catalog.md)
- [کاتالوگ قابلیت‌ها](./feature-catalog.md)
- [کاتالوگ API](./api-catalog.md)
- [جریان‌های کسب‌وکار](./business-flows.md)
- [یافته‌ها و ریسک‌ها](./findings.md)
- [نقشهٔ راه](./roadmap.md)
- [بازیابی قصد تاریخی و نقشهٔ تکمیل مهاجرت ProductVariant](./history-recovery.md)
- [Baseline مرحلهٔ 0B: Test Harness و Smoke Boot ایزوله](./test-harness-baseline.md)

## پوشش

فهرست اولیه شامل ۱۸۶ فایل بود: ۱۶۰ JavaScript، ۷ تصویر، ۳ dump دیتابیس، ۳ log و ۱۳ فایل تنظیم/متن/IDE دیگر. همهٔ فایل‌های کد، route، controller، service، repository، model، Migration، Seeder و تنظیمات بررسی شدند. تصاویر باینری کنار گذاشته شدند؛ logها و dumpها فقط از نظر وجود/اندازه/ریسک داده‌ای طبقه‌بندی شدند و محتوایشان برای جلوگیری از افشای داده بازنشر نشد. با ۹ سند این ممیزی، شمار فایل‌ها در پایان ۱۹۵ است. مورد باقی‌مانده برای «اثبات عملی رفتار» اجرای ایزوله با DB تست و سرویس‌های fake است، نه خواندن فایل.

## اولین گام پیشنهادی

پیش از هر ریفکتور ساختاری، یک محیط تست PostgreSQL ایزوله و تست‌های ثبت رفتار برای ثبت‌نام/ورود، محصول/variant، سبد→سفارش→پرداخت و کوپن بسازید. سپس یافته‌های بحرانی `F-001` تا `F-008` را به‌صورت اصلاح رفتار جدا از جابه‌جایی فایل‌ها رفع کنید.
