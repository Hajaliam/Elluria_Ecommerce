# بازیابی قصد تاریخی و نقشهٔ تکمیل مهاجرت ProductVariant

تاریخ تحلیل: ۱۴۰۵/۰۸/۱۱ (2026-11-02)  
HEAD بررسی‌شده: `6dcef0906ea1328ef351d0185a974104885fed02`  
دامنه: تحلیل فقط‌خواندنی همهٔ ۲۸ commit قابل دسترس از تمام refها، بدون checkout/reset/revert/merge/commit/push و بدون اجرای Migration، Seeder یا داده

## نتیجهٔ مقایسه با پوشهٔ قبلی

پیش از تحلیل تاریخچه، نسخهٔ فعلی با `C:\Users\user\Desktop\Elluria_Ecommerce` مقایسه شد. `.git`، `docs/project-audit`، `logs`، `backups`، `uploads` و خروجی‌های متعارف تولیدی از دامنه حذف شدند.

- در هر پوشه ۱۷۳ فایل در دامنه وجود داشت؛ فایل کم یا اضافه وجود نداشت.
- ۱۷۲ فایل در hash بایتی متفاوت بودند، اما علت فقط CRLF در نسخهٔ فعلی در برابر LF در پوشهٔ قبلی بود.
- پس از نرمال‌سازی پایان‌خط، تعداد تفاوت محتوایی/منطقی صفر بود.
- بنابراین شرط ادامهٔ تحلیل تاریخچه برقرار بود.

## خلاصهٔ اجرایی

هدف تاریخیِ قابل اتکا بازگشت به Product-only نیست. خود تاریخچه نیز جهت حرکت به معماری Variant را نشان می‌دهد:

1. `ada3701` در 2025-08-07، `ProductVariant`، Attribute/Value، repository و migrationهای پایه را اضافه کرد. `ProductVariant.price` عمداً nullable تعریف شد تا از قیمت Product ارث ببرد، ولی `ProductVariant.stock_quantity` مستقل و اجباری شد.
2. `42af69a` در 2025-08-11، `CartItem` را از `product_id` به `variant_id` منتقل کرد و دادهٔ موجود سبد را حذف کرد؛ مصرف‌کننده‌های سفارش، پرداخت، گزارش و import هم‌زمان منتقل نشدند.
3. `5ebd6b1` در 2025-08-12، `OrderItem` را به `variant_id` منتقل و دادهٔ سفارش را حذف کرد؛ CartService variant-aware شد، اما payment/cleanup/report/seed همچنان Product-only ماندند.
4. `6dcef09` در 2025-08-17، OrderService را برای Variant بازنویسی و `InventoryLog.variant_id NOT NULL` را اضافه کرد؛ در همان commit validator کوپن با نام‌های ناسازگار وارد شد و تمام تولیدکنندگان قدیمی InventoryLog بدون `variant_id` شکسته شدند.

در هیچ commitی معماری Variant به‌صورت end-to-end برای محصول → سبد → سفارش → پرداخت → لغو/انقضا → موجودی → کوپن و گزارش کامل و سالم نبوده است. آخرین نقطهٔ نسبتاً منسجم legacy برای اکثر checkoutها `4e834de` (2025-08-07، آخرین commit پیش از cutover سبد) است، اما حتی آن نسخه callback امن، لغو بی‌نقص یا کنترل هم‌زمانی کامل نداشت. از آن نسخه فقط قواعد کسب‌وکار باید به Variant منتقل شوند، نه کد یا schema قدیمی.

## نقاط عطف تاریخچه

