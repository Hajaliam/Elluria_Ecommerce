# کاتالوگ API و قراردادهای فعلی

Prefix اصلی `/api` است و version ندارد. قراردادها **استنباط‌شده از کد** هستند مگر «Swagger» ذکر شود. پاسخ خطا یکدست نیست: غالباً `{message}`, گاهی `{message,error}` و خطای global `{message,error}`. `authenticateToken` در نبود token عبور می‌دهد؛ در جدول «token*» یعنی طراحی route چنین است ولی enforcement ناقص است.

## عمومی و کاربر

| Method + path | Auth/CSRF | ورودی اصلی | پاسخ/اثر | وضعیت/شاهد |
|---|---|---|---|---|
| GET `/` | عمومی | — | text welcome 200 | `server.js:135-137` |
| GET `/api/csrf-token` | عمومی | cookie | `{csrfToken}` 200 | `server.js:118-121` |
| POST `/api/users/register` | CSRF, 10/15m | body username,email,password,first_name,last_name,phone? | user بدون password، 201 | `userRoutes.js:95`; validation فقط service/model |
| POST `/api/users/login` | CSRF, 10/15m | username,password؛ session cookie | accessToken,refreshToken,user 200 | ناقص merge |
| GET `/api/users/profile` | token*+CSRF | — | user+role 200 | handler inline؛ 404/500 |
| GET `/api/users/me` | token*+CSRF | — | profile 200 | تکرار profile |
| PUT `/api/users/me` | token*+CSRF | username/email/names/phone | user 200 | password/role تغییر نمی‌کند |
| POST `/api/users/:userId/addresses` | token*+CSRF + self/admin guard | address fields | address 201 | guard role DB |
| GET `/api/users/:userId/addresses` | token* | path userId | addresses 200 | IDOR؛ guard ندارد |
| POST `/api/users/forgot-password` | bypass | identifier | generic 200 | rate limiter تعریف‌شده ولی متصل نیست |
| POST `/api/users/reset-password/:token` | bypass | newPassword≥8 | 200 | token email/code SMS |
| POST `/api/users/request-otp` | bypass | phone_number | 200 | 404 user؛ no limiter |
| POST `/api/users/verify-otp` | bypass, 5/5m | phone_number,otp_code | طراحی token 200 | عملاً 401 به علت `F-009` |

## کاتالوگ

