# Phase 1A — Payment/ProductVariant Red Regression Baseline

تاریخ اجرا: 2026-11-02 (Asia/Tehran)

وضعیت: **RED معتبر — 2 PASS، 12 RED، 0 BLOCKED از 14 Test Case اجرایی.** اجرای هدفمند با exit code برابر `1` پایان یافت؛ هر 12 شکست از assertion قرارداد صحیح و نقص واقعی Production ناشی شد، نه syntax، fixture، route، CSRF یا setup. چرخهٔ اجرا 39/39 Migration را اعمال و در پایان Container، Network و Volume پروژهٔ تست را حذف کرد.

## دامنه و یافته‌های مبنا

شماره‌گذاری واقعی `docs/project-audit/findings.md` با فرض Phase 1A یکسان است:

- **F-001، بحرانی با اطمینان بالا:** callback پرداخت بدون امضا یا verify درگاه، تنها بر پایهٔ `Status=OK`, `orderId` و `Authority` ورودی کاربر سفارش را paid می‌کند و قابل جعل است (`src/controllers/paymentController.js`, تابع `verifyPayment`).
- **F-002، بحرانی با اطمینان بالا:** callback پس از migration به Variant هنوز `CartItem.product_id`، association قدیمی `product` و `item.product` را مصرف می‌کند؛ مدل فعلی فقط `variant_id`/`variant` دارد و جریان پرداخت می‌شکند (`verifyPayment`, `src/models/cartitem.js`).

این مرحله F-001 یا F-002 را اصلاح نمی‌کند. Fake Payment موجود از Composition Root تزریق می‌شود، اما controller آن را مصرف نمی‌کند؛ PV-PAY-001، PV-PAY-002 و PV-PAY-004 این قطع بودن seam را به‌صورت اجرایی ثابت می‌کنند.

## مسیر فعلی Payment تا Variant

مسیر ساخت سفارش چنین است:

```text
CartItem.variant_id
  → CartService.getCart (Variant → Product read model)
  → OrderService.placeOrder
  → OrderItem.variant_id + price_at_purchase
  → ProductVariant.stock_quantity reserve
  → InventoryLog.variant_id
  → CartService.clearCart (بیرون transaction سفارش)
```

مسیر callback فعلی از این مسیر جدا و legacy است:

```text
GET /api/payments/verify?Status&Authority&orderId
  → verifyPayment (بدون auth/CSRF و بدون payment.verify)
  → Order را پیش از verify به paid/processing تغییر می‌دهد
  → Payment success می‌سازد
  → Cart کاربر را با CartItem association قدیمی «product» می‌خواند
  → به‌علت نبود association با 500 و rollback پایان می‌یابد
```

بنابراین F-002 در اجرای فعلی غالباً اثر قابل بهره‌برداری F-001 را mask می‌کند؛ این masking امنیت ایجاد نمی‌کند. حذف خطای Variant legacy بدون اتصال verify، callback جعل‌پذیر F-001 را دوباره مستقیماً فعال می‌کند.

## قرارداد صحیح از ADR-001

- ProductVariant تنها sellable unit و `ProductVariant.stock_quantity` تنها منبع حقیقت موجودی فروش است؛ `Product.stock_quantity` legacy read-only است.
- هر CartItem و OrderItem باید `variant_id` معتبر داشته باشد.
- snapshot قیمت برابر `variant.price ?? product.price` است؛ صفر Variant قیمت معتبر است.
- initiation و verify باید مبلغ را از Order/OrderItems معتبر در سرور بگیرند و دادهٔ callback مبلغ یا قلم سفارش را تغییر ندهد.
- callback فقط پس از `payment.verify` معتبر، تطبیق Authority با همان intent/order pending و تطبیق مبلغ موفق است.
- verify ناموفق هیچ paid state، Payment موفق، sold InventoryLog یا side effect موفق دیگری ایجاد نمی‌کند.
- retry باید idempotent باشد و callback هم‌زمان باید با lock/constraint از duplicate جلوگیری کند.
- نهایی‌سازی و compensation باید transactionally consistent باشند؛ cart، order، item، inventory و history نباید state جزئی باقی بگذارند.

## ماتریس Test Case