| Commit | تاریخ | اثر بازیابی‌شده |
|---|---|---|
| `657e0af` | 2025-07-15 | snapshot اولیهٔ Product-only؛ سبد/سفارش/Seederها و بسیاری از نقص‌های پایه از ابتدا حاضرند |
| `ccea7a2` | 2025-07-16 | InventoryLog و export موجودی؛ دفتر موجودی کاملاً Product-based |
| `74520da` | 2025-07-17 | callback پرداخت mock و cleanup انقضا؛ callback از ابتدا verify واقعی نداشت |
| `cf8eb96` | 2025-07-18 | قواعد کوپن و usage؛ به‌اشتباه `usage_limit` را کم می‌کند |
| `12a4e10` | 2025-07-21 | `order_id` به InventoryLog و پاک‌کردن سبد در callback |
| `ec744a3` | 2025-07-23 | اصلاحات legacy کوپن؛ نام‌های واقعی `min_amount` و `max_usage_per_user` تثبیت شدند |
| `d00609d` | 2025-07-27 | کمپین، سود، shipping/discount، sold_count و ProfitLog در پرداخت |
| `6b8e78c` / `143b34b` | 2025-08-03/04 | import و قیمت کمپین در سطح Product؛ import عمومی بدون auth |
| `4372828` | 2025-08-05 | refactor ProductService؛ `db` تعریف‌نشده و قرارداد list ناسازگار وارد شد |
| `ada3701` | 2025-08-07 | آغاز معماری Variant؛ CouponService نیز با repository APIهای ناموجود وارد شد |
| `42af69a` | 2025-08-11 | cutover مخرب CartItem به Variant |
| `5ebd6b1` | 2025-08-12 | cutover مخرب OrderItem و CartService variant-aware |
| `6dcef09` | 2025-08-17 | OrderService/InventoryLog variant-aware ناقص و CouponValidationService آزمایش‌نشده |

## قبل و بعد از مهاجرت

### قرارداد داده

| مفهوم | قبل از cutover | بعد از cutover | وضعیت فعلی |
|---|---|---|---|
| واحد کاتالوگ | Product هم مادر کاتالوگ و هم واحد فروش | Product مادر؛ ProductVariant دارای SKU/price/stock/values | جهت درست است، اما همهٔ مصرف‌کننده‌ها منتقل نشده‌اند |
| CartItem | `product_id` و association `product` | `variant_id` و association `variant` | مدل/CartService جدید؛ payment قدیمی |
| OrderItem | `product_id` و association `product` | `variant_id` و association `variant` | مدل/OrderService جدید؛ cleanup/report/import/Seeder قدیمی |
| قیمت فروش | `Product.price` | `variant.price` و fallback به `product.price` | fallback با comment migration و CartService مستند است؛ campaign precedence حل نشده |
| موجودی | `Product.stock_quantity` | `ProductVariant.stock_quantity` برای cart/order | Product stock هنوز required و در admin/search/import/ProductService فعال است؛ دو منبع حقیقت |
| InventoryLog | Product + order اختیاری | Product + variant اجباری | migration بدون FK/backfill؛ association Variant هم تعریف نشده |

### Product.price و Product.stock_quantity

- **`Product.price`: شواهد قوی برای «قیمت پایه/fallback».** migration `ada3701` صریحاً nullable بودن `ProductVariant.price` را برای ارث‌بری از Product توضیح می‌دهد و `5ebd6b1` در CartService عبارت `variant.price || variant.product.price` را وارد می‌کند. نکتهٔ طراحی جدید: استفاده از `||` قیمت صفر را نیز fallback می‌کند؛ قرارداد مطلوب باید nullish بودن را مشخص کند.
- **`Product.stock_quantity`: شواهد کافی برای نقش نهایی وجود ندارد.** بعد از `5ebd6b1` و `6dcef09`، سبد و سفارش فقط stock Variant را مصرف می‌کنند؛ هیچ کد تجمیع stock واریانت‌ها به Product وجود ندارد. در مقابل ProductService، search، low-stock report، import موجودی و Seederها هنوز Product stock را می‌نویسند/می‌خوانند. بنابراین «موجودی فروش» در Variant است، اما اینکه Product stock باید حذف، مشتق یا صرفاً legacy شود تصمیم باز است. تاریخچه از fallback موجودی پشتیبانی نمی‌کند.
- **`Product.buy_price`: تصمیم باز مرتبط.** ProfitLog و محاسبهٔ سود قدیمی buy price را از Product می‌گرفتند، ولی Variant buy price ندارد. انتقال سود بدون تصمیم دربارهٔ cost basis هر Variant ممکن نیست.

