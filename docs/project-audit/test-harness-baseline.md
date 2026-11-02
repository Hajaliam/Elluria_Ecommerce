# Baseline مرحلهٔ 0B: Test Harness و Smoke Boot ایزوله

تاریخ اجرای واقعی: 2026-11-02 (Asia/Tehran)

وضعیت: **موفق — Unit برابر 12/12 و Integration/Smoke برابر 2/2؛ چرخهٔ 39 Migration روی PostgreSQL تست اجرا و تمام منابع Compose پاک شد.**

## دامنه و عدم تغییر رفتار

این مرحله فقط زیرساخت آزمون و مرز boot را ایجاد کرد. هیچ‌یک از یافته‌های `F-001` تا `F-019`، رفتار دامنه، قرارداد API، Model، Migration یا Schema اصلاح نشد. Seederها اجرا نشدند. هیچ stage، commit یا push انجام نشد.

## Test Runner

Runner داخلی Node.js یعنی `node:test` روی Node `v24.16.0` استفاده شد و هیچ dependency جدیدی اضافه نشد؛ بنابراین `package-lock.json` تغییر نکرد.

- `npm run test:unit`: Guard، import-safety و قرارداد Fakeها را بدون Docker اجرا می‌کند.
- `npm run test:integration`: چرخهٔ کامل PostgreSQL/Compose و Smokeها را اجرا می‌کند.
- `npm run test:integration:node`: فقط تست‌های Integration را روی DB تستی که از قبل آماده شده اجرا می‌کند؛ Guard همچنان داخل suite اجرا می‌شود.
- `npm test`: ابتدا Unit و سپس چرخهٔ کامل Integration را اجرا می‌کند.

هیچ test دارای `skip`، `todo` یا شکست عمدی/known-broken ایجاد نشد.

## Composition Root و Boot

`src/app.js` تابع صریح `createApplication({ adapters, database })` را فراهم می‌کند. این تابع Express، HTTP و Socket.IO را compose می‌کند، اما `listen` نمی‌کند، scheduler راه نمی‌اندازد، DB را authenticate نمی‌کند و هیچ adapter خارجی را فراخوانی نمی‌کند.

`server.js` entry point واقعی باقی مانده است. فقط اجرای مستقیم `node server.js`، ابتدا `global-agent` را bootstrap و مقدار ثابت قبلی `GLOBAL_AGENT_HTTP_PROXY` را تنظیم می‌کند؛ سپس `src/app.js`، logger، adapterها و schedulerهای Production را load می‌کند. در نتیجه route/controller/serviceهای وابسته به Composition Root پس از فعال‌شدن proxy بارگذاری می‌شوند. بعد از آن runtime listen می‌کند و در callback موفق listen دو scheduler موجود Backup و Order Cleanup را شروع می‌کند. import کردن `server.js` به‌تنهایی proxy را تغییر نمی‌دهد، `src/app.js` را load نمی‌کند و runtime work را آغاز نمی‌کند.

ترتیب middlewareها، route prefixها، mountها، endpoint ریشه/CSRF و eventهای Socket.IO (`sendAdviceMessage` و `receiveAdviceMessage`) حفظ شد. قرارداد خوانای `COMPOSITION_ROUTE_MANIFEST` شامل هر 26 mount است و خود Composition Root برای mount کردن از همان manifest استفاده می‌کند. characterization مستقل، ترتیب، method، prefix و زنجیرهٔ handler هر 26 مورد را دقیقاً مقایسه می‌کند؛ از جمله root، CSRF، manual backup، mountهای عمومی/admin، هر دو ProductVariant، CSRF و admin auth. این آزمون به Git یا جزئیات private مربوط به Express متکی نیست. ترتیب legacy مربوط به Campaign نیز عمداً تغییر نکرد. استخراج Composition Root مجوز اصلاح رفتارهای ممیزی‌شده نبود؛ حتی منطق موجود controller پرداخت و job پاک‌سازی سفارش تغییر نکرد.

## Side effectهای شناسایی‌شده