| Test ID | سناریو | انتظار صحیح | نتیجهٔ فعلی | وضعیت | دلیل فنی | مسئول احتمالی |
|---|---|---|---|---|---|---|
| PV-PAY-001 | callback جعلی با `Status=OK` | Fake adapter دقیقاً یک بار verify کند، پاسخ false باعث 400 و بدون mutation شود | adapter صفر بار صدا زده شد؛ callback سپس در association legacy به 500 رسید | RED | controller به `app.locals.adapters.payment` متصل نیست | `paymentController.verifyPayment`, `src/app.js` |
| PV-PAY-002 | verify ناموفق برای authority ثبت‌شده | 400 و حفظ pending؛ بدون paid history/sold log | adapter صفر بار صدا زده شد؛ controller تلاش کرد Payment موفق دیگری بسازد و 500 داد | RED | verify bypass و create success پیش از هر تطبیق | `paymentController.verifyPayment` |
| PV-PAY-003 | Authority متعلق به سفارش/کاربر دیگر | 400 و عدم تغییر target | 500 ناشی از unique validation هنگام استفادهٔ Authority/Payment سفارش دیگر | RED | هیچ lookup/binding صریح Authority→pending order وجود ندارد | `paymentController.verifyPayment`, `Payment` |
| PV-PAY-004 | amount دستکاری‌شده در callback | adapter با مبلغ server-side Order فراخوانی و Payment با همان مبلغ ثبت شود | adapter فراخوانی نشد و callback در CartItem legacy به 500 رسید | RED | مبلغ verify از OrderItems محاسبه و به adapter داده نمی‌شود | `paymentController.verifyPayment` |
| PV-PAY-005 | callback معتبر موفق | 200، Order paid/processing و استفاده از OrderItems immutable | 500: alias `product` روی CartItem وجود ندارد | RED | callback به Cart خالی/legacy وابسته است، نه OrderItems | `paymentController.verifyPayment` |
| PV-PAY-006 | callback موفق تکراری | هر دو پاسخ idempotent؛ یک Payment، یک OrderItem و یک paid history | هر دو callback 500؛ finalization معتبر نخستین بار هم ممکن نیست | RED | F-002 و نبود lock/idempotency در callback | `paymentController.verifyPayment` |
| PV-PAY-007 | Variant با قیمت مستقل | OrderItem قیمت `125.00` و variant صحیح را snapshot کند | transaction با `FOR UPDATE cannot be applied to nullable side of outer join` rollback شد | RED | repository همراه lock، join اختیاری values/attribute را نیز lock می‌کند | `OrderService.placeOrder`, `productVariantRepository.findById` |
| PV-PAY-008 | `Variant.price=null` | fallback دقیق به `Product.price=100.00` | `price_at_purchase` برابر NULL شد و DB آن را رد کرد | RED | Cart read model قیمت Product را select نمی‌کند؛ fallback undefined می‌شود | `cartRepository.getCartDetails`, `CartService.getCart` |
| PV-PAY-009 | ثبت OrderItem با `variant_id` | سفارش کامل شود و OrderItem فقط variant identity داشته باشد | OrderItem اولیه در transaction ساخته شد، سپس lock نامعتبر باعث rollback کل سفارش شد | RED | مسیر Variant تا پایان قابل تکمیل نیست | `OrderService.placeOrder`, `productVariantRepository.findById` |
| PV-PAY-010 | کاهش دقیق stock Variant | stock از 8 به 6 و reserve log با old/new درست | پیش از کاهش، lock query با outer join رد شد | RED | lock به query دارای association اختیاری متصل است | `OrderService.placeOrder`, `productVariantRepository.findById` |
| PV-PAY-011 | عدم اتکا به Product stock | با Product stock صفر و Variant stock هشت، رزرو Variant موفق و Product بدون تغییر بماند | همان lock نامعتبر مانع تکمیل شد | RED | مسیر صحیح Variant در مرحله lock متوقف می‌شود | `OrderService.placeOrder`, `productVariantRepository.findById` |
| PV-PAY-012 | موجودی ناکافی Variant | بدون Order/OrderItem/InventoryLog و بدون کاهش stock رد شود | دقیقاً با خطای insufficient stock rollback شد | PASS | check اولیه Variant پیش از side effect مؤثر است | `OrderService.placeOrder` |
| PV-PAY-013 | rollback پاک‌سازی Cart | `clearCart` با transaction caller اجرا و rollback، CartItem را برگرداند | CartItem بعد از rollback حذف باقی ماند | RED | `clearCart` options/transaction را نمی‌پذیرد و delete/save جدا commit می‌شوند | `CartService.clearCart`, `cartItemRepository` |
| PV-PAY-014 | callback با Status غیر OK | 400 و صفر paid/payment/sold side effect | قرارداد مورد انتظار برقرار بود | PASS | early rejection قبل از transaction | `paymentController.verifyPayment` |

سناریوی «سفارش متعلق به کاربر دیگر» در PV-PAY-003 از طریق دو user/order واقعی و Authority متعلق به user اول در برابر order user دوم اجرا شده است. callback هیچ principal احراز‌شده‌ای ندارد؛ بنابراین مرز درست مالکیت باید از binding ثبت‌شدهٔ payment intent/Authority به همان Order و User حاصل شود، نه پارامتر client.

## تفکیک نقص‌ها

### نقص Production

- Payment Fake در Composition Root وجود دارد ولی `paymentController` آن را مصرف نمی‌کند.
- state سفارش و Payment success پیش از verify معتبر نوشته می‌شوند؛ rollback تصادفی F-002 تنها مانع commit در fixture فعلی است.
- callback Cart را می‌خواند، association/column Product legacy را مصرف می‌کند و OrderItems را منبع حقیقت نمی‌داند.
- authority/order/amount binding و callback lock وجود ندارد.
- `ProductVariant` lock با outer joins تولید می‌شود و PostgreSQL آن را رد می‌کند.
- Cart read model برای fallback، `Product.price` را select نمی‌کند.
- `clearCart` transaction سفارش را دریافت نمی‌کند.

### محدودیت Harness

