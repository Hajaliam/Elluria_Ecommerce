# فهرست فایل‌ها و پوشش بررسی

## شمارش مبنا

پیش از ایجاد این گزارش‌ها ۱۸۶ فایل وجود داشت: ۱۶۰ `.js`، ۷ `.jpg`، ۳ `.sql`، ۳ `.log`، ۳ `.json`، ۲ `.gitignore`، ۲ `.xml`، و هرکدام یک `.html`, `.iml`, `.md`, `.prettierrc`, `.txt` و LICENSE بدون پسوند. پس از افزودن ۹ فایل `docs/project-audit/*.md` شمار کل ۱۹۵ است.

کد وضعیت: **کامل** = متن کامل/ساختار و مسیر مصرف بررسی شد؛ **مصنوع** = باینری یا خروجی عملیاتی، فقط metadata/ریسک؛ **مرجع** = متن غیرمنطقی/مستندات خوانده شد؛ **خروجی ممیزی** = در این مرحله ساخته شد.

## ریشه و تنظیمات

| فایل | مسئولیت | وضعیت |
|---|---|---|
| `.eslintrc.json` | lint؛ JSON دارای comment و ناسازگاری محتمل ESLint 9 | کامل |
| `.gitignore` | exclude node_modules/env/log patterns/build؛ خود `logs/`, `backups/`, uploads را ignore نمی‌کند | کامل |
| `.prettierrc` | format | کامل |
| `package.json` | dependency/scripts؛ main ناموجود و test placeholder | کامل |
| `package-lock.json` | lockfile v3؛ نسخه‌های قفل‌شده | کامل (metadata/package graph؛ dependency source وجود ندارد) |
| `server.js` | entrypoint HTTP/Socket/jobs | کامل |
| `start_frontend_dev.js` | static test server | کامل |
| `ws_test.html` | Socket AI test client | کامل |
| `README.md` | معرفی شخصی نامرتبط | کامل |
| `structure.txt` | snapshot ساختار قدیمی | مرجع |
| `LICENSE` | MIT text، در تضاد با package license=ISC | مرجع |
| `config/config.js` | Sequelize env config | کامل |
| `models/index.js` | dynamic model loader/associations | کامل |

## فایل‌های IDE

`.idea/.gitignore`, `.idea/Lamora_project.iml`, `.idea/modules.xml`, `.idea/vcs.xml` — metadata IDE، بدون منطق runtime؛ کامل/مرجع. `vcs.xml` وجود Git را القا می‌کند ولی `.git` در پوشه نیست.

## `src/config`, middleware و error

| فایل | مسئولیت | وضعیت |
|---|---|---|
| `src/config/logger.js` | Winston console/file log | کامل |
| `src/config/swagger.js` | OpenAPI schemas/config | کامل؛ 29KB، با route annotations تطبیق داده شد |
| `src/middlewares/authMiddleware.js` | optional JWT، role، payment auth، CSRF bypass | کامل |
| `src/middlewares/rateLimitMiddleware.js` | limitهای auth/general/forgot/OTP/payment | کامل |
| `src/errors/ValidationError.js` | خطای 400 کوپن | کامل |

## مدل‌ها (۳۱/۳۱ کامل)

`src/models/address.js` (آدرس)، `attribute.js` (ویژگی)، `attributevalue.js` (مقدار)، `brand.js`، `campaign.js`، `campaignproduct.js`، `cart.js`، `cartitem.js`، `category.js`، `coupon.js`، `couponbrand.js`، `couponcategory.js`، `coupongroup.js`، `couponproduct.js`، `inventorylog.js`، `onlineshoppingadvice.js`، `order.js`، `orderhistory.js`، `orderitem.js`، `payment.js`، `product.js`، `productvariant.js`، `profitlog.js`، `review.js`، `role.js`، `setting.js`، `shipmenttracking.js`، `user.js`، `usercoupon.js`، `usercouponusage.js`، `variantvalue.js`.

برای هر فایل fields/null/default/constraint/association با migration و مصرف‌کننده تطبیق شد؛ نتیجه در `domain-catalog.md`.

## repositoryها (۲۱/۲۱ کامل)

