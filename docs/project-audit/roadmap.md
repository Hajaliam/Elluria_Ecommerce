# نقشهٔ راه ریفکتور و ادامهٔ توسعه

این برنامه اجرا نشده است. اصلاح رفتار از تغییر ساختار جدا نگه داشته شده است.

## مرحله 0 — محیط و baseline (اولویت P0)

مالکیت: platform/testing. یک PostgreSQL تست disposable، env نمونه بدون secret و adapterهای fake برای Gemini/SMTP/SMS/payment/backup بسازید. Migrationها را روی DB خالی اجرا و schema را snapshot کنید.

معیار پذیرش: همهٔ Migrationها روی DB خالی بالا/پایین می‌روند؛ server با fakeها boot می‌شود؛ هیچ اتصال production ممکن نیست. مسیر بازگشت: فقط فایل‌های test/config جدا، بدون تغییر production behavior.

## مرحله 1 — تست‌های ثبت رفتار فعلی (P0)

برای route mount/auth/CSRF، register/login/OTP، product/variant، guest/user cart، place order/cancel/expiry، coupon matrix، campaign public/admin، payment callback و shipping تست integration بنویسید. ابتدا تست‌هایی که شکست فعلی را مستند می‌کنند با نام `known-broken` جدا شوند.

معیار: هر `F-001` تا `F-019` حداقل یک بازتولید خودکار دارد. rollback: حذف صرف testها.

## مرحله 2 — اصلاحات امنیتی مستقل (P0، تغییر رفتار)

1. requireAuth را از optionalAuth جدا کنید.
2. IDOR آدرس و مالکیت shipping address را ببندید.
3. import کمپین را admin-only و CSRF-protected کنید؛ `/active` را قابل دسترس کنید.
4. payment verify جعلی را غیرفعال/ایزوله کنید.
5. Socket identity را server-side احراز کنید.
6. seed credential، static root serving و PII logging را ایمن کنید.

معیار: تست‌های unauthorized برای تمام routeهای حساس 401/403 می‌دهند؛ public endpointها همچنان کار می‌کنند. هر تغییر commit کوچک و revert مستقل داشته باشد.

## مرحله 3 — تثبیت مدل Variant و موجودی (P0، تغییر رفتار/داده)

مالکیت داده: Catalog owns Product/Variant/Attribute؛ Inventory owns stock و InventoryLog. تصمیم بگیرید stock سطح Product حذف/derived است یا مستقل. `InventoryLog.variant_id` را متناسب با تصمیم nullable/required کنید. payment، expiry، seed و report را variant-aware کنید. migration مخرب قدیمی را برای deployment جدید annotate/جایگزین کنید.

معیار: یک order با دو variant رزرو، پرداخت/انقضا/لغو و audit متوازن دارد؛ هیچ مسیر `CartItem.product_id` یا `OrderItem.product_id` باقی نمی‌ماند. rollback: migration دو مرحله‌ای expand/contract.

## مرحله 4 — سفارش/پرداخت/کوپن اتمیک (P0-P1، تغییر رفتار)

Order snapshot باید subtotal/discount/shipping/final، item price و coupon decision را ذخیره کند. state machine صریح تعریف شود. clearing cart، reservation، coupon counters و idempotency در transactionهای درست انجام شود. Payment adapter contract و webhook signature تعریف شود.

معیار: retry و concurrent requests duplicate Payment/Order یا stock منفی نمی‌سازند؛ coupon limits زیر load رعایت می‌شوند؛ cancel/expire compensation کامل است.

## مرحله 5 — مرزبندی ماژول‌ها (P1، ساختاری)

```text
modules/
  identity/        User, Role, auth, OTP, reset
  catalog/         Category, Brand, Product, Variant, Attribute, Campaign read model
  pricing/         CampaignProduct, Coupon*, price/discount policy
  cart/            Cart, CartItem, merge policy
  ordering/        Order, OrderItem, OrderHistory, orchestration
  payments/        Payment, gateway adapters, webhook
  inventory/       stock policy, InventoryLog
  fulfillment/     Address, ShipmentTracking
  engagement/      Review, Advice/AI
  administration/  imports, exports, reports, settings, backup
```

وابستگی‌ها به سمت domain/use-case باشند؛ HTTP و Sequelize adapter بیرونی بمانند. مالکیت دادهٔ مشترک با interface مشخص شود. `Product.campaign_id` یا M:N یکی حذف شود، نه هر دو.

معیار: controller فقط parse/authorize/DTO؛ transaction در use-case؛ مدل مستقیم در controllerهای domain وجود ندارد. جابه‌جایی هر module با تست‌های baseline و revert ساده.

## مرحله 6 — قرارداد API و آمادگی frontend (P1)

پیش از frontend تثبیت کنید: auth token/refresh/cookie strategy، error envelope، pagination، money representation، product+variant DTO، cart totals، order state machine، payment redirect/webhook، coupon preview/apply، campaign active، upload URL و CSRF policy. OpenAPI از route/schema معتبر تولید یا در CI validate شود.

معیار: کاتالوگ API با OpenAPI و integration tests یکسان؛ endpoint versioning تصمیم‌گیری شده؛ نمونه response واقعی برای همه flowهای frontend موجود.

## مرحله 7 — کیفیت عملیاتی (P2)

health/readiness، structured logging با redaction/correlation، metrics، backup restore drill، retention، dependency/security audit و CI (lint/test/migration check) اضافه شود.

## کارهای باقی‌ماندهٔ بک‌اند

- gateway واقعی یا adapter رسمی و refund؛ refresh/logout/revocation؛ OTP سالم.
- validation schema مرکزی برای همه body/query/path و upload.
- state/transitionهای order/payment/shipment و notificationها.
- coupon preview و قواعد first purchase/exclusive/group/brand/category دقیق.
- consistency variant inventory/report/profit/import/export.
- policy گفت‌وگوی AI، auth، retention و پاک‌سازی history.
- تست، observability، API versioning و مستندات deployment.

## ترتیب وابستگی

0 → 1 → 2 و 3 → 4 → 5 → 6 → 7. ساخت frontend فقط پس از بخش‌های ضروری مرحله 4 و قراردادهای مرحله 6 توصیه می‌شود.