- در HTTP callback واقعیِ جاری، middleware احراز هویت و CSRF عمداً وجود ندارد. route واقعی Express، cookie/session middleware، JSON middleware، logging و error path اجرا شدند؛ Payment Fake واقعی تست تزریق شد ولی Production آن را فراخوانی نکرد.
- تست‌های PV-PAY-007 تا PV-PAY-013 مستقیماً service واقعی، repositoryها، modelها و PostgreSQL را اجرا کردند؛ auth/CSRF در این تست‌های service-level موضوع آزمون نبود و bypass یا mock نشد.
- درگاه، شبکهٔ خارجی، SMTP، SMS، AI، Backup، Seeder و child process gateway اجرا نشد. تنها listener محلی ephemeral تست و Docker/PostgreSQL ایزوله استفاده شد.

### رفتار Legacy

- Product stock هنوز در schema وجود دارد، اما تست قرارداد آن را منبع فروش نمی‌داند.
- `Status=NOK` early rejection سالم است؛ این رفتار جای verify server-to-server برای `Status=OK` را نمی‌گیرد.
- `Payment.order_id` و `transaction_id` unique هستند، اما constraint به‌تنهایی جای pending-intent binding و lock idempotent را نمی‌گیرد.

## نتایج اجرا

Baseline پیش از اضافه‌شدن suite:

- `npm run test:unit`: **12/12 PASS**، exit code 0.
- `npm run test:integration`: **2/2 PASS**، exit code 0.
- Migration در baseline و اجرای هدفمند: **39/39 PASS**.

Phase 1A هدفمند:

- `npm run test:integration:payment-variant-red`: **2 PASS / 12 RED / 0 BLOCKED**، exit code مورد انتظار 1.
- هیچ test دارای skip یا todo نیست؛ هیچ شناسه hardcode نشده و reset قطعی بین testها انجام شد.
- runner در `finally` فقط Compose project برابر `elluria-runtime-test` را با volume و orphanهای خودش پایین آورد.

## ترتیب کمینهٔ پیشنهادی Phase 1B

1. قرارداد payment adapter را به controller/use-case تزریق و initiation را وادار به ثبت intent pending شامل Authority، Order، amount server-side و user binding کنید.
2. callback را ابتدا با Authority ثبت‌شده resolve و row-lock کند؛ سپس adapter را با amount محاسبه‌شده از Order/OrderItems verify کند و فقط پس از موفقیت state را تغییر دهد.
3. Cart و تمام `product_id` legacy را از callback حذف و OrderItems immutable را منبع نهایی کنید.
4. finalization را در یک transaction با transition شرطی/idempotency و uniqueness موجود نگه دارید؛ retry موفق باید read-only شود.
5. read model قیمت Cart/Order را به resolver واحد `variant.price ?? product.price` تبدیل کنید و Product.price را برای fallback واقعاً select کنید.
6. query قفل Variant را از joinهای نمایش AttributeValue جدا کنید؛ row پایه را lock و سپس دادهٔ نمایشی را جدا بخوانید.
7. transaction را تا `clearCart` و repositoryهای آن عبور دهید؛ fault test rollback را سپس تا orchestration کامل توسعه دهید.
8. پس از سبز شدن تست‌های تک‌درخواست، concurrent callback/order tests با barrier کنترل‌شده اضافه کنید.

## ریسک rollback، idempotency و race

- rollback فعلی قابل اتکا نیست، چون cart cleanup بیرون transaction commit می‌شود؛ شکست پس از cleanup می‌تواند Order را rollback ولی Cart را خالی نگه دارد.
- callback check-then-write بدون row lock است؛ دو callback هم‌زمان می‌توانند هر دو paid path را آغاز کنند و یکی با constraint شکست بخورد، درحالی‌که side effectهای میانی و پاسخ‌ها ناسازگار می‌شوند.
- check موجودی قبل از lock انجام می‌شود و پس از گرفتن lock دوباره شرط stock بررسی نمی‌شود؛ race سفارش‌ها می‌تواند موجودی منفی بسازد. خطای lock فعلی این race را حل نمی‌کند و فقط flow را می‌شکند.
- idempotency فقط با مشاهدهٔ `payment_status=paid` پیاده شده و atomic نیست؛ Authority uniqueness نیز binding معنایی و replay policy را تضمین نمی‌کند.

## کنترل تغییرات

هیچ فایل زیر `src/`, `models/`, `migrations/`, `seeders/`, `config/` یا `server.js` تغییر نکرد. هیچ Seeder، `npm audit fix`، stage، commit یا push انجام نشد. `package-lock.json` تغییر نکرد و `.env.test` همچنان ignored است.

---

# Phase 1B-1 — Transaction-safe ProductVariant Order Finalization

تاریخ اجرا: 2026-11-02 (Asia/Tehran)

وضعیت: **هدف مرحله محقق شد — پیش از تغییر 2 PASS / 12 RED / 0 BLOCKED و پس از تغییر 8 PASS / 6 RED / 0 BLOCKED از 14 Test Case.** شش RED باقی‌مانده عمداً PV-PAY-001 تا PV-PAY-006 و خارج از دامنهٔ این مرحله‌اند. cancelled/skipped/todo در اجرای نهایی همگی صفر بودند.

## Dependency trace پیش از تغییر