پیش از استخراج، `server.js` هنگام import برنامه را compose و بدون guard، HTTP/Socket.IO را listen می‌کرد و در callback آن Backup cron و Order Cleanup cron را شروع می‌کرد. همچنین Gemini در import به API key نیاز داشت، SMTP و Kavenegar هنگام load سرویس‌های کاربر ساخته می‌شدند، Sequelize/Modelها ساخته می‌شدند و proxy سراسری mutate می‌شد. Backup می‌تواند `pg_dump` را با child process اجرا کند.

پس از استخراج، ساخت Sequelize/Modelها همچنان برای حفظ route wiring انجام می‌شود، اما اتصال شبکه فقط با `authenticate`/query رخ می‌دهد و import آن را انجام نمی‌دهد. ساخت clientهای Gemini/SMTP/SMS و proxy mutation به Composition Root اجرایی Production منتقل شد. Backup process و schedulerها فقط از مسیر صریح Production یا endpoint مربوط قابل اجرا هستند.

## Fake Adapterها

`test/support/fake-adapters.js` Fakeهای درون‌حافظه‌ای برای AI/Gemini، Email/SMTP، SMS، Payment gateway و Backup execution می‌سازد. پاسخ پیش‌فرض AI متن UTF-8 دقیق `پاسخ قطعی تست` است و یک assertion مستقل از برابر بودن دقیق آن محافظت می‌کند. هر Fake:

- تمام ورودی‌ها را در آرایهٔ مشترک `calls` ثبت می‌کند؛
- پاسخ قطعی پیش‌فرض دارد و با `respondWith` قابل تنظیم است؛
- با `failWith` خطای قابل تنظیم شبیه‌سازی می‌کند؛
- هیچ network، child process یا فایل خارجی اجرا نمی‌کند.

Adapterها فقط از `createApplication` تزریق می‌شوند. Email/SMS در singleton موجود `UserService` از Composition Root تنظیم می‌شوند، Backup handler از همان مرز تنظیم می‌شود و AI در Socket handler مستقیماً adapter تزریق‌شده را مصرف می‌کند. Payment Fake فقط seam آینده در `app.locals.adapters` است و Payment Controller فعلی را کنترل نمی‌کند؛ flow پرداخت موجود همچنان شبیه‌سازی داخلی قبلی را دارد و در این مرحله تغییر نکرد.

## چرخهٔ PostgreSQL و Cleanup

`scripts/run-integration-tests.js` این ترتیب را اجرا می‌کند:

1. `.env.test` را load و `assertDisposableTestDatabase` را قبل از Docker/DB اجرا می‌کند.
2. فقط `compose.test.yml` با project صریح `elluria-runtime-test` را `up --detach --wait` می‌کند.
3. همان مسیر baseline مرحلهٔ 0A را برای اجرای 39 migration به کار می‌گیرد.
4. reset محافظت‌شده و سپس Integration testها را اجرا می‌کند.
5. در `finally` فقط همان Compose project را با `down --volumes --remove-orphans` حذف می‌کند.

هیچ prune، حذف image یا انتخاب resource خارج از project انجام نمی‌شود.

Smokeها یک Sequelize مشترک دارند. تست DB آن را authenticate/query می‌کند ولی نمی‌بندد تا HTTP Smoke بعدی runtime را با همان اتصال معتبر بسازد. یک `after` hook در سطح suite، پس از پایان همهٔ Smokeها و حتی در مسیر شکست، اتصال را دقیقاً یک بار می‌بندد. اجرای تست‌ها همچنان با concurrency برابر 1 است و هیچ `sync`، `force`، `alter` یا Seeder اجرا نمی‌شود.

`scripts/reset-test-db.js` ابتدا Guard و سپس identity واقعی `current_database()/current_user` را بررسی می‌کند. فقط tableهای کاربردی schema `public` را در یک transaction با `TRUNCATE ... RESTART IDENTITY CASCADE` پاک می‌کند؛ `SequelizeMeta` و خود schema حفظ می‌شوند. نام tableها از catalog PostgreSQL خوانده و به‌صورت identifier امن quote می‌شوند.

## تست‌های اجراشده و نتیجه

