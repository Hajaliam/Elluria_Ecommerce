# Baseline مرحلهٔ 0A: Runtime و Migration

تاریخ اجرای واقعی: 2026-11-02 (Asia/Tehran)

وضعیت: **موفق — ۳۹/۳۹ Migration روی PostgreSQL کاملاً خالی اجرا شد، schema واقعی snapshot شد و منابع تست پاک شدند.**

## دامنه و قواعد اجرا

- فقط `compose.test.yml` با project صریح `elluria-runtime-test` استفاده شد.
- هیچ Production code، Model، Migration یا Seeder تغییر نکرد.
- هیچ Seeder، API، Server، Gemini، SMTP، SMS، Payment یا Backup اجرا نشد.
- هیچ stage، commit یا push انجام نشد و تغییرات موجود Workspace حفظ شدند.
- نخستین اجرای `npm run test:db:migrate` داخل sandbox پیش از شروع هر Migration با `connect EACCES 127.0.0.1:55432` متوقف شد. این محدودیت sandbox بود، نه شکست PostgreSQL یا Migration. اجرای واقعی همان فرمان با مجوز اتصال localhost انجام شد.

## Runtime و Image

| مورد | نتیجه |
| --- | --- |
| Docker Desktop | `4.97.0 (244584)` |
| Docker Client | `29.9.2`، API `1.56`، commit `a82e528` |
| Docker Engine | `29.9.2`، API `1.56`، commit `0367cbe` |
| Docker Compose | `v5.6.1` |
| Context فعال | `desktop-linux` |
| PostgreSQL | `16.6`، image tag `postgres:16.6-alpine` |
| Image ID / Repo digest | `sha256:1d04b9ba1d4996401f2552b51beda8187f175c0645c091e4781134fc9c9a3eef` |
| Container ID اجراشده | `565714725fc1917cb322aa84d8efea2b6f0804e690ae5c20fe105333cc1ce560` |
| Node / CLI / ORM | Node `24.16.0`، sequelize-cli `6.6.3`، Sequelize `6.37.7` |

Docker CLI در نصب per-user قرار داشت و از `C:\Users\user\AppData\Local\Programs\DockerDesktop\resources\bin` استفاده شد. این مسیر فقط به PATH همان processها افزوده شد و هیچ config سراسری تغییر نکرد.

## تأیید Isolation و Config

خروجی نهایی `docker compose -f compose.test.yml config` این مقادیر را تأیید کرد:

| مورد | مقدار تستی واقعی |
| --- | --- |
| Compose project | `elluria-runtime-test` |
| Service / Container | `elluria-postgres-test` |
| Volume | `elluria-runtime-test-postgres-data` |
| Network | `elluria-runtime-test_default` |
| Database | `elluria_test` |
| User | `elluria_test_user` |
| Port binding | `127.0.0.1:55432 -> 5432/tcp` |
| Healthcheck | `pg_isready -U elluria_test_user -d elluria_test` |

پیش از اجرا هیچ Container با نام تست، Volume با نام تست یا Container منتشرکنندهٔ port `55432` وجود نداشت. بقایای همین Compose با `docker compose -f compose.test.yml down --volumes --remove-orphans` پاک شدند و هیچ Project یا Volume دیگری هدف قرار نگرفت.

سپس `up -d --wait` اجرا شد. وضعیت Container برابر `running/healthy` بود؛ mount فقط Volume تست روی `/var/lib/postgresql/data` بود و PostgreSQL هویت `elluria_test | elluria_test_user | PostgreSQL 16.6` را برگرداند.

فایل `.env.test` در آغاز وجود نداشت و با محتوای دقیق `.env.test.example` ساخته شد. SHA-256 هر دو فایل یکسان بود:

```text
9C5C56BAE1A066B363032C24E9C80F607F5DC0DA98ECA46FCA6CB5C4B92C186B
```

`git check-ignore -v .env.test` قانون `.gitignore:4:.env.test` را تأیید کرد؛ فایل همچنان ignored است.