## ماتریس بازیابی جریان‌ها

عبارت «نسخهٔ منسجم» در این جدول به سازگاری ساختاری schema/association/consumer اشاره دارد، نه اثبات صحت امنیت، concurrency یا رفتار اجرایی.

| Flow | آخرین نسخه منسجم | Commit معرفی‌کننده مشکل | منطق قابل بازیابی | بخش نیازمند طراحی جدید | سطح اطمینان | شواهد |
|---|---|---|---|---|---|---|
| محصول/کاتالوگ | هیچ نسخهٔ کامل Variant؛ legacy تا `143b34b` پیش از refactor ProductService | `4372828` (F-005/F-017)، سپس `ada3701` دو منبع price/stock | sanitize، uniqueness نام/slug، transaction، campaign display، view count؛ Product به‌عنوان مادر و Variant CRUD | مرز مسئولیت Product/Variant، ایجاد default variant، قیمت مؤثر، cost basis، حذف/مشتق‌سازی Product stock | بالا | `productController`/`productService` diff در `4372828`؛ migration/model Variant در `ada3701`؛ CartService در `5ebd6b1` |
| Variant/ویژگی | هستهٔ CRUD در `42af69a` از نظر ساختاری منسجم، نه end-to-end | `ada3701` آغاز ناقص؛ `42af69a` cutover بدون مصرف‌کننده‌ها | transaction ساخت Variant، اعتبار وجود AttributeValue، جلوگیری از ترکیب تکراری، SKU، image/price override | قید DB برای uniqueness ترکیب values، default/no-attribute variant، کنترل stock و InventoryLog در create/update/delete | متوسط‌به‌بالا | `productVariantService`, `productVariantRepository`, migrations `20250807125*` |
| سبد | core Variant در `5ebd6b1`؛ هیچ نسخهٔ کاملاً سالم به‌علت F-010/F-016 | `42af69a` schema cutover؛ `5ebd6b1` validation/merge defects | cart کاربر/مهمان، expiry هفت‌روزه، ownership آیتم، include Variant→Product/values، price fallback | merge اتمیک، unique active cart، quantity integer>0، کنترل `existing+incoming<=stock`، رزرو/عدم رزرو stock | بالا | diff `42af69a` و `5ebd6b1`; `cartService:24-198` |
| ثبت سفارش | هیچ نسخهٔ کامل Variant؛ implementation پایه در `6dcef09` | `42af69a` order قدیمی را از cart جدا کرد؛ `5ebd6b1` OrderItem را شکست؛ `6dcef09` F-013/F-014 و coupon mismatch | transaction، snapshot قیمت در OrderItem، row lock هنگام کسر، InventoryLog، discount cap، shipping، first-purchase/private/product/category rules از legacy | مالکیت آدرس، یک snapshot قیمت canonical، idempotency سفارش، زمان پاک‌کردن cart، نگهداری discount/shipping/profit، lock پیش از validation | بالا | legacy `orderController` در `4e834de`; `orderService` در `6dcef09`; دو migration cutover |
| پرداخت | آخرین سازگاری schema legacy `4e834de`؛ هیچ نسخهٔ امن/کاملاً سالم | F-001 در `74520da`; ناسازگاری Variant در `42af69a`/`5ebd6b1`; cart-empty قطعی در `6dcef09` | ownership/status در initiate، paid-idempotency check، Payment record، state transition، OrderHistory، sold_count، ProfitLog، coupon usage | adapter درگاه و verify server-to-server، Authority uniqueness، lock callback، منبع فقط OrderItems، تعریف reserve→sold و retry/failure | بالا | `paymentController` history/blame؛ callback از `93d99a3` cart را می‌خواند؛ OrderService جدید cart را قبل از callback پاک می‌کند |
| لغو دستی | هیچ نسخهٔ کاملاً سالم؛ legacy structurally Product-based تا `4e834de`، Variant پایه در `6dcef09` | نقص‌های legacy از snapshot اولیه؛ انتقال ناقص در `6dcef09` | authorization، ممنوعیت وضعیت‌های نهایی، transaction، بازگرداندن stock، OrderHistory، بازگرداندن شمارندهٔ کوپن | row lock/idempotency، InventoryLog Variant، UserCouponUsage، سیاست Payment/refund، عدم حذف snapshot OrderItem | بالا | legacy cancel در `orderController`; `orderService.cancelOrder` در `6dcef09` با TODOهای صریح |
| انقضا/cleanup | `42af69a` آخرین سازگاری OrderItem قدیمی؛ هیچ نسخهٔ Variant | `5ebd6b1` (F-008)، تشدید در `6dcef09` به‌علت variant_id اجباری | cutoff 24h، وضعیت expired/failed، restore stock، InventoryLog، OrderHistory، اجرای transactionی | query/lock idempotent، Variant restore، هم‌راستایی statusهای Order و payment_status، coupon release، batch/failure policy | بالا | `orderCleanupService` تقریباً تماماً از `74520da`; OrderItem cutover در `5ebd6b1` |
| موجودی | هیچ نسخهٔ کامل Variant؛ legacy Product-only تا `4e834de` | split از `5ebd6b1`؛ `6dcef09` InventoryLog NOT NULL بدون انتقال producers | delta + old/new balance، order/user/reason metadata، reserve/sold/return/manual semantics، weighted cost rule legacy | Variant تنها ledger unit یا استثناهای product-level، FK/association، uniqueness/idempotency، cost basis، reconcile و migration داده | بالا | migrations `20250716123950` و `20250817121225`; ProductService/admin/cleanup فاقد variant؛ OrderService دارای variant |
| کوپن/تخفیف | legacy validation تا `4372828`؛ بعد از آن هیچ جریان کامل admin+checkout | `ada3701` F-018؛ `6dcef09` F-007؛ usage defect از `cf8eb96` | active/expiry، global/per-user limit، first purchase، private assignment، product/category/brand eligibility، percentage/fixed/free shipping، max discount | Product-level یا Variant-level eligibility، eligible subtotal، atomic consume/release، naming canonical، campaign stacking/exclusivity | بالا | مدل Coupon نام‌های `min_amount/max_usage_per_user/expiry_date/isActive`; validator نام‌های دیگری دارد؛ legacy order logic در `4e834de` |
| کمپین | CRUD/import Product-scoped در `143b34b`؛ هیچ نسخهٔ Variant-integrated | F-012 در `d00609d`; F-003 در `6b8e78c`; بدهی Variant از `ada3701` | date/activity، campaign price/original snapshot، جلوگیری از قیمت بالاتر، conflict کمپین فعال، bulk import | scope Product یا Variant، precedence `variant.price`/`product.price`/campaign، قیمت checkout، auth import، atomic replacement | بالا برای نقص‌ها؛ متوسط برای مدل نهایی | `campaignController` و `campaignRoutes` history؛ CampaignProduct فقط `product_id` دارد؛ CartService campaign را لحاظ نمی‌کند |
| Seeder/import/export/report | legacy تا قبل از cutover؛ هیچ نسخهٔ کامل Variant پس از `42af69a` | `42af69a`, `5ebd6b1`, `6dcef09` بدون انتقال artefactها | قالب‌ها، pagination/export format، low-stock/best-selling/profit intents | variant_id/SKU، price/cost snapshot، aggregate Product view، data conversion و backward-compatible import | بالا | Seeder سفارش همچنان `product_id`; admin import/order/report و best-selling از Product stock/OrderItem.product_id استفاده می‌کنند |