| Suite | پوشش | نتیجه |
| --- | --- | --- |
| Guard Unit | پذیرش هویت دقیق؛ رد NODE_ENV، host، port، DB دیگر با `_test` و user دیگر | 6/6 سبز |
| Import/Fake/Route Unit | نبود listen/cron/requestهای instrumentشده هنگام import و boot؛ cold-import امن entry point؛ encoding/پاسخ/ثبت/خطای Fake؛ قرارداد 26 mount | 6/6 سبز |
| DB Smoke | اتصال به `elluria_test` با `elluria_test_user`؛ 39 ردیف `SequelizeMeta`؛ load شدن 31 Model و associationها؛ close اتصال | 1/1 سبز |
| HTTP/Fake Smoke | port موقت؛ `/` برابر 200؛ `/api/csrf-token` برابر 200 و token معتبر؛ صفر call خارجی؛ close کامل HTTP/Socket.IO | 1/1 سبز |

چرخهٔ Integration در اجراهای ثبت‌شده تقریباً 12 تا 25 ثانیه و Unitها حدود 2 ثانیه زمان گرفتند؛ زمان به warm/cold بودن startup Docker وابسته است.

## اثبات Isolation

- Unit import-safety، `http.Server.listen`، `node-cron.schedule` و `http/https.request` را instrument کرد و شمار هر سه پس از import و composition صفر بود. cold-import پیش از assertion فقط cache مربوط به `server.js` و `src/app.js` را پاک می‌کند، ثابت می‌کند entry point فایل app را load نکرده و در `finally` cache، env و monkey patchها را بازیابی می‌کند. این شاهد فقط همین ابزارهای instrumentشده را پوشش می‌دهد و ادعا نمی‌کند همهٔ انواع ممکن network ذاتاً ناممکن‌اند.
- آرایهٔ call تمام Fakeها پس از boot و دو HTTP smoke خالی بود؛ بنابراین Gemini، Email، SMS، Payment و Backup فراخوانی نشدند.
- schedulerها جزو `createApplication` نیستند و فقط در callback listen مربوط به `startProduction` شروع می‌شوند.
- route inventory به‌صورت ماشینی و بدون introspection داخلی Express اثبات شد: manifest ثابت 26/26 هم منبع mountهای Composition Root و هم قرارداد دقیق characterization است.
- Integration فقط به `127.0.0.1:55432` وصل شد و identity واقعی DB را دوباره بررسی کرد.
- پس از suite، container، network و volume با label/name project تست باقی نماند.
- processهای `node:test` با exit code صفر خاتمه یافتند؛ هیچ handle باز، test لغوشده، skip یا todo گزارش نشد.

## محدودیت‌ها

- این baseline فقط boot و infrastructure observable را پوشش می‌دهد و flowهای دامنه‌ای شکسته را عمداً تست یا اصلاح نمی‌کند.
- Payment فعلی gateway خارجی ندارد و شبیه‌سازی داخل controller است؛ Fake فقط seam آینده را فراهم می‌کند و هنوز Payment Controller را کنترل نمی‌کند. تغییر flow به adapter تا مرحلهٔ اصلاح `F-001/F-002` به تعویق افتاده است.
- ساخت Modelها هنگام Composition حفظ شده است؛ فقط اتصال واقعی DB صریحاً در Smoke انجام می‌شود.
- موفقیت migration همچنان فقط DB خالی/fixture-free را اثبات می‌کند و rehearsal دادهٔ production-like نیست.
- در handler موجود WebSocket، `finalUserId` و `finalSessionId` داخل `try` تعریف شده‌اند ولی `catch` به آن‌ها ارجاع می‌دهد. `F-019` جعل هویت payload را پوشش می‌دهد، نه این خطای scope؛ بنابراین این مورد به‌عنوان رفتار legacy جدید و خارج از محدودهٔ 0B ثبت شد و اصلاح نشد.

## ارتباط با F-001 تا F-019 و گام بعدی

این Harness امکان نوشتن regression test برای یافته‌ها را فراهم می‌کند، اما هیچ finding بسته نشده است. به‌ویژه callback پرداخت، cleanup legacy، auth/IDOR، campaign routing/import، coupon و variant consistency همان رفتار قبلی را دارند. گام بعدی باید طبق roadmap، هر finding را با تست قرمز مستقل، تغییر دامنه‌ای محدود و migration امن جداگانه حل کند؛ شروع پیشنهادی `F-001` و `F-002` در مرز Payment/OrderItem است.