| Method + path | Auth/CSRF | Query/body/file | پاسخ/اثر | قرارداد |
|---|---|---|---|---|
| GET `/api/categories` | عمومی+CSRF middleware | — | tree 200 | استنباطی |
| GET `/api/categories/:id` | عمومی+CSRF | id | category | استنباطی |
| GET `/api/categories/:id/children` | عمومی+CSRF | id | subtree | استنباطی |
| POST `/api/categories` | admin+CSRF | name,description,parent_id | 201 | Swagger/کد |
| PUT `/api/categories/:id` | admin+CSRF | partial | 200 | Swagger/کد |
| DELETE `/api/categories/:id` | admin+CSRF | id | 200؛ FK 400 | Swagger/کد |
| GET `/api/products` | عمومی+CSRF | categoryId,brand_id,search,minPrice,maxPrice,limit,offset,sortBy,sortOrder | `{total,limit,offset,products}` طراحی | شکسته contract |
| GET `/api/products/:id` | عمومی+CSRF | id | product + view++ | استنباطی |
| POST `/api/products` | admin+CSRF multipart `image`≤5MB image/* + fields | product | 201 | شکسته service |
| PUT `/api/products/:id` | admin+CSRF multipart | partial | 200 | شکسته service |
| DELETE `/api/products/:id` | admin+CSRF | id | 200 | hard delete |
| GET `/api/brands` | عمومی | — | `{brands}` | صریح |
| GET `/api/brands/:id` | عمومی | id | `{brand,categories}` | ناقص tree |
| POST `/api/brands` و `/api/admin/brands` | admin | name | 201 | mount admin middleware تکراری |
| PUT `/api/brands/:id` و admin variant | admin | name | 200 | — |
| DELETE `/api/brands/:id` و admin variant | admin | id | 200 | — |
| GET `/api/admin/attributes` | عمومی در خود router، ولی مسیر admin نام دارد | — | attributes+values | rate 100/15m |
| GET `/api/admin/attributes/:id` | عمومی | id | attribute | rate |
| POST/PUT/DELETE `/api/admin/attributes[/ :id]` | admin | name | 201/200 | سه endpoint مستقل |
| GET `/api/attributes/:attributeId/values` | عمومی | attributeId | values | rate |
| GET `/api/admin/attributes/:attributeId/values` | عمومی در handler | attributeId | values | admin prefix ولی بدون role |
| POST `/api/{admin/}attributes/:attributeId/values` | admin | value | 201 | همان router روی دو mount |
| PUT `/api/{admin/}attributes/:attributeId/values/:valueId` | admin | value | 200 | — |
| DELETE مسیر بالا | admin | valueId | 200 | — |
| GET `/api/products/:productId/variants` و admin variant | عمومی | productId | variants | rate |
| POST `/api/products/:productId/variants` و admin variant | admin | price,stock_quantity,sku,image_url,values[] | 201 | — |
| PUT/DELETE `/api/products/:productId/variants/:variantId` و admin variant | admin | partial/id | 200 | productId در ownership variant validate نمی‌شود |
| GET `/api/search` | عمومی | query required؛ price/stock/rating/brand/page/sort | products,categories | maxRating bug |

نکته: notation `/api/{admin/}` بالا خلاصهٔ دو mount واقعی است، نه syntax literal API.

## سبد، سفارش، پرداخت و ارسال

| Method + path | Auth/CSRF | ورودی | پاسخ/اثر | وضعیت |
|---|---|---|---|---|
| POST `/api/cart/add` | token*+CSRF | variantId,quantity | cartItem 200 | guest عملاً مجاز؛ validation ناقص |
| GET `/api/cart` | token*+CSRF | cookie/token | cart DTO | فعال ایستا |
| PUT `/api/cart/:cartItemId` | token*+CSRF | quantity>0 | item 200 | stock check |
| DELETE `/api/cart/:cartItemId` | token*+CSRF | id | 200 | — |
| DELETE `/api/cart` | token*+CSRF | — | 200 | clear |
| POST `/api/orders/place-order` | token*+CSRF | shippingAddressId,couponCode? | orderId,totalAmount 201 | ناقص/کوپن شکسته |
| GET `/api/orders` | token*+CSRF | user_id/status/payment_status برای admin | orders | role object bug محتمل |
| GET `/api/orders/:id` | token*+CSRF | id | detail | مالک یا role_id2 |
| PUT `/api/orders/:id/status` | admin+CSRF | status | order 200 | status آزاد |
| POST `/api/orders/:id/cancel` | token*+CSRF | id | order 200 | مالک/admin |
| POST `/api/payments/initiate` | require token, 5/min، بدون global CSRF | orderId | fake gateway URL | Mock |
| GET `/api/payments/verify` | عمومی | Authority,Status,orderId query | paymentId/orderId | بحرانی و شکسته |
| POST `/api/shipping` | admin | orderId,provider_name,tracking_code?,status,estimated? | 201 | transaction |
| PUT `/api/shipping/:orderId` | admin | provider_name,status required و بقیه | 200 | upsert tracking |
| GET `/api/shipping/:orderId` | token* | id | shipment | مالک/admin |

## کوپن و کمپین

| Method + path | Auth | ورودی/فیلتر | پاسخ/اثر | وضعیت |
|---|---|---|---|---|
| POST `/api/coupons` | admin+CSRF | تمام fields و product/user/category/brand ids | coupon 201 | ناقص |
| GET `/api/coupons` | admin+CSRF | — | coupons | فعال ایستا |
| GET `/api/coupons/:code` | admin+CSRF | code | coupon | فعال ایستا |
| PUT `/api/coupons/:id` | admin+CSRF | partial/scopes | coupon | ناقص |
| DELETE `/api/coupons/:code` | admin+CSRF | code | 200 | hard delete |
| POST `/api/admin/campaigns` و `/api/campaigns` | admin | campaign+products[] | 201 | CSRF ندارد |
| POST `.../campaigns/:campaignId/import-products` | **بدون auth** | multipart file≤10MB + format csv/excel | counts/errors | بحرانی؛ replace all |
| PUT/DELETE `.../campaigns/:id` | admin | partial/id | 200 | — |
| DELETE `.../campaigns/:campaignId/products/:productId` | admin | ids | 200 | — |
| GET `.../campaigns` و `.../campaigns/:id` | admin | —/id | data | هر دو mount admin-only |
| GET `.../campaigns/active` | طراحی عمومی | — | active campaigns | unreachable به‌علت ordering |

## Review، Settings، Admin، Docs

| مسیر | قرارداد فشرده |
|---|---|
| POST `/api/reviews` | token*+CSRF؛ body product_id,rating,comment؛ 201/404/409 |
| GET `/api/reviews/product/:productId` | عمومی+CSRF؛ reviews 200 |
| PUT/DELETE `/api/reviews/:id` | token*+CSRF؛ مالک/admin؛ 200 |
| POST `/api/settings` | router-level admin؛ key,value؛ upsert 200 |
| GET `/api/settings`, GET `/api/settings/:key`, DELETE `/api/settings/:key` | admin؛ list/get/delete |
| GET `/api/admin/dashboard` | admin+CSRF؛ welcome |
| GET `/api/admin/users`, `/users/:id`; PUT/DELETE `/users/:id` | admin+CSRF؛ مدیریت کاربر |
| GET `/api/admin/exports/categories|products|users|orders|payments|coupons|reviews|inventory` | admin+CSRF؛ query `format=json|csv|excel` و فیلترهای خاص |
| GET `/api/admin/exports/reports` | admin؛ reportType sales/low_stock، format و date/threshold |
| GET `/api/admin/exports/reports/best-selling` | admin؛ format و dates/limit |
| GET `/api/admin/profit-report` | admin؛ dates,groupBy,format |
| POST `/api/admin/imports/categories|products|users|orders|payments|coupons|inventory|reviews` | admin+CSRF؛ multipart `file`, format csv/excel؛ 200 counts/errors |
| POST `/api/admin/backup` | دو declaration: یکی داخل admin router و یکی server direct؛ admin؛ شروع backup 200 |
| GET `/api-docs` | Swagger UI عمومی |
| GET `/uploads/*` | static عمومی |

`onlineShoppingAdviceRoutes` چهار قرارداد GET collection، GET id، PUT id، DELETE id دارد، اما هیچ prefix فعال ندارد و بنابراین API موجود محسوب نمی‌شود (`server.js` mount ندارد).

## Socket.IO

- ورودی `sendAdviceMessage`: `{userId?,sessionId?,message,topic?}`؛ schema/limit/auth ندارد.
- خروجی `receiveAdviceMessage`: `{sender,message}`.
- persistence: یک row user و یک row AI؛ error همان event با پیام عمومی.
- قرارداد استنباطی از `server.js:172-262`؛ نیازمند تأیید اجرایی.