## منطق سالم قابل انتقال به Variant

### محصول، Variant و کمپین

- Product باید نام، توضیح، slug، category، brand و روابط کاتالوگ را نگه دارد؛ Variant نامزد واحد قابل فروش با SKU، values، تصویر override، price override و stock است.
- قاعدهٔ تاریخی قیمت: `effectiveBasePrice = variant.price ?? product.price`. استفاده از قیمت کمپین در checkout هرگز به Variant متصل نشده؛ precedence آن تصمیم باز است.
- قواعد campaign شامل بازهٔ فعال، original price snapshot، جلوگیری از campaign price بالاتر و جلوگیری از conflict کمپین فعال قابل انتقال‌اند. اینکه campaign در سطح Product یا Variant باشد از تاریخچه قطعی نیست.
- ProductService قدیمی منطق weighted buy price دارد، اما چون cost در Variant مدل نشده، این منطق را نباید بی‌واسطه روی Product نگه داشت یا کپی کرد.

### سبد

- کلید قلم باید `variant_id` باشد و نمایش آن از Variant→Product ساخته شود.
- ownership آیتم، cart مهمان با session، انتقال cart هنگام login و تمدید expiry قواعد معتبرند.
- قواعد ناقص که باید کامل شوند: quantity باید integer مثبت باشد؛ برای قلم موجود، مجموع قبلی و ورودی باید با stock Variant مقایسه شود؛ merge باید transactionی و conflict-aware باشد.

