# یافته‌ها، ریسک‌ها و بدهی فنی

شدت‌ها: بحرانی = امکان دسترسی/فساد جریان اصلی؛ بالا = قابلیت اصلی شکسته یا یکپارچگی جدی؛ متوسط = رفتار ناسازگار/نگهداشت؛ پایین = کیفیت/مستندات.

| شناسه | شدت | اطمینان | یافته و اثر | شواهد | اقدام پیشنهادی |
|---|---|---|---|---|---|
| F-001 | بحرانی | بالا | callback پرداخت بدون امضای درگاه فقط با `Status=OK&orderId&Authority` سفارش را paid می‌کند؛ قابل جعل است | `src/controllers/paymentController.js:55-103` | تا اتصال واقعی، endpoint را غیرفعال یا با adapter fake فقط در test محدود کنید؛ verify server-to-server و idempotency |
| F-002 | بحرانی | بالا | payment callback بعد از مهاجرت variant هنوز `CartItem.product_id`, include `product` و `item.product` دارد؛ جریان پرداخت می‌شکند | `paymentController.js:105-172`; `src/models/cartitem.js:13-33` | پرداخت را بر اساس immutable OrderItems بازنویسی و تست ثبت رفتار اضافه کنید |
| F-003 | بحرانی | بالا | import کمپین فاقد auth است و از `/api/campaigns/:id/import-products` عمومی قابل جایگزینی کامل محصولات کمپین است | `src/routes/campaignRoutes.js:202`; `server.js:153-154`; `campaignController.js:210-218` | auth+admin+CSRF و محدودیت نوع فایل؛ route عمومی/ادمین جدا |
| F-004 | بحرانی | بالا | آدرس‌های هر کاربر با `GET /api/users/:userId/addresses` بدون مالکیت/نقش خوانده می‌شود؛ PII قابل دسترسی است | `src/routes/userRoutes.js:727`; `src/controllers/userController.js:70-74` | middleware مالکیت مشابه create و تست IDOR |
| F-005 | بالا | بالا | `ProductService` متغیر `db` را import نکرده؛ create/update محصول ReferenceError می‌دهد | `src/services/productService.js:90,137` | import صریح transaction provider؛ تست create/update |
| F-006 | بالا | بالا | `InventoryLog.variant_id` اجباری است ولی create/update محصول و چند job آن را نمی‌فرستند | `src/models/inventorylog.js:27-30`; `productService.js:113-121,185-193`; `orderCleanupService.js:55-64` | تصمیم دامنه: nullable برای تغییر سطح محصول یا الزام variant در همه مسیرها |
| F-007 | بالا | بالا | validator کوپن با schema/association هم‌نام نیست و احتمالاً پیش از محاسبه خطا می‌دهد | `couponValidationService.js:24-68`; `src/models/coupon.js:63-105`; `couponRepository.js:48-53` | واژگان یکسان، تست matrix انواع کوپن، قفل row هنگام مصرف |
| F-008 | بالا | بالا | cleanup سفارش schema قدیمی Product را include و `product_id` را مصرف می‌کند | `src/utils/orderCleanupService.js:18-64`; `src/models/orderitem.js:11-23` | restore موجودی Variant و InventoryLog متناظر در transaction |
| F-009 | بالا | بالا | OTP login پس از پاک‌کردن OTP، hash رمز را به `login` می‌دهد و قبل از token code return می‌کند؛ همیشه invalid credentials | `src/services/userService.js:225-248` | صدور مستقیم token پس از OTP؛ حذف unreachable code؛ تست |
| F-010 | بالا | بالا | login ادغام guest cart متد ناموجود `associateGuestCartToUser` را صدا می‌زند | `userService.js:73-76`; کل `src/repositories/cartRepository.js` | یک merge تراکنشی مشخص و تست conflict/stock |
| F-011 | بالا | بالا | `authenticateToken` احراز را اجباری نمی‌کند؛ routeهای order/review/shipping/user profile با نبود token به 500 می‌رسند و semantics غلط دارند | `authMiddleware.js:10-17`; نمونه `orderController.js:8` | دو middleware جدا: optionalAuth و requireAuth |
| F-012 | بالا | بالا | `GET /api/campaigns/active` بعد از `/:id` تعریف شده و توسط route admin-only قبلی گرفته می‌شود | `campaignRoutes.js:496,548` | static route را قبل از dynamic قرار دهید؛ router عمومی جدا |
| F-013 | بالا | بالا | سفارش مالکیت `shippingAddressId` را چک نمی‌کند؛ کاربر می‌تواند آدرس کاربر دیگر را مرجع کند | `orderService.js:24-79` | fetch Address با `user_id` در همان transaction |
| F-014 | بالا | بالا | پاک‌کردن سبد در placeOrder transaction را دریافت نمی‌کند؛ rollback سفارش ممکن است سبد را پاک نگه دارد | `orderService.js:26,109-116`; `cartService.js:193-198` | transaction را تا repository عبور دهید یا after-commit strategy |
| F-015 | بالا | بالا | مصرف کوپن اتمیک نیست و فیلد اشتباه را کم می‌کند (`usage_limit` به‌جای `used_count`)؛ concurrent oversubscription | `paymentController.js:181-199`; `coupon.js:71-76` | row lock، increment used_count و usage_count در یک transaction/idempotency key |
| F-016 | بالا | بالا | add-to-cart فقط quantity ورودی را با stock مقایسه می‌کند؛ در آیتم موجود مقدار تجمعی کنترل نمی‌شود و quantity منفی نیز پذیرفته می‌شود | `cartService.js:66-94` | integer>0 و existing+incoming≤stock |
| F-017 | بالا | بالا | `getAllProducts` destructuring اشتباه دارد: service `{count,rows}` می‌دهد، controller `{products,total}` می‌گیرد؛ خروجی undefined | `productService.js:42-45`; `productController.js:53-61` | قرارداد DTO واحد + test |
| F-018 | بالا | بالا | `CouponService` متدهای `productRepository.findAll` و `userRepository.findAll` را صدا می‌زند که وجود ندارند؛ category helper نیز array را به‌عنوان یک id می‌گیرد | `couponService.js:68-82`; repositories مربوط | repository API را هم‌راستا و descendant traversal را برای چند root اصلاح کنید |
| F-019 | بالا | بالا | AI Socket هویت `userId/sessionId` را از payload قابل جعل می‌پذیرد؛ تاریخچه متعلق به دیگران قابل تزریق و پیام به حساب دیگر ذخیره می‌شود | `server.js:172-230`; `ws_test.html:119-164` | JWT/cookie handshake، server-side identity، validation schema |
| F-020 | بالا | بالا | Seed شامل credential آزمایشی ثابت است؛ اگر اجرا شود حساب قابل حدس می‌سازد | `seeders/20250712114902-add-sample-products-categories.js:7-35` | credential از secret تست یا حذف admin seed؛ rotate هر محیطی که اجرا شده |
| F-021 | متوسط | بالا | migration تغییر CartItem/OrderItem تمام داده‌ها را bulkDelete می‌کند؛ migration مخرب و برگشت‌ناپذیر داده‌ای | `migrations/20250811150056...:5-29`; `20250812154540...:5-27` | migration تبدیل داده/backup و preflight؛ هرگز روی production بدون برنامه |
| F-022 | متوسط | بالا | Seeder سفارش پس از migration variant هنوز `product_id` می‌نویسد و شکست می‌خورد | `seeders/20250712115035...:87-150`; migration variant | Seeder variant-aware یا نسخه‌بندی fixture |
| F-023 | متوسط | بالا | وضعیت سفارش/پرداخت/ارسال string آزاد است؛ transitionهای معتبر enforce نمی‌شوند و admin هر status می‌پذیرد | `order.js:42-44`; `orderService.js:153-170`; `shipmenttracking.js:29-33` | enum/state machine و transition table |
| F-024 | متوسط | بالا | Campaign رابطهٔ M:N و `Product.campaign_id` را همزمان نگه می‌دارد؛ محصول می‌تواند در چند campaignProduct ولی یک campaign_id باشد | `product.js:15-18,66-69`; `campaign.js:8-14`; `campaignController.js:126-143` | یک منبع حقیقت انتخاب کنید |
| F-025 | متوسط | بالا | order fields `discount_amount` و `shipping_cost` محاسبه می‌شوند ولی هنگام create ذخیره نمی‌شوند؛ سود کلی نیز پر نمی‌شود | `orderService.js:47-79`; `order.js:46-48` | snapshot کامل محاسبات سفارش |
| F-026 | متوسط | بالا | first-purchase و exclusive/group در مدل/CRUD وجود دارند ولی validator آن‌ها را اعمال نمی‌کند | `coupon.js:83-100`; `couponService.js:24-49`; کل validator | قواعد صریح و test matrix؛ تا آن زمان «کد موجود، رفتار اثبات‌نشده» |
| F-027 | متوسط | بالا | Search `maxRating` را با `>=` اعمال می‌کند و raw literal می‌سازد؛ parseFloat NaN نیز ممکن است SQL نامعتبر دهد | `searchController.js:71-86` | operator درست `<=`، bind/Sequelize expression، validation |
| F-028 | متوسط | بالا | category tree از `item.parent_id === parentId` استفاده می‌کند؛ raw DB id سازگار است، اما cycleهای چندگرهی هنگام update منع نمی‌شوند | `categoryService.js:40-52,119-126` | cycle detection و FK/transaction |
| F-029 | متوسط | بالا | `OrderHistory.description` در controllerها ارسال می‌شود ولی در model/migration تعریف نیست و audit علت از دست می‌رود | `shippingController.js:49-56,122-128`; `orderhistory.js:18-27` | افزودن migration/field یا حذف ادعای ثبت توضیح |
| F-030 | متوسط | بالا | بکاپ نام DB توسعه را در همه محیط‌ها می‌گیرد، command را با interpolation shell می‌سازد، و API پیش از پایان `exec` موفقیت می‌دهد | `backupService.js:10-49,93-101` | spawn با args، DB بر اساس env، Promise و status واقعی |
| F-031 | متوسط | بالا | `start_frontend_dev.js` کل ریشه را static serve می‌کند؛ backup/log/source قابل دانلود محلی است | `start_frontend_dev.js:7-8` | فقط پوشه public/test client |
| F-032 | متوسط | بالا | logها شماره تلفن، session id، متن chat و جزئیات request را ثبت می‌کنند؛ retention/redaction ندارد | `server.js:96-99,178-183`; `smsService.js:24-32`; logger | redaction، rotation، retention، عدم log محتوا/PII |
| F-033 | متوسط | متوسط | package وابستگی‌های استفاده‌نشده/قدیمی دارد (`openai`, `groq-sdk`, `axios`, `csv`, `validator`) و csurf deprecated ecosystem است | `package.json:12-43`; imports جست‌وجوشده | dependency audit بعد از تثبیت رفتار |
| F-034 | متوسط | بالا | config ESLint شامل comment در JSON و config سبک eslintrc برای ESLint 9 است؛ lint احتمالاً قابل اجرا نیست | `.eslintrc.json:1-15`; `package.json` | flat config معتبر؛ بدون `lint:fix` در مرحله ممیزی |
| F-035 | متوسط | بالا | route history advice وجود دارد ولی در server mount نشده؛ کد موجود بدون مسیر اجرا | `src/routes/onlineShoppingAdviceRoutes.js`; نبود import/mount در `server.js:20-50,138-159` | تصمیم حذف یا mount با auth درست |
| F-036 | پایین | بالا | README و package main/start وضعیت واقعی را معرفی نمی‌کنند | `README.md`; `package.json:4-10` | README عملیاتی و scripts start/dev |
| F-037 | پایین | بالا | controller admin حدود ۳۱۰۵ خط و route آن ۱۴۹۱ خط است؛ import/export/report و user admin در یک فایل | فایل‌های مذکور | پس از characterization به use-caseهای کوچک تقسیم شود |