- **PV-PAY-007، 009، 010 و 011:** `OrderService.placeOrder` در loop کسر موجودی، `productVariantRepository.findById(..., { lock: UPDATE })` را صدا می‌زد. `findById` همیشه association اختیاری `values → attribute` را include می‌کرد و PostgreSQL با `FOR UPDATE cannot be applied to the nullable side of an outer join` query را رد می‌کرد.
- **PV-PAY-008:** `cartRepository.getCartDetails` برای Product فقط `id/name/slug` را select می‌کرد. در `CartService.getCart`، fallback قیمت Product در نتیجه `undefined` و سپس `OrderItem.price_at_purchase` برابر NULL می‌شد؛ constraint واقعی `NOT NULL` آن را رد می‌کرد.
- **PV-PAY-013:** `CartService.clearCart` پارامتر options نداشت؛ `CartItem.destroy` و `cart.save()` transaction caller را دریافت نمی‌کردند و rollback caller حذف CartItem را برنمی‌گرداند.
- **PV-PAY-012:** check موجودی ناکافی پیش از write مؤثر انجام می‌شد و از ابتدا PASS بود؛ تست تقویت‌شده علاوه بر Order/OrderItem/InventoryLog/Variant stock، باقی‌ماندن CartItem را نیز اثبات می‌کند.

## ماتریس نتیجهٔ Phase 1B-1

| Test ID | وضعیت قبل | Root cause | تغییر Production | شواهد DB و وضعیت بعد | فایل/تابع |
|---|---|---|---|---|---|
| PV-PAY-007 | RED | lock دوبارهٔ Variant با includeهای outer join | snapshot از Variant قفل‌شده و resolver nullish دقیق | `price_at_purchase=125.00` و `variant_id` صحیح؛ **PASS** | `orderService.placeOrder`, `productVariantRepository.findAllByIdsForUpdate` |
| PV-PAY-008 | RED | نبود `Product.price` در read model و fallback به `undefined` | select واقعی Product.price؛ `variant.price ?? product.price`؛ اعتبارسنجی و محاسبهٔ integer-cent | `price_at_purchase=100.00` بدون NULL/NaN؛ **PASS** | `cartRepository.getCartDetails`, `cartService.getCart`, `orderService.placeOrder` |
| PV-PAY-009 | RED | OrderItem ساخته می‌شد ولی lock بعدی کل transaction را rollback می‌کرد | ساخت OrderItem فقط از line تجمیع‌شدهٔ Variant | رکورد persisted دارای `variant_id` و فاقد `product_id` است؛ **PASS** | `orderService.placeOrder` |
| PV-PAY-010 | RED | query قفل نامعتبر پیش از decrement | lock یک‌بارهٔ همهٔ Variantها، validate کامل، سپس decrement تجمیعی | دو CartItem با quantityهای 2 و 3 به یک OrderItem quantity=5 تبدیل شدند؛ stock `8→3` و log `-5/8/3`؛ **PASS** | `cartItemRepository.findAllByCartId`, `productVariantRepository.findAllByIdsForUpdate`, `orderService.placeOrder` |
| PV-PAY-011 | RED | flow پیش از اثبات استقلال از Product stock می‌شکست | تنها `ProductVariant.stock_quantity` خوانده/نوشته می‌شود | Product stock روی 0 ماند و Variant stock `8→6` شد؛ **PASS** | `orderService.placeOrder` |
| PV-PAY-012 | PASS | موجودی Variant ناکافی | ترتیب validate-before-write حفظ و query قفل اصلاح شد | Variant stock=1، Order/OrderItem/InventoryLog=0 و CartItem=1؛ **PASS بدون regression** | `orderService.placeOrder`, تست regression |
| PV-PAY-013 | RED | transaction به clearCart و queryهای داخلی منتقل نمی‌شد | options تا lookup/delete/save عبور داده شد | rollback هم CartItem و هم `Cart.expires_at` را به مقدار قبل برگرداند؛ **PASS** | `cartService._getOrCreateCart`, `cartService.clearCart`, repositoryهای Cart/CartItem |

## Lock، ترتیب عملیات و transaction propagation

`getCartForOrderFinalization` ابتدا ردیف Cart را با `FOR UPDATE` و سپس CartItemهای بدون join را با `FOR UPDATE` و همان transaction می‌خواند. quantityهای CartItem بر پایهٔ `variant_id` پیش از هر بررسی موجودی تجمیع و شناسه‌ها مرتب می‌شوند. سپس `findAllByIdsForUpdate` همهٔ ProductVariantهای درگیر را در یک query جدا با قفل صریح Sequelize زیر می‌خواند:

```text
lock: { level: transaction.LOCK.UPDATE, of: ProductVariant }
```

SQL حاصل از نوع `FOR UPDATE OF "ProductVariant"` است؛ Product فقط برای price fallback با inner join خوانده می‌شود و هیچ nullable side از LEFT/RIGHT OUTER JOIN قفل نمی‌شود. تمام Variantها و قیمت‌ها پیش از ساخت Order validate می‌شوند؛ سپس OrderItemها، stock Variant، InventoryLog، و پاک‌سازی Cart در همان transaction caller نوشته می‌شوند و commit تنها در انتها رخ می‌دهد. helper جدید transaction مستقل نمی‌سازد.