### سفارش و موجودی

- OrderItem باید snapshot تغییرناپذیر `variant_id`, quantity و price_at_purchase باشد. نام/ویژگی/SKU snapshot در schema فعلی وجود ندارد و تصمیم جدید لازم دارد.
- کسر stock باید روی row Variant با lock انجام شود و InventoryLog همان transaction را بگیرد.
- قواعد legacy قابل انتقال: empty-cart rejection، stock check، total/discount/shipping، Order pending/unpaid، OrderHistory، reserve ledger، جلوگیری از تخفیف بیش از subtotal و حفظ snapshot قیمت.
- reuse کردن یک pending order و `findOrCreate` روی reserve در legacy قصد idempotency را نشان می‌دهد، ولی پیاده‌سازی کامل نیست؛ قرارداد idempotency باید صریح طراحی شود.

### پرداخت

- callback نباید Cart را بخواند. منبع قطعی، Order و OrderItems snapshot هستند؛ این نتیجه هم از schema جدید و هم از پاک‌شدن cart در placeOrder به‌دست می‌آید.
- قواعد قابل انتقال: مالکیت initiate، رد paid/cancelled، انتقال unpaid/pending به paid/processing، ثبت Payment، OrderHistory، sold_count و ProfitLog و مصرف کوپن پس از موفقیت.
- هیچ verify واقعی در تاریخچه وجود ندارد. `Status=OK` و Authority ورودی هرگز منطق قابل بازیابی امن نیستند و باید با adapter درگاه و verify server-to-server طراحی شوند.

### لغو و انقضا

- restore stock، ثبت OrderHistory و InventoryLog و آزادسازی مصرف کوپن باید در یک transaction و با lock/idempotency انجام شود.
- OrderItem نباید در لغو حذف شود؛ این snapshot برای audit/payment/report لازم است. کد legacy علاوه بر این، `destroy where id=order.id` اشتباه داشت.
- current cancel فقط stock Variant و `used_count` را بازمی‌گرداند؛ InventoryLog و UserCouponUsage عمداً با TODO جا مانده‌اند. cleanup هنوز Product-only است.

### کوپن

- واژگان schema معتبر فعلی بر اساس مدل/migration عبارت‌اند از `min_amount`, `max_usage_per_user`, `expiry_date`, `isActive`, `used_count`, `usage_limit` و associationهای `products/categories/users/userUsages`.
- منطق legacy first purchase، private user، eligible product/category، max discount و free shipping قابل انتقال است، ولی ورودی eligibility باید از Variant به parent Product/category/brand نگاشت شود؛ پاس‌دادن variant IDs به لیست product IDs اشتباه است.
- مصرف باید atomically `used_count` و UserCouponUsage را افزایش دهد؛ کاهش خود `usage_limit` منطق منسوخ/غلط است.