## Guardهای ایمنی

Guard مشترک `scripts/test-db-guard.js` قبل از CLI، `NODE_ENV=test`، host محلی، port `55432`، نام دقیق DB و User تستی، وجود credential تستی و متفاوت‌بودن نام DB از dev/prod را الزام می‌کند.

- ورودی مجاز `elluria_test / elluria_test_user` پذیرفته شد؛ exit code `0`.
- `DB_NAME_TEST=other_test` پیش از هر اتصال رد شد؛ exit code `1`.
- User اشتباه پیش از هر اتصال رد شد؛ exit code `1`.

اسکریپت Guard هیچ client دیتابیس یا مسیر اتصال ندارد؛ دو آزمون منفی بدون اتصال اجرا شدند.

## نتیجهٔ Migrationهای `up`

- مبدا: PostgreSQL تازه و Volume تازه، بدون schema یا دادهٔ قبلی.
- تعداد فایل‌ها و تعداد موفق: **`39/39`**.
- نتیجه: موفقیت کامل؛ اولین Migration شکست‌خورده وجود ندارد.
- اولین Migration: `20250710193743-create-Role.js`.
- آخرین Migration: `20250817121225-add-variant-id-to-inventorylogs.js.js`.
- هیچ Seeder اجرا نشد.

`npm run test:db:status` هر ۳۹ مورد را `up` گزارش کرد. جدول `SequelizeMeta` دقیقاً ۳۹ row داشت:

```text
count = 39
min   = 20250710193743-create-Role.js
max   = 20250817121225-add-variant-id-to-inventorylogs.js.js
```

## Schema snapshot

پس از موفقیت ۳۹/۳۹، `npm run test:db:schema` اجرا و schema واقعی در `docs/project-audit/migration-schema.sql` ثبت شد.

| مورد | نتیجه |
| --- | --- |
| روش | `pg_dump --schema-only --no-owner --no-privileges` داخل Service تست |
| اندازه | `56,380` bytes |
| SHA-256 | `5B07A4884FD2DC8D0E820A7BE34E2DE9F19523171C04593AAE49650BB7CE6EDA` |
| داده | هیچ `COPY`، `INSERT INTO` یا data terminator یافت نشد |
| Secret | password، `DB_PASSWORD` یا credential تستی یافت نشد |

Catalog واقعی PostgreSQL شامل ۳۲ table است: ۳۱ table کاربردی متناظر با ۳۱ Model، به‌علاوهٔ `SequelizeMeta`.

| جزء | تعداد |
| --- | ---: |
| Table | 32 |
| Column | 245 |
| Primary key | 32 |
| Foreign key | 44 |
| Unique constraint | 25 |
| Index | 57 |

تمام ۳۱ Model و ۲۳۷ ستون مشترک با schema واقعی مقایسه شدند. هر ۴۴ FK مورد انتظار associationهای Model در DB وجود داشت. index مستقلی بیرون از indexهای constraint-backed وجود نداشت.

## اختلاف‌های واقعی Model و Migration/DB

### اختلاف‌های تأییدشده

1. `CampaignProducts.original_price` در Model برابر `DECIMAL(10,2) NOT NULL` است، اما DB واقعی `numeric(10,2) NULL` دارد. نوع معادل است؛ اختلاف واقعی nullability است.
2. هفت جدول واسط زیر در DB ستون surrogate `id` و `PRIMARY KEY (id)` دارند، ولی Model ستون `id` ندارد و دو foreign key را composite primary key تعریف می‌کند:
   - `CampaignProducts` (`campaign_id`, `product_id`)
   - `CouponBrands` (`coupon_id`, `brand_id`)
   - `CouponCategories` (`coupon_id`, `category_id`)
   - `CouponProducts` (`coupon_id`, `product_id`)
   - `UserCoupons` (`user_id`, `coupon_id`)
   - `UserCouponUsages` (`user_id`, `coupon_id`)
   - `VariantValues` (`variant_id`, `attribute_value_id`)