قیمت‌ها با integer cents مبتنی بر `BigInt` محاسبه و دوباره به رشتهٔ DECIMAL دو رقم اعشار تبدیل می‌شوند. بنابراین `0.00` Variant معتبر است، تنها null/undefined به Product.price fallback می‌کند و `null`، `undefined` یا NaN وارد snapshot یا total نمی‌شود.

## InventoryLog و Product stock

- `Product.stock_quantity` در هیچ write یا تصمیم موجودی این flow دخالت ندارد و دست‌نخورده می‌ماند. Product join فقط ستون‌های `id` و `price` را برای fallback می‌خواند.
- schema واقعی InventoryLog در این flow به `product_id`, `variant_id`, old/new stock و quantity change نیاز دارد. پس از رفع lock ناسازگاری Model/Migration تازه‌ای ظاهر نشد. اصلاح محدود call site فقط افزودن `order_id` موجود به log رزرو بود؛ هیچ Model، Migration یا flow دیگری تغییر نکرد.
- InventoryLog با quantity تجمیع‌شده و در همان transaction سفارش ایجاد می‌شود؛ شکست بعدی آن را همراه Order، OrderItem، Variant stock و CartItem rollback می‌کند.

## شش RED باقی‌مانده

PV-PAY-001 تا PV-PAY-006 همچنان به علت واقعی لایهٔ callback/verification RED هستند و این مرحله آن‌ها را تغییر نداده است:

- PV-PAY-001 و 002: adapter `payment.verify` صفر بار فراخوانی می‌شود؛ controller verification را bypass می‌کند.
- PV-PAY-003: Authority به pending intent همان Order/User bind نمی‌شود و مسیر فعلی با validation error به 500 می‌رسد.
- PV-PAY-004: مبلغ server-side Order به adapter verify ارسال نمی‌شود؛ adapter اصلاً فراخوانی نمی‌شود.
- PV-PAY-005: callback به OrderItems immutable متکی نیست و association legacy با alias `product` روی CartItem را می‌خواهد؛ پاسخ 500 است.
- PV-PAY-006: همان وابستگی legacy به Cart و نبود callback idempotency/locking باعث می‌شود هر دو retry با 500 پایان یابند.

هیچ ادعایی دربارهٔ تکمیل یا ایمن‌شدن Payment callback در Phase 1B-1 وجود ندارد.

## شواهد اجرای نهایی

- suite هدفمند: **8 PASS / 6 RED / 0 BLOCKED**؛ `cancelled=0`, `skipped=0`, `todo=0`.
- Unit baseline: **12/12 PASS**.
- Migration baseline در هر اجرای هدفمند: **39/39 اعمال‌شده**.
- runner پس از هر اجرا Container، Network و Volume پروژهٔ `elluria-runtime-test` را حذف کرد.
- fixture تغییر نکرد؛ تست regression فقط برای aggregation و rollback سخت‌گیرانه‌تر شد.
- Model، Migration، Seeder، schema، Payment Controller/routes، ADR-001، server.js و Composition Root تغییر نکردند.
- `package-lock.json` بدون تغییر و `.env.test` همچنان از `.gitignore` ignored است؛ stage/commit/push انجام نشد.

---

# Phase 1B-1 — Corrective Test Contract Gate

تاریخ اجرا: 2026-11-03 (Asia/Tehran)

وضعیت: **9 PASS / 6 RED / 0 BLOCKED از 15 Test Case**؛ `cancelled=0`، `skipped=0` و `todo=0`. این Gate فقط قرارداد تست، fixture و سند audit را تغییر داد و هیچ Production code را تغییر نداد.

## قرارداد اصلاح‌شدهٔ callback

| Test ID | Arrange معتبر | قرارداد مورد انتظار | نتیجهٔ فعلی و علت RED |
|---|---|---|---|
| PV-PAY-001 | Order و Payment pending واقعی؛ callback با Authority ناشناخته | رد 400 پیش از provider؛ verify صفر بار؛ حفظ Payment/Order pending؛ صفر paid/sold side effect | **RED**: callback بدون lookup Authority وارد transaction و ساخت Payment دوم می‌شود؛ constraint آن را با 500 rollback می‌کند |
| PV-PAY-002 | Payment pending واقعی؛ callback با `transaction_id` ذخیره‌شده؛ fake verify=false | verify دقیقاً یک بار؛ 400؛ حفظ همان Payment و Order pending؛ صفر paid/sold side effect | **RED**: verify صفر بار و ساخت Payment دوم به validation error/500 می‌رسد |
| PV-PAY-003 | دو Order مستقل و دو Payment pending مستقل | Authority سفارش مالک همراه `orderId` هدف باید پیش از verify با 400 رد شود؛ هر دو Order/Payment بدون تغییر | **RED**: binding بررسی نمی‌شود؛ ساخت Payment دوم برای Order هدف validation error/500 می‌دهد |
| PV-PAY-004 | Payment pending واقعی؛ Authority ذخیره‌شده؛ callback amount جعلی | verify با amount سمت سرور؛ update همان Payment به success؛ Payment دوم ساخته نشود | **RED**: adapter فراخوانی نمی‌شود و controller به‌جای update intent موجود، Payment دوم می‌سازد؛ 500 |
| PV-PAY-005 | Payment pending واقعی؛ Cart read در callback با fault guard ممنوع | finalization از OrderItems؛ verify یک بار؛ Payment success و Order paid/processing؛ stock Variant بدون کاهش دوم؛ یک Payment و یک OrderItem | **RED**: قبل از finalization، ساخت Payment دوم validation error/500 می‌دهد؛ مسیر معتبر OrderItems وجود ندارد |
| PV-PAY-006 | Payment pending واقعی؛ دو callback یکسان با Authority ذخیره‌شده | هر دو 200 idempotent؛ verify مجموعاً یک بار؛ یک Payment، یک paid history و یک OrderItem؛ stock ثابت | **RED**: هر دو callback تلاش تکراری برای ساخت Payment دوم دارند و 500 می‌دهند |