| فایل‌ها | مسئولیت/یافته |
|---|---|
| `addressRepository.js`, `userRepository.js`, `roleRepository.js` | persistence identity/address؛ متدهای `findAll` عمومی و cart association مورد انتظار service وجود ندارند |
| `categoryRepository.js`, `brandRepository.js`, `productRepository.js` | catalog query؛ ProductRepo متد findAll مورد انتظار CouponService ندارد |
| `attributeRepository.js`, `attributeValueRepository.js`, `productVariantRepository.js`, `variantValueRepository.js` | variant/attribute CRUD و include |
| `cartRepository.js`, `cartItemRepository.js` | cart lookup/detail/delete؛ merge method گمشده |
| `orderRepository.js`, `orderItemRepository.js`, `orderHistoryRepository.js` | order persistence/detail/history |
| `couponRepository.js`, `couponProductRepository.js`, `couponCategoryRepository.js`, `userCouponRepository.js`, `userCouponUsageRepository.js` | coupon relations/usage؛ alias `usages` غلط و count row به‌جای usage_count |
| `inventoryLogRepository.js` | create-only audit |

## serviceها (۱۱/۱۱ کامل)

`attributeService.js`, `attributeValueService.js`, `brandService.js`, `cartService.js`, `categoryService.js`, `couponService.js`, `couponValidationService.js`, `orderService.js`, `productService.js`, `productVariantService.js`, `userService.js` — تمام متدها و transaction boundaryها بررسی شدند. یافته‌های اصلی `F-005` تا `F-018`.

## controllerها (۱۸/۱۸ کامل)

| فایل | مسئولیت |
|---|---|
| `adminController.js` | user admin، ۸ export، reportها، ۸ import؛ ۳۱۰۵ خط/چندمسئولیتی |
| `campaignController.js` | campaign CRUD/import/active/product removal |
| `paymentController.js`, `shippingController.js`, `orderController.js`, `cartController.js` | checkout/payment/fulfillment |
| `productController.js`, `productVariantController.js`, `categoryController.js`, `brandController.js`, `attributeController.js`, `attributeValueController.js` | catalog |
| `couponController.js` | coupon CRUD |
| `userController.js` | auth/profile/address/reset/OTP |
| `reviewController.js`, `onlineShoppingAdviceController.js` | engagement |
| `searchController.js`, `settingController.js` | search/settings |

Response code/error handling و مدل/service calls با routeها تطبیق شد.

## routeها (۱۸/۱۸ کامل)

`adminRoutes.js`, `attributeRoutes.js`, `attributeValueRoutes.js`, `brandRoutes.js`, `campaignRoutes.js`, `cartRoutes.js`, `categoryRoutes.js`, `couponRoutes.js`, `onlineShoppingAdviceRoutes.js`, `orderRoutes.js`, `paymentRoutes.js`, `productRoutes.js`, `productVariantRoutes.js`, `reviewRoutes.js`, `searchRoutes.js`, `settingRoutes.js`, `shippingRoutes.js`, `userRoutes.js`.

تمام ۱۰۶ declaration روش/مسیر، middleware و handler استخراج شد. ۱۷ router به‌طور مستقیم mount هستند؛ `onlineShoppingAdviceRoutes` با ۴ declaration mount نیست. برخی routerها دو بار mount می‌شوند (brand/campaign/attribute values/variants). جزئیات `api-catalog.md`.

## utilityها (۹/۹ کامل)

| فایل | مسئولیت/وضعیت اتصال |
|---|---|
| `aiService.js` | Gemini + catalog prompt؛ متصل به Socket |
| `backupService.js` | pg_dump/retention/cron/manual؛ متصل |
| `categoryTreeBuilder.js`, `descendantCategoryIds.js` | helpers؛ متصل |
| `emailService.js`, `smsService.js` | external messaging؛ متصل به UserService |
| `orderCleanupService.js` | hourly expiry؛ متصل ولی schema-incompatible |
| `sanitizer.js` | XSS sanitizer؛ متصل |
| `InventoryLogService.js` | snippet با متغیرهای آزاد؛ بدون مصرف‌کننده |

## Migrationها (۳۹/۳۹ کامل)

به‌ترتیب:

