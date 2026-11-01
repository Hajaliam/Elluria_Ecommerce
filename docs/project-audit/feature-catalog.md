# فهرست جامع قابلیت‌ها

وضعیت‌ها: **فعال-ایستا** یعنی مسیر تا persistence از کد دنبال شده ولی اجرا نشده؛ **ناقص** یعنی مسیر هست اما شکاف مشخص دارد؛ **شکسته** یعنی ناسازگاری قطعی کد؛ **بدون اتصال** یعنی کد route/symbol هست ولی mount/مصرف اثبات نشده؛ **Mock** یعنی شبیه‌سازی.

| شناسه | حوزه | قابلیت و رفتار واقعی | نقش | مسیر اجرا | وضعیت | شواهد/محدودیت |
|---|---|---|---|---|---|---|
| FEAT-001 | هویت | ثبت‌نام customer با hash | عمومی+CSRF | route→UserService→UserRepo | فعال-ایستا | `userRoutes.js:95`; `userService.js:32-61`؛ validation schema ندارد |
| FEAT-002 | هویت | login رمز و صدور access/refresh | عمومی+CSRF | route→service | ناقص | `userService.js:65-91`؛ merge cart متد گمشده |
| FEAT-003 | هویت | خواندن/ویرایش profile خود | token | `/profile`, `/me` | ناقص | auth optional؛ دو GET تکراری |
| FEAT-004 | هویت | forgot password ایمیل/SMS | عمومی | service→SMTP/Kavenegar | فعال مشروط | `userService.js:158-186`؛ limiter تعریف شده ولی route استفاده نمی‌کند |
| FEAT-005 | هویت | reset password token/code | عمومی | service | فعال-ایستا | token مشترک برای email/SMS؛ min length 8 |
| FEAT-006 | هویت | درخواست OTP | عمومی | service→SMS | فعال مشروط | user enumeration با 404؛ بدون request limiter |
| FEAT-007 | هویت | login با OTP | عمومی | service | شکسته | `userService.js:240` unreachable token code |
| FEAT-008 | کاربر | ساخت آدرس خود/به‌نمایندگی admin | token | route guard→service | فعال-ایستا | default بدون transaction/unique |
| FEAT-009 | کاربر | فهرست آدرس userId | هر token یا بی‌توکن تا crash | controller→repo | ناقص-امنیتی | IDOR `userRoutes.js:727` |
| FEAT-010 | admin | list/get/update/delete کاربران | admin | admin router→UserService | فعال-ایستا | hard delete؛ role_id آزاد |
| FEAT-011 | دسته | create/update/delete | admin | route→service→repo | فعال-ایستا | cycle چندسطحی منع نشده |
| FEAT-012 | دسته | list tree/get/subtree | عمومی | service recursion | فعال-ایستا | بدون pagination |
| FEAT-013 | برند | CRUD و list عمومی | admin/public | service→repo | فعال-ایستا | delete brand، productها SET NULL |
| FEAT-014 | برند | نمایش محصولات برند در درخت دسته | عمومی | BrandService→TreeBuilder | ناقص | repository category فقط name و نه id/parent_id |
| FEAT-015 | محصول | list/filter/sort/paginate | عمومی | ProductService→Repo | شکسته-contract | `{rows,count}` در برابر `{products,total}` |
| FEAT-016 | محصول | detail + افزایش view | عمومی | service→repo | فعال-ایستا | GET اثر نوشتن دارد |
| FEAT-017 | محصول | create با upload و inventory log | admin | controller→service | شکسته | `db` تعریف‌نشده و variant_id log |
| FEAT-018 | محصول | update/weighted buy price/stock log | admin | service transaction | شکسته | همان؛ stock product/variant ناسازگار |
| FEAT-019 | محصول | hard delete | admin | service→repo | فعال-ایستا | تصویر حذف نمی‌شود؛ FKها ممکن است منع کنند |
| FEAT-020 | ویژگی | CRUD Attribute | admin | service/repo | فعال-ایستا | delete cascade values |
| FEAT-021 | ویژگی | list/get Attribute و values | عمومی | service/repo | فعال-ایستا | rate limited |
| FEAT-022 | variant | create/update/delete و value set | admin | transaction | فعال-ایستا | duplicate combination فقط app check |
| FEAT-023 | variant | list product variants | عمومی | service/repo | فعال-ایستا | rate limited |
| FEAT-024 | سبد | cart مهمان با session | عمومی عملی | cookie→CartService | فعال-ایستا | route نام auth دارد اما optional است |
| FEAT-025 | سبد | cart کاربر | token | CartService | فعال-ایستا | چند cart per user منع DB ندارد |
| FEAT-026 | سبد | merge guest/user | login/_getOrCreate | service | شکسته/ناامن همزمانی | login متد repo گمشده؛ loop بدون tx |
| FEAT-027 | سبد | add variant | user/guest | service | ناقص | cumulative stock و quantity validation ناقص |
| FEAT-028 | سبد | get totals/variant values | user/guest | repo include | فعال-ایستا | قیمت campaign در cart اعمال نمی‌شود |
| FEAT-029 | سبد | update/remove/clear | user/guest | service | فعال-ایستا | ownership cart بررسی می‌شود |
| FEAT-030 | سفارش | place order و reserve stock | token | OrderService transaction | ناقص | address/coupon/transaction clear مشکلات بحرانی |
| FEAT-031 | سفارش | list خود یا فیلتر admin | token | service/repo | ناقص | `user.role.name` در JWT نیست؛ احتمال خطا |
| FEAT-032 | سفارش | get detail مالک/admin | token | service | ناقص | admin با role_id=2 hard-code |
| FEAT-033 | سفارش | تغییر status + history | admin | transaction | فعال-ایستا | هر status پذیرفته می‌شود |
| FEAT-034 | سفارش | cancel و restore variant | مالک/admin | transaction | ناقص | no lock/log/per-user coupon restore |
| FEAT-035 | سفارش | expiry hourly | سیستم | cron→cleanup | شکسته | schema قدیمی Product |
| FEAT-036 | پرداخت | initiate | مالک/role_id2 | controller | Mock | URL ساختگی؛ payment_status تغییر می‌کند |
| FEAT-037 | پرداخت | callback verify/finalize | عمومی callback | controller transaction | شکسته/بحرانی | قابل جعل و schema قدیمی/cart خالی |
| FEAT-038 | پرداخت | refund | — | فقط fields | بدون اتصال | refunded/refund_reason مدل؛ endpoint ندارد |
| FEAT-039 | کوپن | CRUD با scopeها | admin | CouponService transaction | ناقص | repository methods گمشده |
| FEAT-040 | کوپن | percentage + cap | order | validator/calculator | شکسته end-to-end | نوع تعریف شده؛ validator ناسازگار |
| FEAT-041 | کوپن | fixed amount | order | همان | شکسته end-to-end | floor صفر ندارد؛ final ممکن است منفی شود |
| FEAT-042 | کوپن | free shipping | order | همان | شکسته end-to-end | shipping ثابت 5 |
| FEAT-043 | کوپن | min/global/per-user/expiry/private/product/category | order/payment | validator | شکسته | field/alias/id mismatches |
| FEAT-044 | کوپن | brand/first-purchase/exclusive/group | فقط model/CRUD | — | کد موجود بدون اعمال | validator بررسی نمی‌کند |
| FEAT-045 | کمپین | create/update/delete | admin | controller transaction | فعال-ایستا | دو منبع truth و منطق تکراری update |
| FEAT-046 | کمپین | import CSV/XLSX | عملاً عمومی | controller transaction | فعال ولی بحرانی | بدون auth؛ replace-all |
| FEAT-047 | کمپین | list/get admin | admin | controller | فعال-ایستا | روی mount عمومی نیز admin می‌خواهد |
| FEAT-048 | کمپین | active campaigns public | عمومی طراحی‌شده | controller | غیرقابل‌دسترسی | `/:id` قبل `/active` |
| FEAT-049 | کمپین | remove product | admin | transaction | فعال-ایستا | campaign_id فقط اگر برابر null می‌شود |
| FEAT-050 | نظر | create یک نظر 1..5 | token | controller/model | فعال-ایستا | خرید تأیید نمی‌شود |
| FEAT-051 | نظر | list محصول | عمومی | controller | فعال-ایستا | user public fields |
| FEAT-052 | نظر | update/delete مالک/admin | token | controller | فعال-ایستا | auth optional به crash منجر می‌شود |
| FEAT-053 | جست‌وجو | product/category query، price/stock/brand/sort/page | عمومی | controller direct DB | ناقص | maxRating bug؛ no limiter |
| FEAT-054 | ارسال | create/update tracking + order/history | admin | transaction | فعال-ایستا | status آزاد؛ history description گم |
| FEAT-055 | ارسال | get tracking مالک/admin | token | controller | فعال-ایستا | auth optional semantics |
| FEAT-056 | تنظیمات | upsert/get/list/delete | admin | controller direct DB | فعال-ایستا | همه values string |
| FEAT-057 | AI | chat filter/recommend/store | socket guest/user | server→Gemini/DB | فعال مشروط/ناامن | identity payload، no rate/TTL |
| FEAT-058 | AI | HTTP history CRUD | admin/owner | route/controller | بدون اتصال | router mount نشده |
| FEAT-059 | admin | export category/product/user/order/payment/coupon/review/inventory | admin | controller | فعال-ایستا | JSON/CSV/XLSX |
| FEAT-060 | admin | sales/low-stock/best-selling/profit report | admin | controller | فعال-ایستا/ناقص | product-level stock قدیمی در برخی گزارش‌ها |
| FEAT-061 | admin | import category/product/user/order/payment/coupon/inventory/review | admin | controller upload | فعال-ایستا | validation/atomicity متفاوت؛ schema variant risk |
| FEAT-062 | عملیات | manual backup | admin | دو route تکراری | ناقص | async child completion report نمی‌شود |
| FEAT-063 | عملیات | daily backup + retention | system | cron | فعال مشروط | DB_NAME_DEV در همه env |
| FEAT-064 | مستندات | Swagger UI | عمومی `/api-docs` | swagger-jsdoc | فعال مشروط | قراردادها با کد اختلاف دارند |
| FEAT-065 | امنیت | CSRF token issuance | عمومی | `/api/csrf-token` | فعال-ایستا | پوشش انتخابی و دو instance csrf |
| FEAT-066 | امنیت | rate limiting | auth/OTP/payment/attributes | middleware | جزئی | forgot limiter و general search استفاده نشده |