500های بالا deterministic و ناشی از defect واقعی callback هستند، نه fixture ناقص یا setup تصادفی. fixture برای تمام success-pathها Authority یکتای متعلق به همان Order را در Payment pending ذخیره می‌کند و محاسبهٔ amount آن با integer cents انجام می‌شود؛ هیچ رفتار callback در fixture بازسازی نشده است.

## شواهد rollback سراسری PV-PAY-013

تست، `OrderService.placeOrder` واقعی را اجرا می‌کند. monkey patch فقط `clearCart` واقعی را با همان آرگومان‌ها و transaction فراخوانی و بلافاصله بعد از آن خطای کنترل‌شده پرتاب می‌کند؛ restore در `finally` انجام می‌شود. پس از rollback، DB اثبات کرد:

- `Order=0`، `OrderItem=0` و `InventoryLog=0`؛
- `ProductVariant.stock_quantity` دقیقاً برابر مقدار پیش از اجرا؛
- `CartItem=1` و `Cart.expires_at` دقیقاً برابر مقدار پیش از اجرا؛
- `Product.stock_quantity` بدون تغییر.

نتیجه: **PASS**؛ rollback کل transaction سفارش سنجیده شد، نه transaction مصنوعی و مستقیم `clearCart`.

## قیمت صفر PV-PAY-015

با `Variant.price='0.00'`، `Product.price='100.00'` و quantity=2، `placeOrder` موفق شد؛ `OrderItem.price_at_purchase='0.00'` و `Order.total_amount='5.00'` بود. بنابراین fallback به Product رخ نداد و total فقط shipping پیش‌فرض واقعی را شامل شد. نتیجه: **PASS**.

## کنترل اجرای Gate

- suite هدفمند: **9 PASS / 6 RED / 0 BLOCKED** از 15؛ فقط PV-PAY-001 تا 006 قرمز؛
- Unit baseline: **12/12 PASS**؛
- Migration baseline: **39/39** migration در PostgreSQL disposable اعمال شد؛
- `node --check` برای test و fixture: PASS؛ `git diff --check`: PASS؛
- `package-lock.json`: بدون تغییر؛
- Compose container/network/volume پروژهٔ `elluria-runtime-test` در `finally` حذف شد؛
- Payment Controller، OrderService، repository، model، migration و schema در این Gate تغییر نکردند؛ stage/commit/push انجام نشد.

---

# Phase 1B-2 — Secure and Idempotent Payment Callback

تاریخ اجرا: 2026-11-03 (Asia/Tehran)

وضعیت: **پیش از تغییر 9 PASS / 6 RED / 0 BLOCKED از 15 مورد؛ پس از تغییر 17 PASS / 0 RED / 0 BLOCKED از 17 مورد.** cancelled/skipped/todo همگی صفر هستند.

## مسیر قبلی و مسیر جدید callback

مسیر قبلی `GET /api/payments/verify` مستقیماً در Controller، `orderId` ورودی را برای انتخاب Order قابل اعتماد می‌دانست، بدون فراخوانی adapter سفارش را paid می‌کرد، Payment جدید می‌ساخت، سپس Cart/CartItem با association قدیمی Product را می‌خواند و side effectهای sold/profit/coupon/cart را اجرا می‌کرد. این مسیر هم جعل‌پذیر بود و هم با Payment pending موجود و schema Variant فعلی تعارض داشت.

مسیر جدید URL عمومی را تغییر نمی‌دهد و به ترتیب زیر است:

1. `Status !== OK` در Controller پیش از هر DB write یا verify با 400 رد می‌شود.
2. `paymentService.verifyAndFinalize` فقط Payment موجود را با `Payment.transaction_id = Authority` resolve می‌کند و Order را منحصراً از `Payment.order_id` می‌خواند.
3. `orderId` callback اختیاری و فقط consistency check است؛ mismatch پیش از verify با 400 رد می‌شود.
4. `Payment.amount` و `Order.total_amount` به integer minor units مبتنی بر `BigInt` تبدیل و دقیق مقایسه می‌شوند. amount ورودی callback نادیده گرفته می‌شود و adapter ورودی `{ authority, amount: Payment.amount, orderId: Payment.order_id }` می‌گیرد.
5. تماس خارجی adapter بیرون transaction و بدون row lock انجام می‌شود. `verified !== true` برابر 400 است؛ throw adapter به پاسخ کنترل‌شدهٔ 502 تبدیل می‌شود و نبود adapter/verify به 503.
6. پس از verify موفق، transaction مستقل باز می‌شود؛ ابتدا Payment با `FOR UPDATE` و سپس Order با `FOR UPDATE` load می‌شوند. binding، amount و state دوباره بررسی می‌شوند.
7. همان Payment pending به `success` update، Order به `payment_status=paid` و `status=processing` منتقل، و دقیقاً یک `OrderHistory(status=paid)` ایجاد می‌شود. Payment دوم ساخته نمی‌شود.

