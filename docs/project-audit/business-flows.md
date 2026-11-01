# جریان‌های اصلی کسب‌وکار

## BF-001 ثبت‌نام و ورود رمز

محرک `POST /api/users/register`: CSRF+rate limit؛ service uniqueness username/email، hash و نقش customer را اعمال و User می‌سازد (`userRoutes.js:95`, `userService.js:32-61`). login credential را چک، در صورت session guest سبد را associate، JWT access/refresh صادر و cookie session را پاک می‌کند (`userService.js:65-91`, `userController.js:15-33`).

خطاها: نقش seed نشده 500؛ duplicate 409؛ invalid 401. نقص قطعی: repository متد associate ندارد، پس login با session موجود می‌شکند. refresh token هیچ endpoint ندارد. تراکنش register لازم نیست، اما cart merge باید تراکنشی باشد.

## BF-002 بازیابی رمز و OTP

forgot identifier را email/phone lookup می‌کند؛ email token یک‌ساعته و SMTP، phone کد دو دقیقه و SMS (`userService.js:158-205`). پاسخ برای user ناموجود عمداً یکسان است. request OTP کد را ذخیره و SMS می‌فرستد؛ verify رکورد معتبر را پیدا و پاک می‌کند.

نقص قطعی: verify سپس `login(username, passwordHash)` را صدا می‌زند و پیش از token code return می‌کند، بنابراین OTP login موفق نمی‌شود (`userService.js:225-248`). request OTP limiter ندارد؛ فقط verify محدود است (`userRoutes.js:611,686`).

## BF-003 کاتالوگ، variant و کمپین

GET products فیلتر category/brand/search/price، sort و pagination دارد؛ repository کمپین فعال را join و service display_price را می‌سازد. GET product views_count را افزایش می‌دهد. admin product با upload تصویر create/update/delete می‌کند. variantها با value set ساخته می‌شوند.

نقص قطعی: controller قرارداد `{products,total}` را از service `{rows,count}` اشتباه می‌خواند؛ create/update `db` تعریف‌نشده است. campaign product قیمت ویژه را ذخیره و همزمان `Product.campaign_id` را set می‌کند؛ import ابتدا کل اعضای فعلی را حذف می‌کند. route active unreachable و import بی‌احراز است.

## BF-004 سبد

محرک add/get/update/delete؛ middleware token اختیاری است، userId یا session cookie cart را مشخص می‌کند. `_getOrCreateCart` user و guest را merge/associate می‌کند. قیمت variant یا fallback product محاسبه و values برگردانده می‌شود (`cartService.js:19-138`).

هم‌زمانی: unique(cart,variant) در DB دیده نشد؛ دو add همزمان duplicate می‌سازند. stock reservation در cart نیست و check فقط snapshot است. add موجود quantity مجموع را چک نمی‌کند. merge loop/clear تراکنشی نیست.

## BF-005 ثبت سفارش

پیش‌شرط: user token، cart غیرخالی، stock کافی. transaction شروع؛ cart خوانده، variantها چک، coupon validate/discount، Order pending/unpaid، OrderItems snapshot، هر variant با row lock دوباره خوانده و stock کم، InventoryLog نوشته، cart پاک و commit (`orderService.js:24-118`).

یافته‌های قطعی: shipping address ownership/وجود validate نمی‌شود؛ discount/shipping snapshot در Order ذخیره نمی‌شود؛ coupon validator شکسته؛ clearCart transaction را نمی‌گیرد و rollback-safe نیست. race stock تا lock دوم دوباره شرط `stock>=quantity` را چک نمی‌کند، بنابراین دو transaction می‌توانند پس از انتظار stock را منفی کنند.

## BF-006 پرداخت

initiate مالکیت را با role_id=2 چک، status را pending_gateway و URL ساختگی می‌دهد. verify query callback را بدون gateway verification قبول، Order paid/processing، history/payment/profit/coupon/sold_count و cart clear را انجام می‌دهد.

قطعی: callback قابل جعل؛ cart قبلاً هنگام placeOrder پاک شده، پس verify با «No cart items» rollback می‌کند؛ ضمن آن schema cart قدیمی است. منبع درست باید OrderItems باشد. retry paid پاسخ idempotent ظاهری دارد، ولی Authority uniqueness و concurrent callbacks قفل ندارند.

## BF-007 لغو و انقضا

cancel مالک/admin، statusهای نهایی را منع، stock variantها را برمی‌گرداند، used_count coupon را کم و history می‌نویسد. cleanup هر ساعت orderهای بیش از ۲۴ ساعت را expired/failed و stock را برمی‌گرداند.

قطعی: cleanup association قدیمی دارد و نمی‌تواند صحیح اجرا شود؛ cancel InventoryLog نمی‌نویسد و per-user coupon usage را برنمی‌گرداند. repeated cancel منع می‌شود، اما concurrent cancel lock ندارد.

## BF-008 ارسال

admin ShipmentTracking one-to-one را create/update می‌کند؛ در همان transaction Order.status و History را تغییر می‌دهد. GET مالک/admin را بررسی می‌کند (`shippingController.js:10-170`). status transition آزاد است و description history در schema نیست.

## BF-009 کوپن

admin coupon و scopeهای brand/product/user/category را transactionally create/update می‌کند؛ category انتخابی باید descendants را expand کند. placeOrder validator و discount را مصرف می‌کند؛ payment مصرف را ثبت می‌کند؛ cancel بخشی را برمی‌گرداند.

قطعی: repository methods/association aliases/field names ناسازگارند، descendant helper برای array طراحی نشده، scope brand/first/exclusive/group اعمال نمی‌شود، و counters ناسازگارند. هیچ مسیر سالم end-to-end اثبات نشد.

## BF-010 AI advice

Socket event payload را sanitize، message را DB، catalog تا ۵۰ محصول را Gemini prompt، پاسخ را DB و emit می‌کند. filter نخست unrelated را NO می‌کند. history per user/session در Map است.

ریسک: userId از client قابل جعل؛ rate limit، طول پیام، auth و TTL وجود ندارد؛ API key نبودن server startup را متوقف می‌کند؛ پاسخ مدل و user text در log ذخیره می‌شوند.

## BF-011 import/export و backup

تمام admin routes router-level admin-only هستند. exportها داده را JSON/CSV/XLSX می‌دهند؛ importها temp upload را parse و رکوردها را درج/به‌روزرسانی می‌کنند. campaign import استثنائاً محافظت نشده است. backup cron/API `pg_dump` را async exec می‌کند و retention را پاک می‌کند.

Importهای بزرگ transaction/validation یکسان ندارند و controller چندمسئولیتی است. manual backup قبل از پایان child process success می‌دهد. هیچ restore flow دیده نشد.