1. `20250710193743-create-Role.js`
2. `20250710193813-create-User.js`
3. `20250710193843-create-Category.js`
4. `20250710193859-create-Product.js`
5. `20250710193915-create-Address.js`
6. `20250710193928-create-Cart.js`
7. `20250710193941-create-CartItem.js`
8. `20250710193956-create-Coupon.js`
9. `20250710194009-create-Order.js`
10. `20250710194018-create-OrderItem.js`
11. `20250710194032-create-Payment.js`
12. `20250710194045-create-Review.js`
13. `20250710194107-create-online-shopping-advice-table.js`
14. `20250710194127-create-OrderHistory.js`
15. `20250710194138-create-Setting.js`
16. `20250713105558-add-password-reset-fields-to-user.js`
17. `20250714161834-add-otp-fields-to-user.js`
18. `20250715104714-add-is-first-purchase-to-coupon.js`
19. `20250715124318-add-brand-to-products.js`
20. `20250716123950-create-inventory-log-table.js`
21. `20250718191737-add-comprehensive-coupon-features.js`
22. `20250722090359-add-coupon-categories.js`
23. `20250722091240-add-parent-id-to-category.js`
24. `20250723131855-add-max-discount-amount-to-coupon.js`
25. `20250723212653-add-profit-tracking.js`
26. `20250723215602-add-discount-shipping-to-orders.js`
27. `20250726110958-add-total-profit-to-orders.js`
28. `20250726162843-create-shipment-tracking-table.js`
29. `20250727130443-create-campaign-system.js`
30. `20250802121238-add-campaign-price-to-campaignProduct.js`
31. `20250802122125-add-original-price-to-campainProduct.js`
32. `20250805161700-create-coupon-brands.js`
33. `20250807125425-create-attributes-table.js`
34. `20250807125516-create-attribute-values-table.js`
35. `20250807125633-create-product-variants-table.js`
36. `20250807125853-create-variant-values-table.js`
37. `20250811150056-modify-cart-items-for-variants.js`
38. `20250812154540-modify-order-items-for-variants.js`
39. `20250817121225-add-variant-id-to-inventorylogs.js.js`

همه کامل بررسی شدند. موارد مهم: migrationهای 37/38 داده را حذف می‌کنند؛ شماره 39 پسوند دوبل دارد و FK برای variant تعریف نمی‌کند؛ CampaignProduct original_price در migration nullable ولی مدل required؛ joinها در migration id دارند ولی مدل composite PK تعریف می‌کند.

## Seederها (۴/۴ کامل)

- `20250711105849-add-default-roles.js`: admin/customer.
- `20250712114902-add-sample-products-categories.js`: admin credential ثابت، category/product قدیمی.
- `20250712114955-add-sample-addresses.js`: آدرس نمونه.
- `20250712115035-add-sample-orders-payments.js`: OrderItem product_id قدیمی و پس از variant migration ناسازگار.

هیچ Seeder اجرا نشد.

## مصنوع‌ها و داده‌های کنارگذاشته‌شده

| مسیر | تعداد | دلیل کنارگذاری |
|---|---:|---|
| `public/uploads/products/*.jpg` | ۷ | باینری تصویر؛ فقط نام/اندازه و اتصال URL بررسی شد |
| `backups/elluria_20250804_000000.sql`, `...0810...`, `...0812...` | ۳ | dump داده؛ ممکن است PII/secret داشته باشد، برای ممیزی منطق لازم نبود و بازنشر نشد |
| `logs/combined.log`, `logs/error.log`, `logs/send-login.log` | ۳ | خروجی runtime و بالقوه PII؛ اندازه/وجود بررسی، محتوا در گزارش کپی نشد |

dependencyهای نصب‌شده (`node_modules`) و build/dist وجود نداشتند. `temp/` نیز فعلاً وجود نداشت، هرچند uploadها آن را فرض می‌کنند.

## خروجی‌های ممیزی

`README.md`, `file-inventory.md`, `architecture.md`, `domain-catalog.md`, `feature-catalog.md`, `api-catalog.md`, `business-flows.md`, `findings.md`, `roadmap.md` در همین پوشه؛ وضعیت **خروجی ممیزی**.

## کنترل کامل‌بودن

- کد/پیکربندی/مستند متن: ۱۷۳ فایل مبنا بررسی شد (۱۶۰ JS + ۱۳ متن/تنظیم/IDE).
- کنارگذاشته‌شده از بررسی محتوایی: ۱۳ فایل مصنوع (۷ تصویر، ۳ dump، ۳ log).
- باقی‌ماندهٔ خواندن فایل: صفر.
- JavaScript syntax check: ۱۶۰/۱۶۰، failure صفر.
- تست runtime/integration: صفر؛ دلیل: تست موجود نیست، `node_modules` نصب نیست، DB/service ایزوله فراهم نیست.
- Git coverage: غیرقابل انجام؛ `.git` موجود نیست.
