# کاتالوگ دامنه و موجودیت‌ها

همهٔ مدل‌ها Sequelize با `timestamps: true` هستند مگر خلافش ذکر شود. `id` عدد صحیح auto-increment ضمنی است، جز join modelهایی که در مدل composite PK تعریف کرده‌اند. هیچ soft-delete/paranoid وجود ندارد. statusها STRING آزادند و enum دیتابیسی ندارند.

## هویت و مشتری

### D-001 Role — نقش

- ذخیره: `Roles`؛ مدل `src/models/role.js:14-29`، migration `20250710193743...:12-34`.
- فیلد: `name STRING(50) NOT NULL UNIQUE`؛ seed مقادیر واقعی `customer`, `admin` (`seeders/20250711105849...:6-42`).
- رابطه: hasMany User. حذف role دارای user در migration `RESTRICT` است.
- استفاده: register نقش customer را lookup می‌کند؛ authorization نام role را از DB می‌خواند.
- وضعیت: فعال؛ وابستگی خطرناک به فرض عددی role_id=2 در order/payment نیز وجود دارد.

### D-002 User — حساب کاربر

- ذخیره: `Users`؛ `src/models/user.js:57-116`.
- فیلدها: `username STRING(50) NOT NULL UNIQUE`، `email STRING(100) NOT NULL UNIQUE` با validation ایمیل، `password TEXT NOT NULL`، `first_name/last_name STRING(100) NOT NULL`، `phone_number STRING(20) NULL`، `role_id INT NOT NULL`، reset token unique/expiry nullable، OTP کد ۶حرفی/expiry nullable.
- روابط: Role؛ hasMany Address/Cart/Order/Review/Advice/OrderHistory؛ belongsToMany Coupon از UserCoupon (`user.js:8-50`).
- عملیات: ثبت‌نام، login، profile، admin CRUD، reset و OTP. bcrypt hash با cost 10؛ access و refresh JWT صادر می‌شوند ولی refresh مصرف نمی‌شود (`userService.js:32-92`).
- حذف: سخت؛ FKهای وابسته ترکیبی از CASCADE/RESTRICT/SET NULL.
- وضعیت: login رمز فعال؛ OTP ناقص `F-009`؛ credential seed خطرناک `F-020`.

### D-003 Address — آدرس ارسال

- `Addresses`؛ `address.js:18-37`.
- فیلدها: `user_id INT NOT NULL`، street TEXT، city/state/country STRING(100)، zip STRING(20)، همگی required؛ `is_default BOOLEAN NOT NULL=false`.
- User belongsTo و Order hasMany از `shipping_address_id`.
- قاعده: هنگام ساخت default، defaultهای قبلی کاربر false می‌شوند، بدون transaction (`userService.js:134-149`). uniqueness DB برای یک default وجود ندارد.
- وضعیت: create/list فعال ایستا؛ list IDOR و ownership order ناقص.

## کاتالوگ

### D-004 Category — درخت دسته‌بندی

- `Categories`; `category.js:31-50`.
- `name STRING(100) NOT NULL UNIQUE`, `description TEXT NULL`, `parent_id INT NULL` self-FK با SET NULL.
- روابط: parent/children، hasMany Product/CouponCategory، M:N Coupon.
- قواعد: parent باید موجود و نه خود باشد؛ descendant cycle چندسطحی منع نشده؛ read tree recursive (`categoryService.js:13-142`).
- وضعیت: CRUD فعال ایستا.

### D-005 Brand — برند

- `Brands`; `brand.js:20-33`: `name STRING NOT NULL UNIQUE`.
- hasMany Product؛ M:N Coupon از CouponBrand.
- getById محصولات را به درخت دسته‌بندی تبدیل می‌کند؛ حذف با محصولات مجاز و FK product SET NULL است (`brandService.js:32-97`).
- وضعیت: فعال ایستا؛ CategoryTreeBuilder به fields category که repository کامل برنمی‌گرداند متکی است.

### D-006 Product — محصول مادر