## بخش‌های قدیمی که نباید بازگردند

- هیچ FK یا association از CartItem/OrderItem به Product، و هیچ checkout مبتنی بر `item.product_id`.
- خواندن cart در callback پرداخت یا ساخت دوبارهٔ OrderItem در callback.
- موجودی قابل فروش مستقیم روی Product، مگر اینکه تصمیم صریح آن را derived/legacy کند؛ تاریخچه fallback موجودی را تأیید نمی‌کند.
- migrationهای `bulkDelete` به‌عنوان راه تبدیل داده یا down migrationهای غیرقابل اجرا برای جدول پر.
- callback mock قابل جعل، decrement کردن `usage_limit`، حذف OrderItem هنگام لغو، و import/route عمومی بدون auth.
- Product-only seed/import/export/report به‌عنوان قرارداد نهایی. قصد گزارش‌ها حفظ می‌شود، نه ستون‌های قدیمی.
- بازگرداندن کامل `orderController` قدیمی: با وجود قواعد مفید، transaction leakهای InventoryLog، حذف اشتباه OrderItem، فقدان address ownership و نقص concurrency دارد.

## Variant Migration Completion Map

### ۱. قراردادها و تصمیم‌های باز

پیش از هر migration جدید باید این موارد تصمیم و با تست ثبت رفتار قفل شوند:

1. `Product.price` به‌عنوان base/fallback تأیید یا رد شود؛ شواهد فعلی به نفع base/fallback است.
2. `Product.stock_quantity` حذف، derived از مجموع Variantها، یا legacy read-only شود. هم‌زمان نوشتن Product و Variant قابل قبول نیست.
3. buy price/cost در سطح Variant یا Product و روش محاسبهٔ سود تعیین شود.
4. campaign scope و precedence قیمت میان Variant override، Product base و campaign تعیین شود.
5. coupon product eligibility روی parent Product باقی بماند یا variant targeting اضافه شود؛ هر دو نباید ضمنی مخلوط شوند.
6. زمان مصرف کوپن (placeOrder یا payment success) و زمان release در cancel/expire تعیین شود.
7. state machine مشترک Order/Payment و معنای reserve/sold/released تعیین شود.

### ۲. ترتیب امن تکمیل

1. **تست‌های characterization بدون تغییر schema:** effective price، cart quantity/merge، placeOrder snapshot/lock، payment retry، cancel/expire و coupon matrix.
2. **قرارداد read model:** یک resolver واحد برای Variant→Product، effective price، category/brand و snapshot سفارش؛ حذف دسترسی‌های پراکنده به Product stock.
3. **Inventory ledger:** FK/association معتبر Variant، تعریف producerهای مجاز، idempotency key و reconcile؛ سپس انتقال ProductService/admin import/cleanup/cancel.
4. **Cart:** validation تجمعی، merge transactionی و unique constraints؛ همهٔ DTOها با variantId/SKU.
5. **Order:** address ownership، lock پیش از check، snapshot کامل، عبور transaction به clearCart یا after-commit strategy و ذخیرهٔ discount/shipping/profit.
6. **Payment:** adapter واقعی، Authority uniqueness، callback lock/idempotency، فقط OrderItems، transition و ledger events.
7. **Coupon/campaign:** نام‌گذاری canonical، eligibility از parent Product و price precedence، consume/release اتمیک.
8. **Cancel/expiry:** یک orchestration مشترک Variant-aware برای restore، coupon release، InventoryLog و OrderHistory.
9. **Migration داده:** expand/backfill/verify/contract؛ هرگز bulkDelete. برای رکورد legacy بدون Variant، mapping یا quarantine صریح لازم است.
10. **Peripheral consumers:** Seederها، order/payment/inventory import، export، best-selling، low-stock، search، profit report و Swagger.