schema واقعی وضعیت‌ها را با `STRING(50)` و بدون enum/constraint نگه می‌دارد؛ transition بالا از وضعیت‌های واقعی flow و fixture یعنی `Payment.pending` و `Order.pending/pending_payment_gateway` به `Payment.success` و `Order.processing/paid` استفاده می‌کند. `OrderHistory` فقط `order_id`, `status`, `changed_at`, `changed_by` را می‌پذیرد و description فرضی ندارد. uniqueهای واقعی Payment روی `order_id` و `transaction_id` برقرارند، اما idempotency به آن‌ها واگذار نشده و با lock/recheck پیاده شده است.

## Idempotency، race و rollback

- retry ترتیبی پس از success در read-only precheck نهایی تشخیص داده می‌شود؛ callback دوم verify یا DB write تکراری ندارد. شمار verify مجموعاً **1** است.
- در callback هم‌زمان هر دو درخواست ممکن است پیش از commit اول provider را verify کنند؛ اجرای ثبت‌شده **2 verify** داشت. هر دو پاسخ 200 گرفتند، ولی قفل Payment درخواست دوم را تا commit اول منتظر نگه داشت و recheck داخل transaction فقط یک finalization، یک Payment و یک paid History باقی گذاشت.
- PV-PAY-017 پس از save شدن Payment و Order و پیش از ساخت History خطای کنترل‌شده تزریق کرد. transaction هر دو update را rollback کرد؛ Payment pending، Order pending/pending_gateway و paid History صفر ماند. monkey patch در `finally` بازیابی و retry بعدی با verify دوم سالم finalize شد.

## عدم دسترسی به Cart و عدم تغییر inventory

callback جدید هیچ Cart/CartItem را load یا mutate نمی‌کند، OrderItem جدید نمی‌سازد، و ProductVariant/Product stock را نمی‌خواند یا تغییر نمی‌دهد. PV-PAY-005 fault guard روی `Cart.findOne` را بدون رخداد خطا گذراند. PV-PAY-006، 016 و 017 شناسه/تعداد OrderItem و stock پیش و پس از callback را ثابت اثبات کردند. همچنین callback دیگر InventoryLog با `change_type=sold`، ProfitLog، sold_count یا coupon usage ایجاد نمی‌کند؛ قرارداد مشخصی برای تبدیل reservation به sold در schema فعلی وجود ندارد.

## ماتریس نهایی PV-PAY-001 تا PV-PAY-017

| Test ID | نتیجه | اثبات اصلی |
|---|---|---|
| PV-PAY-001 | PASS | Authority ناشناخته 400؛ verify صفر؛ state بدون تغییر |
| PV-PAY-002 | PASS | verify=false یک بار؛ 400؛ بدون side effect موفق |
| PV-PAY-003 | PASS | Authority/Order mismatch پیش از verify رد شد |
| PV-PAY-004 | PASS | amount جعلی نادیده؛ مبلغ canonical سمت سرور؛ همان Payment success |
| PV-PAY-005 | PASS | finalization بدون Cart؛ OrderItem immutable؛ stock ثابت |
| PV-PAY-006 | PASS | retry ترتیبی دو پاسخ 200؛ verify یک؛ History/Payment یک |
| PV-PAY-007 | PASS | Variant price مستقل snapshot شد |
| PV-PAY-008 | PASS | fallback دقیق Product price فقط برای Variant.price=null |
| PV-PAY-009 | PASS | هویت sellable unit فقط variant_id |
| PV-PAY-010 | PASS | reservation فقط stock Variant را یک بار کم کرد |
| PV-PAY-011 | PASS | Product stock در reservation مستقل و ثابت ماند |
| PV-PAY-012 | PASS | stock ناکافی rollback کامل داشت |
| PV-PAY-013 | PASS | failure پس از cart cleanup کل placeOrder را rollback کرد |
| PV-PAY-014 | PASS | Status غیر OK؛ verify صفر و هیچ paid/sold/payment side effect |
| PV-PAY-015 | PASS | Variant price صفر به Product fallback نکرد |
| PV-PAY-016 | PASS | دو callback هم‌زمان 200؛ finalization/Payment/History یک؛ stock/item ثابت |
| PV-PAY-017 | PASS | failure میان writeها rollback کامل؛ retry سالم |

## Production adapter، initiation و Deferred

`createProductionAdapters` همچنان در `payment.initiate` و `payment.verify` صریحاً throw می‌کند و gateway واقعی وجود ندارد. callback جدید این وضعیت را موفق تلقی نمی‌کند و fail-closed با 502 پاسخ می‌دهد؛ هیچ Authority callback در Production به‌تنهایی معتبر نمی‌شود.