- `Products`; `product.js:41-81`.
- `name STRING(200) NOT NULL`, description TEXT NULL، price DECIMAL(10,2) NOT NULL، `stock_quantity INT NOT NULL`، image TEXT NULL، category_id required، counters views/sold default 0، slug unique required، brand_id/campaign_id nullable، buy_price decimal nullable default 0.
- روابط: Category/Brand/Campaign؛ reviews/variants؛ M:N Coupon؛ hasOne CampaignProduct.
- قواعد: display price از CampaignProduct فعال استخراج؛ getById view++؛ create/update نام/slug conflict و میانگین موزون buy_price ادعا شده (`productService.js:17-215`).
- وضعیت: read با mismatch response؛ create/update شکسته (`F-005/F-006/F-017`). stock سطح محصول با stock variant دو منبع حقیقت است.

### D-007 Attribute — نوع ویژگی

- `Attributes`; `attribute.js:15-25`: name STRING required unique؛ hasMany AttributeValue.
- CRUD admin، GET عمومی؛ حذف cascade values.
- وضعیت: فعال ایستا.

### D-008 AttributeValue — مقدار ویژگی

- `AttributeValues`; `attributevalue.js:23-36`: attribute_id required، value STRING required.
- belongsTo Attribute؛ M:N ProductVariant از VariantValue. DB unique(attribute_id,value) در migration.
- وضعیت: فعال ایستا.

### D-009 ProductVariant — تنوع قابل فروش

- `ProductVariants`; `productvariant.js:23-50`.
- product_id required؛ price decimal nullable (ارث از product)، stock INT required default 0، sku STRING nullable unique، image URL nullable.
- M:N AttributeValue؛ CartItem/OrderItem به آن اشاره می‌کنند.
- قواعد: حداقل یک value؛ همه valueها باید موجود؛ duplicate set در application چک می‌شود، نه constraint DB؛ update با values خالی امکان پاک‌کردن همه را نمی‌دهد (`productVariantService.js:26-160`).
- وضعیت: CRUD فعال ایستا؛ inventory audit ناقص.

### D-010 VariantValue — اتصال variant/value

- `VariantValues`; composite `(variant_id, attribute_value_id)` در مدل؛ migration علاوه بر id auto یک unique constraint دارد (`variantvalue.js:18-37`, migration `20250807125853...:5-47`).
- حذف cascade از هر دو والد؛ timestamps.
- وضعیت: فعال.

## سبد و سفارش

### D-011 Cart — سبد

- `Carts`; `cart.js:17-27`: user_id nullable، session_id nullable، expires_at required.
- belongsTo User؛ hasMany CartItem. هیچ check برای دقیقاً یکی از user/session و هیچ unique فعال-cart وجود ندارد.
- انقضا ۷ روز هنگام ایجاد/تغییر؛ cleanup cart منقضی دیده نشد.
- وضعیت: فعال ناقص؛ merge login شکسته.

### D-012 CartItem — قلم سبد

- `CartItems`; `cartitem.js:20-40`: cart_id, variant_id, quantity همگی INT required.
- migration 20250811 داده‌های قبلی را حذف و product_id را با variant_id عوض می‌کند.
- قاعده: add/update stock check، اما quantity integer/positive در add enforce نشده و جمع مقدار دور زده می‌شود.
- وضعیت: فعال ناقص.

### D-013 Order — سفارش

- `Orders`; `order.js:38-55`.
- user_id، total_amount، status، shipping_address_id، payment_status required؛ coupon_id nullable؛ discount/shipping/profit totals nullable.
- روابط: User/Address/Coupon؛ OrderItems، Payment one-to-one، History، Shipment.
- statusهای مشاهده‌شده: `pending`, `processing`, `delivered`, `cancelled`, `refunded`, `expired`; همچنین کد cleanup اشتباهاً `pending_payment_gateway` را order.status فرض می‌کند. payment statusها: `unpaid`, `pending_payment_gateway`, `paid`, `failed`.
- transition: place→pending/unpaid؛ initiate فقط payment_status pending؛ verify→processing/paid؛ cancel→cancelled؛ cleanup→expired/failed؛ admin هر string را می‌پذیرد. state machine رسمی ندارد.
- وضعیت: ناقص و پرریسک.

### D-014 OrderItem — snapshot قلم سفارش

- `OrderItems`; `orderitem.js:17-29`: order_id/variant_id/quantity required، price_at_purchase DECIMAL required.
- belongsTo Order و ProductVariant. migration variant همه دادهٔ قدیمی را حذف می‌کند.
- وضعیت: placeOrder تولید می‌کند؛ payment/cleanup هنوز schema قدیمی دارند.