## تأیید تاریخی یافته‌های F-001 تا F-019

| یافته | نتیجهٔ تاریخی | منشأ/Commit معرفی‌کننده | توضیح |
|---|---|---|---|
| F-001 | تأیید | `74520da` | callback از اولین نسخه فقط `Status=OK` را می‌پذیرد و verify server-to-server ندارد؛ هیچ نسخهٔ سالمی در تاریخچه نیست |
| F-002 | تأیید | `42af69a` + `5ebd6b1`، قطعی‌تر در `6dcef09` | CartItem و سپس OrderItem به Variant رفتند، payment دست‌نخورده ماند؛ placeOrder جدید cart را قبل از callback پاک می‌کند |
| F-003 | تأیید | `6b8e78c` | route import بدون middleware و منطق replacement کامل در همان commit اضافه شد؛ `143b34b` فقط مسیر را rename کرد |
| F-004 | تأیید | `ccea7a2` | route خواندن آدرس با auth اختیاری و بدون ownership اضافه شد؛ refactor `ada3701` همان فرض را حفظ کرد |
| F-005 | تأیید | `4372828` | ProductService با `db.sequelize` و بدون import `db` ایجاد شد |
| F-006 | تأیید | `6dcef09` | variant_id را NOT NULL کرد، ولی ProductService، cleanup، admin import و چند producer دیگر منتقل نشدند |
| F-007 | تأیید | `6dcef09` | validator و association `usages` در commit با عنوان صریح «without testing» اضافه شد؛ نام‌ها با مدل از قبل موجود هم‌خوان نیست |
| F-008 | تأیید | `5ebd6b1` | OrderItem به Variant cutover شد، cleanup از `74520da` همچنان Product include/product_id ماند |
| F-009 | تأیید | `ada3701` | OTP service با `return this.login(user.username,user.password)` پیش از token code ایجاد شد |
| F-010 | تأیید | `5ebd6b1` | login فراخوانی `associateGuestCartToUser` را اضافه کرد، اما repository همان commit چنین متدی ندارد |
| F-011 | تأیید | `657e0af` (snapshot اولیه) | authenticateToken از ابتدا نبود token را optional می‌کرد؛ مشکل معرفی‌شدهٔ بعدی نیست |
| F-012 | تأیید | `d00609d` | `/:id` پیش از `/active` در اولین نسخهٔ campaign routes قرار گرفت |
| F-013 | تأیید | ریشه در `657e0af`؛ حفظ در `6dcef09` | legacy و OrderService جدید هر دو shippingAddressId را بدون تطبیق user می‌پذیرند |
| F-014 | تأیید | `6dcef09` | OrderService transaction دارد ولی `cartService.clearCart` transaction را دریافت نمی‌کند |
| F-015 | تأیید | `cf8eb96`؛ concurrency همچنان حل‌نشده | payment از ابتدا usage_limit را کم کرد؛ `used_count` increment و lock اتمیک وارد نشد |
| F-016 | تأیید | `5ebd6b1` | CartService فقط incoming quantity را با stock می‌سنجد و بعد به existing اضافه می‌کند؛ add نیز مثبت/صحیح بودن را چک نمی‌کند |
| F-017 | تأیید | `4372828` | service `{count,rows}` برمی‌گرداند و controller `{products,total}` destructure می‌کند |
| F-018 | تأیید | `ada3701` | CouponService هم‌زمان با repositoryها ایجاد شد ولی APIهای `findAll` مورد استفاده در Product/User repositories وجود ندارند؛ helper category نیز برای یک root نوشته شده بود |
| F-019 | تأیید | `657e0af` (snapshot اولیه) | WebSocket از اولین snapshot userId/sessionId payload را هویت می‌داند؛ `9f15e95` عمدتاً formatting/حفظ رفتار است |