## کد ظاهراً بلااستفاده

- `src/utils/InventoryLogService.js`: snippet با top-level operation و متغیرهای آزاد؛ هیچ require/import مصرف‌کننده ندارد.
- `onlineShoppingAdviceRoutes.js`: mount نشده.
- `adminController.getSalesReport`, `getLowStockProducts`, `getDashboardStats`: export شده‌اند اما route مستقیم ندارند؛ بخشی از منطق مشابه داخل `exportReports` تکرار شده است.
- repositoryهای `couponCategoryRepository`, `couponProductRepository`, `userCouponRepository` مصرف مستقیمی در مسیرهای فعلی ندارند؛ association methods جای آن‌ها را گرفته‌اند.
- `structure.txt` snapshot قدیمی ساختار است و با وضعیت فعلی یکی نیست.

روش بررسی: جست‌وجوی require/import، route mount و symbol references. اطمینان «بالا برای اتصال داخلی مخزن» است، اما dynamic require خارجی یا مصرف خارج از این پوشه قابل رد قطعی نیست.

## تست و observability

هیچ فایل test و هیچ runner واقعی وجود ندارد. `npm test` یک placeholder است. تنها تأیید انجام‌شده `node --check` برای ۱۶۰ JS بود. لاگ file/console وجود دارد ولی correlation id، redaction، rotation و metrics/health endpoint دیده نشد.