### D-015 OrderHistory — تاریخچه وضعیت

- `OrderHistories`; `orderhistory.js:17-33`: order_id، status required؛ changed_at default now؛ changed_by nullable.
- belongsTo Order/User؛ timestamps. فیلد description وجود ندارد با اینکه shipping/cleanup می‌فرستند.
- وضعیت: بخشی فعال، audit ناقص.

### D-016 InventoryLog — دفتر تغییر موجودی

- `InventoryLogs`; `inventorylog.js:22-63`.
- product_id و **variant_id required**، order_id nullable، change_type STRING، quantity_change/new/old required، actor/description nullable.
- change_typeهای مشاهده: `initial_stock`, `manual_adjustment`, `reserve`, `sold`, `expired_order_return` و importها.
- وضعیت: مدل وجود دارد؛ بسیاری producerها variant_id نمی‌فرستند و برخی مسیرها fail می‌شوند.

## قیمت‌گذاری و ترویج

### D-017 Coupon — کوپن

- `Coupons`; `coupon.js:61-112`.
- `code STRING(50) unique required`; `discount_type STRING(50)`؛ مقادیر مستند/اجراشده: `percentage`, `fixed_amount`, `free_shipping`; value decimal required (free shipping در create صفر می‌شود).
- min_amount default 0؛ usage_limit nullable؛ used_count default 0؛ expiry_date DATEONLY nullable؛ isActive true؛ first_purchase false؛ exclusive false؛ max_usage_per_user nullable؛ group nullable؛ max_discount nullable.
- دامنه: M:N Product/User/Category/Brand؛ Orders؛ usage rows.
- رفتار محاسبه: percentage روی کل cart با cap؛ fixed از کل؛ free shipping هزینه ثابت 5 را صفر می‌کند (`orderService.js:47-70`). محدودیت scope فقط «وجود حداقل یک قلم مجاز» را هدف گرفته و تخفیف روی کل می‌افتد. brand scope اصلاً validate نمی‌شود. stacking معنایی ندارد چون order فقط یک coupon می‌گیرد. first purchase/exclusive/group اعمال نمی‌شوند.
- زمان: مدل فقط expiry_date دارد، validator start/end ناموجود را می‌خواند؛ بنابراین expiry واقعی اعمال نمی‌شود.
- مصرف: payment usage_limit را کم می‌کند نه used_count؛ cancellation used_count را کم می‌کند. ناسازگار.
- وضعیت: CRUD موجود؛ validate/consume شکسته.

### D-018 CouponGroup

- `CouponGroups`; name unique required، description nullable (`coupongroup.js:14-28`). فقط relation به Coupon؛ CRUD/endpoint ندارد.
- وضعیت: مدل موجود، بدون مسیر استفاده اثبات‌شده.

### D-019 CouponProduct / D-020 CouponCategory / D-021 CouponBrand / D-022 UserCoupon

- joinهای M:N با دو FK required، composite PK در مدل و unique constraint migration؛ timestamps.
- فایل‌ها: `couponproduct.js`, `couponcategory.js`, `couponbrand.js`, `usercoupon.js`.
- عملیات association در CouponService؛ product/category/brand/user selection هنگام create/update.
- وضعیت: ساخت association موجود، ولی repository APIهای مورد استفاده ناقص و validation شکسته.

### D-023 UserCouponUsage

- `UserCouponUsages`; `(user_id,coupon_id)` composite، usage_count required default 0 (`usercouponusage.js:18-39`).
- باید سقف per-user را نگه دارد؛ repository به‌اشتباه تعداد rowها را count می‌کند نه usage_count (`userCouponUsageRepository.js:13-18`).
- وضعیت: ناقص.

### D-024 Campaign — کمپین

- `Campaigns`; `campaign.js:17-70`.
- title/slug/type/start/end required؛ slug unique؛ description/banner/cta nullable؛ countdown false، priority 0، active true.
- campaign_type مثال کامنت: today_offer/seasonal/clearance/bestsellers ولی enum/validation ندارد.
- M:N Product. قواعد: start≤end؛ campaign price≤original؛ قیمت یک محصول در کمپین‌های فعال باید یکسان باشد مگر force update.
- وضعیت: CRUD/import موجود؛ دسترسی/route مشکل‌دار.