endpoint فعلی initiation فقط URL شبیه‌سازی‌شده می‌سازد و Order را `pending_payment_gateway` می‌کند؛ Payment pending و Authority واقعی ثبت نمی‌کند و حتی adapter initiation را مصرف نمی‌کند. طبق scope این مرحله بازنویسی نشد. بنابراین تا Phase بعد و اتصال initiation/gateway واقعی، Production callback عمداً نمی‌تواند یک پرداخت واقعی را finalize کند.

موارد Deferred:

- پیاده‌سازی gateway واقعی و initiation تراکنشی که Payment pending و Authority provider را ثبت کند؛
- تعریف صریح state machine/DB constraints برای Payment و Order؛
- طراحی مشخص reservation→sold و side effectهای profit/coupon/sold_count؛ این مرحله رفتار جدیدی برای آن‌ها اختراع نکرد؛
- تصمیم دامنه و idempotency مستقل برای side effectهای اطلاع‌رسانی پس از commit.

---

# Phase 1B-2 — Final Restricted Gate: Authority, Logging and Adapter Fail-Closed

تاریخ اجرا: 2026-11-03 (Asia/Tehran)

وضعیت: **19/19 PASS** در suite هدفمند Payment/ProductVariant؛ `cancelled=0`، `skipped=0` و `todo=0`.

## اثبات یکتایی Authority در چهار لایه

`Payments.transaction_id` فقط annotation مدل نیست و در DB واقعی نیز UNIQUE است:

1. `src/models/payment.js`: فیلد `transaction_id` با `allowNull: false` و `unique: true` تعریف شده است.
2. `migrations/20250710194032-create-Payment.js`: migration واقعی ایجاد جدول نیز همین ستون را `unique: true` می‌سازد.
3. `docs/project-audit/migration-schema.sql`: snapshot با `ADD CONSTRAINT "Payments_transaction_id_key" UNIQUE (transaction_id)` این قید را ثبت می‌کند.
4. PostgreSQL baseline پس از اعمال هر 39 migration: query مستقیم `pg_constraint` یک constraint نوع `u` با نام `Payments_transaction_id_key` و تعریف `UNIQUE (transaction_id)` برگرداند؛ `pg_indexes` نیز backing unique btree index با همین نام را نشان داد.

بنابراین Authority در baseline واقعی صفر یا حداکثر یک Payment دارد و `Payment.findOne({ where: { transaction_id: authority } })` از نظر ambiguity قابل قبول است. `paymentService.js` تغییر نکرد، migration جدید ساخته نشد و finding مربوط به UNIQUE migration نیز لازم نیست.

## Logging callback

Logging callback اکنون فقط پیام‌های ثابت و metadata ساختاریافته نگه می‌دارد:

- موفقیت: `paymentId` داخلی، `orderId` داخلی و `alreadyFinalized`؛
- رد کنترل‌شده: `error.code` و `statusCode`؛
- خطای غیرمنتظره: فقط پیام ثابت و stack داخلی.

`Authority`، `Status`، `orderId` خام query، `amount` callback، متن خطای adapter و کل `req.query` در پیام یا metadata callback log نمی‌شوند. Controller پس از استخراج ورودی لازم، URL و query metadata درخواست را نیز redacted می‌کند تا HTTP request logger عمومی Authority یا query خام callback را نگه ندارد.

## شواهد fail-closed adapter

- **PV-PAY-018 — PASS:** Fake `payment.verify` یک خطای کنترل‌شده با متن حساس آزمایشی پرتاب کرد. پاسخ 502 بود و متن حساس در response وجود نداشت. verify پیش از retry دقیقاً یک بار اجرا شد؛ Payment و Order pending ماندند، paid History صفر بود، Product/Variant stock و OrderItem تغییر نکردند. پس از بازگرداندن Fake به پاسخ موفق، retry با 200 نهایی شد.
- **PV-PAY-019 — PASS:** adapter پرداخت فقط در محدودهٔ test و داخل `try/finally` از `app.locals` حذف شد. callback با 503 پاسخ داد، verify صفر بار بود و Payment، Order، paid History، Product/Variant stock و OrderItem بدون تغییر ماندند. همان object adapter در `finally` دقیقاً بازیابی و با identity assertion تأیید شد.

gateway واقعی و initiation تراکنشی که Payment pending و Authority provider را ثبت کند همچنان **Deferred** هستند. این Gate هیچ Order/ProductVariant logic، Model، Migration، Seeder یا schema را تغییر نداد.

## اعتبارسنجی نهایی Gate

- Payment/ProductVariant: **19/19 PASS**؛
- Integration با دو smoke: **21/21 PASS**؛
- Unit: **12/12 PASS**؛
- Migration baseline: **39/39**؛
- `npm test`: PASS؛ `cancelled=0`، `skipped=0` و `todo=0`؛
- `node --check` و `git diff --check`: PASS؛
- `package-lock.json` بدون تغییر، secret scan بدون یافته، و `.env.test` ignored؛
- cleanup container/network/volume کامل و listener روی پورت 55432 برابر صفر؛
- هیچ stage، commit یا push انجام نشد.