3. DB برای هر هفت جدول بالا unique constraint روی زوج foreign key دارد؛ uniqueness زوج‌ها برقرار است، اما هویت PK با Model یکسان نیست.
4. DB دارای `UNIQUE (attribute_id, value)` روی `AttributeValues` است که در Model به‌صورت unique/index صریح اعلام نشده است.

### مواردی که اختلاف واقعی نبودند

- همهٔ `DECIMAL(10,2)`ها در catalog به‌صورت استاندارد PostgreSQL یعنی `numeric(10,2)` با precision/scale برابر ثبت شده‌اند.
- `Settings.key` در Model هم `primaryKey` و هم `unique` است. DB فقط PK constraint دارد؛ PK همان تضمین uniqueness را می‌دهد و index یکتای جداگانه لازم نیست.
- default صریح `NULL::numeric` برای `Coupons.max_discount_amount` از نظر معنایی با `defaultValue: null` برابر است.
- غیر از هفت `id` بالا، ستون فقط-Model یا فقط-DB یافت نشد و هیچ FK مورد انتظار Model گم نشده بود.

Static Audit با schema واقعی هم‌راستا بود: ۳۹ `up`، ۳۱ table کاربردی، هفت `id` اضافی و nullability مربوط به `CampaignProducts.original_price`. پیمایش ایستای ۳۹ تابع `down` نیز کامل شد، ولی جایگزین rollback واقعی نیست.

## ریسک‌های ثبت‌شدهٔ Migration

این baseline Migrationها را اصلاح نکرد:

- `20250811150056-modify-cart-items-for-variants.js` در `up` تمام `CartItems` را حذف می‌کند.
- `20250812154540-modify-order-items-for-variants.js` در `up` تمام `OrderItems` را حذف می‌کند.
- rollback این دو migration ستون non-null قدیمی را بدون backfill برمی‌گرداند و روی دادهٔ موجود قابل اتکا نیست.
- `20250817121225-add-variant-id-to-inventorylogs.js.js` ستون `variant_id NOT NULL` را بدون default، backfill یا FK اضافه می‌کند؛ DB این baseline خالی بود، بنابراین موفق شد.
- `InventoryLogs.variant_id` در schema واقعی FK ندارد و Model نیز association متناظر تعریف نکرده است.
- این مرحله فقط مسیر `up` روی DB خالی را اثبات می‌کند؛ rollback واقعی و migration روی دادهٔ production-like آزمایش نشد.

## Cleanup

پس از ثبت شواهد، `docker compose -f compose.test.yml down --volumes --remove-orphans` اجرا شد:

- Container `elluria-postgres-test` حذف شد.
- Volume `elluria-runtime-test-postgres-data` حذف شد.
- Network `elluria-runtime-test_default` حذف شد.
- جست‌وجوی مجدد بر اساس project label، نام دقیق Container/Volume و port `55432` هیچ نتیجه‌ای نداشت.
- هیچ resource یا Image دیگری حذف یا prune نشد؛ Image pull‌شده حفظ شد.

## محدودیت‌ها و گام بعدی

- موفقیت ۳۹/۳۹ فقط ساخت schema روی DB کاملاً خالی را ثابت می‌کند، نه ایمنی migration روی دادهٔ موجود.
- Static `down` audit موفق بود، اما rollback واقعی روی DB دارای fixture/data اجرا نشد.
- اختلاف‌های PK جدول‌های واسط و nullability `CampaignProducts.original_price` باید در مرحلهٔ طراحی بعدی تعیین تکلیف شوند؛ اینجا هیچ Model یا Migration اصلاح نشد.
- پیش از production، migrationهای cutover به Variant به rehearsal روی دادهٔ مشابه production، backup قابل بازیابی و طرح backfill نیاز دارند.
- گام بعدی: تصمیم معماری دربارهٔ surrogate/composite PK و nullability، سپس یک Migration اصلاحی جدید (نه ویرایش Migrationهای اعمال‌شده) و rehearsal جداگانه با دادهٔ fixture.