### D-025 CampaignProduct

- join `(campaign_id,product_id)`، original_price required در مدل ولی migration آن را nullable اضافه می‌کند؛ campaign_price nullable (`campaignproduct.js:21-46`, migrations 20250802).
- مدل composite PK تعریف می‌کند درحالی‌که migration id auto نیز دارد.
- وضعیت: فعال با عدم‌تطابق constraint و منبع حقیقت دوم `Product.campaign_id`.

## پرداخت، ارسال، تعامل و عملیات

### D-026 Payment

- `Payments`; `payment.js:13-36`: order_id unique required، transaction_id unique required، amount/method/status/payment_date required، refunded false، refund_reason nullable.
- method/status مشاهده‌شده: Zarinpal/success و CreditCard در seed؛ enum ندارد.
- وضعیت: verify شبیه‌سازی و schema-incompatible؛ refund operation ندارد.

### D-027 ProfitLog

- `ProfitLogs`; `profitlog.js:22-63`: order/product required، order_item nullable، quantity/prices/profit/date required.
- فقط payment callback تولید می‌کند و همان مسیر شکسته است؛ گزارش سود admin آن را می‌خواند.
- حذف FKها در migration CASCADE؛ audit مالی با حذف product/order از بین می‌رود.
- وضعیت: کد موجود، اجرای موفق اثبات‌نشده.

### D-028 ShipmentTracking

- `ShipmentTrackings`; `shipmenttracking.js:14-47`: order_id unique، provider required، tracking_code nullable unique، status default `Pending`, estimated nullable، last_update now.
- status مثال migration: Pending/In Transit/Delivered/Failed ولی آزاد است. create/update status سفارش را همان string می‌کند.
- وضعیت: فعال ایستا؛ state validation ندارد.

### D-029 Review

- `Reviews`; user/product required، rating 1..5 فقط model validation، comment nullable؛ unique user+product (`review.js:17-43`).
- create یک‌بار؛ update/delete مالک یا admin؛ GET عمومی.
- خرید تأییدشده شرط نیست. وضعیت: فعال ایستا.

### D-030 OnlineShoppingAdvice

- `OnlineShoppingAdvices`; user/session nullable، chat_text required، date default now، object nullable (`onlineshoppingadvice.js:14-45`). هیچ check برای حداقل یکی از user/session.
- Socket پیام user و AI را ذخیره می‌کند؛ برای user لاگین، پاسخ AI با user_id null و session null ذخیره می‌شود (`server.js:202-244`). history فقط RAM Map است.
- HTTP CRUD route mount نشده. وضعیت: Socket فعال مشروط به Gemini؛ هویت ناامن.

### D-031 Setting

- `Settings`; key STRING(100) primary/unique required، value TEXT required (`setting.js:10-25`).
- همه routeها پشت router-level admin auth هستند (`settingRoutes.js:14-18`).
- نوع value فقط string؛ schema/version ندارد. وضعیت: فعال ایستا.

## مفاهیم غیرجدولی

### D-032 Session/Conversation

- cookie `session_id` UUID هفت‌روزه برای هر request بدون cookie؛ بدون signed/sameSite صریح (`server.js:85-99`).
- Cart guest از session استفاده می‌کند؛ AI client session جدا در localStorage می‌سازد. این دو لزوماً یکی نیستند.
- `conversationHistoryMap` بدون TTL/limit در RAM نگه‌داری می‌شود؛ restart آن را پاک می‌کند.

### D-033 Import/Export/Backup

- importها CSV/Excel با multer temp و bulk create/update؛ exportها JSON/CSV/Excel stream.
- backup فایل SQL از pg_dump و retention روزانه؛ dumpها در `backups` موجودند.
- این‌ها قابلیت‌های عملیاتی‌اند، نه entity؛ audit/history برای importها وجود ندارد.

## حذف، تاریخچه و Audit

تمام مدل‌ها hard delete هستند. OrderHistory، InventoryLog و ProfitLog audit جزئی‌اند، اما FKهای CASCADE و نبود description/variant consistency قابلیت اتکا را کم می‌کند. هیچ created_by/updated_by عمومی، optimistic version یا outbox وجود ندارد.