تمام F-001 تا F-019 با تاریخچه تأیید شدند. برای F-011، F-013 و F-019، چون اولین commit موجود یک import اولیهٔ پروژه است، منشأ پیش از آن قابل مشاهده نیست؛ فقط می‌توان گفت نقص از ابتدای تاریخچهٔ در دسترس حاضر بوده است.

## Migration، Seeder و گزارش‌ها

### Migrationها

- migration ساخت Variant (`ada3701`) جهت درست Product parent / Variant sellable را نشان می‌دهد، اما هیچ backfill یا default variant برای Productهای موجود ندارد.
- migration CartItem (`42af69a`) و OrderItem (`5ebd6b1`) پیش از تغییر ستون تمام داده را حذف می‌کنند. down نیز برای جدول دارای داده ستون NOT NULL بدون backfill اضافه می‌کند؛ بنابراین برگشت داده‌ای قابل اتکا نیست.
- migration InventoryLog (`6dcef09`) `variant_id NOT NULL` را بدون FK، backfill، transaction یا association مدل اضافه می‌کند. حتی روی جدول دارای log قدیمی احتمال failure دارد.

### Seederها

- Seeder محصول فقط Product با price/stock می‌سازد و هیچ Variant/AttributeValue نمی‌سازد.
- Seeder سفارش/پرداخت همچنان OrderItems با `product_id` می‌سازد و Product stock را کم می‌کند. بعد از `5ebd6b1` با schema ناسازگار است.
- هیچ commit بعدی Seederها را end-to-end Variant-aware نکرده است.

### Import/export/report/search

- order import در adminController، `OrderItem.product_id` می‌نویسد؛ inventory import Product stock را تغییر می‌دهد و InventoryLog بدون variant می‌سازد.
- best-selling report، low-stock report، search availability و product exports روی Product stock/sold_count یا OrderItem.product_id هستند.
- order/payment/profit exports قصد مفیدی دارند (snapshot قیمت، revenue، profit)، اما joinها/ستون‌های sellable unit باید به Variant منتقل و در صورت نیاز در سطح Product aggregate شوند.
- campaign import عمداً Product slug/id را می‌گیرد. نگه‌داشتن آن فقط در صورتی صحیح است که تصمیم دامنه campaign را Product-scoped نگه دارد و resolver قیمت checkout آن را اعمال کند.

## محدودیت‌های تحلیل

- تاریخچه فقط ۲۸ commit و یک شاخهٔ `main`/`origin/main` هم‌مقدار دارد؛ tag یا شاخهٔ جایگزین برای منطق گمشده یافت نشد.
- بازهٔ زمانی commitها از 2025-07-15 08:57:54 +03:30 تا 2025-08-17 15:46:41 +03:30 است.
- اولین commit snapshot بزرگ پروژه است؛ برای منطق‌های حاضر از ابتدا، commit واقعیِ پیش از import قابل احراز نیست.
- هیچ تست رفتاری، dependency نصب‌شده یا DB ایزوله اجرا نشد؛ نتیجه تاریخی/ایستا است، نه اثبات runtime.
- dumpها، logها، uploadها و artefactهای تولیدی عمداً تحلیل محتوایی نشدند. migration و Seeder اجرا نشد و دادهٔ واقعی ارزیابی نشد.
- `git log --all`, `git log --follow`, `git show`, `git diff` و `git blame` روی فایل‌ها و مفاهیم درخواستی استفاده شد؛ همهٔ ۲۸ commit در inventory تاریخچه بررسی شدند و commitهای مؤثر با diff/blame عمیق‌تر بررسی شدند.

## وضعیت Git هنگام پایان تحلیل

پیش از ایجاد این سند، HEAD روی `main` برابر `6dcef09` بود و تنها `docs/` به‌صورت untracked دیده می‌شد؛ این پوشه شامل اسناد ممیزی موجودِ کاربر است. در این مرحله فقط همین فایل و یک لینک در README ممیزی تغییر داده شده‌اند. هیچ فایل کد، تنظیمات، Migration، Seeder یا داده تغییر نکرده است.
