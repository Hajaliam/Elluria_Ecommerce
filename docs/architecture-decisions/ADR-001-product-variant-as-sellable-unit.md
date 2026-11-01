# ADR-001: ProductVariant به‌عنوان واحد قابل فروش و قابل آدرس‌دهی

- وضعیت: **Accepted**
- تاریخ: 2026-11-02
- تصمیم‌گیرندگان: تیم محصول و معماری Elluria
- دامنه: مدل دامنهٔ کاتالوگ، فروش، موجودی و هویت Variant

## Context

مخزن در میانهٔ مهاجرت از مدل Product-only به Product/ProductVariant قرار دارد. تاریخچه نشان می‌دهد `ada3701` مدل Variant را با `price` اختیاری، `stock_quantity` مستقل، SKU، تصویر و AttributeValueها ایجاد کرد؛ `42af69a`، CartItem را از `product_id` به `variant_id` منتقل کرد؛ `5ebd6b1` همین cutover را برای OrderItem انجام داد؛ و `6dcef09`، OrderService و InventoryLog را به Variant متصل کرد. بااین‌حال payment، cleanup، Seederها، import/export/report و بخش‌هایی از ProductService همچنان قرارداد Product-only را مصرف می‌کنند. در نتیجه اکنون دو منبع موجودی و دو برداشت ناسازگار از «واحد فروش» وجود دارد (`history-recovery.md`، بخش‌های «خلاصهٔ اجرایی»، «قبل و بعد از مهاجرت» و «Migration، Seeder و گزارش‌ها»؛ یافته‌های F-002، F-006 و F-008).

شواهد تاریخی بازگشت به Product-only را تأیید نمی‌کنند. `ProductVariant.price` از ابتدا nullable طراحی شده تا از Product ارث ببرد، ولی `ProductVariant.stock_quantity` مستقل و اجباری است. Cart و Order نیز پس از cutover فقط Variant را مرجع می‌گیرند. در مقابل هیچ سازوکار قابل اتکایی برای fallback موجودی Product یا همگام‌سازی Product و Variant وجود ندارد (`history-recovery.md`، بخش «Product.price و Product.stock_quantity» و «بخش‌های قدیمی که نباید بازگردند»).

مدل فعلی Variant هنوز آن را تا حد زیادی به یک ترکیب `values[]` محدود می‌کند و slug، وضعیت فروش و سیاست SEO مستقل ندارد. هدف تجاری و SEO جدید قطعی می‌کند که Variant صرفاً اتصال Product به AttributeValue یا یک انتخاب ظاهری در صفحهٔ Product نیست؛ Variant باید هویت درجه‌اول، قابل فروش و قابل آدرس‌دهی خود را حفظ کند. این هدف با جهت تاریخی مدل نیز سازگار است: SKU، تصویر، قیمت override و موجودی از `ada3701` روی خود Variant قرار گرفته‌اند، درحالی‌که Product نام، توضیح، category، brand و slug خانواده را نگه داشته است (`history-recovery.md`، ماتریس «محصول/کاتالوگ» و «Variant/ویژگی» و بخش «منطق سالم قابل انتقال به Variant»).

## Decision

1. **Product موجودیت و صفحهٔ مادر خانوادهٔ محصول است.** اطلاعات مشترک خانواده، از جمله نام، توضیح، category، brand و هویت صفحهٔ مادر، به Product تعلق دارد. Variant به Product وابسته است، اما واحد فروش Product نیست. این مرزبندی همان جهت ثبت‌شده در `ada3701` و جمع‌بندی «Product مادر؛ ProductVariant دارای SKU/price/stock/values» در `history-recovery.md` است.

2. **ProductVariant تنها واحد قابل فروش و یک موجودیت درجه‌اول است.** هر عملیات انتخاب کالا برای خرید باید یک `variant_id` مشخص داشته باشد. هر Variant هویت مستقل خود و قابلیت داشتن stock، SKU، price override، تصویر و وضعیت فروش مستقل را دارد. API و مدل دامنه نباید Variant را صرفاً به `values[]` یا اتصال Product و AttributeValue تقلیل دهند؛ شناسه و هویت Variant باید در تمام قراردادها حفظ شود. شواهد این تصمیم، انتقال CartItem و OrderItem به `variant_id` در `42af69a` و `5ebd6b1` و انتقال OrderService/InventoryLog در `6dcef09` است.

3. **هر Product قابل فروش باید حداقل یک Variant داشته باشد.** Product ساده با یک default variant بدون AttributeValue نمایش داده می‌شود. Product دارای گزینه نیز یک یا چند Variant دارد. Attribute و AttributeValue فقط ابعاد توصیفی Variant، مانند رنگ، حجم یا اندازه، هستند؛ AttributeValue نه واحد فروش است و نه محل موجودی. این تصمیم شکاف تاریخی صریحِ «default/no-attribute variant» را می‌بندد که در ماتریس «Variant/ویژگی» و بررسی Migration/Seeder در `history-recovery.md` ثبت شده است؛ migration اولیه Variant هیچ backfill یا default variant برای Productهای موجود نداشت.

4. **`ProductVariant.stock_quantity` تنها منبع حقیقت موجودی قابل فروش است.** کنترل قابلیت خرید، رزرو، کسر، بازگردانی، گزارش عملیاتی موجودی و InventoryLog باید به Variant مشخص متصل باشند. تاریخچه نشان می‌دهد Cart و Order فقط stock Variant را مصرف می‌کنند و هیچ تجمیع یا fallback قابل اتکایی برای Product stock وجود ندارد (`5ebd6b1` و `6dcef09`؛ `history-recovery.md`، بخش «Product.price و Product.stock_quantity» و ردیف «موجودی»).

5. **`Product.stock_quantity` در دورهٔ مهاجرت فقط legacy read-only است.** هیچ مسیر جدید یا اصلاح‌شده‌ای مجاز نیست آن را بنویسد یا برای تصمیم فروش به آن fallback کند. این ستون فقط تا پایان فرایند expand/backfill/verify نگه داشته می‌شود و سپس در مرحلهٔ contract حذف خواهد شد. این تصمیم تعارض ثبت‌شده میان ProductService/search/report/import/Seederهای قدیمی و Cart/Order جدید را حل می‌کند و با منع تاریخیِ «موجودی قابل فروش مستقیم روی Product» سازگار است.

6. **قیمت پایه `Product.price` است و `ProductVariant.price` فقط override اختیاری است.** فرمول واحد قیمت پایهٔ مؤثر چنین است:

   ```text
   effectiveBasePrice = variant.price ?? product.price
   ```

   فقط `null`/نبود override باعث fallback می‌شود؛ قیمت صفر یک مقدار معتبر است و نباید با قیمت Product جایگزین شود. این تصمیم قصد صریح migration `ada3701` را حفظ و خطای استفاده از `||` در CartService از `5ebd6b1` را اصلاح می‌کند (`history-recovery.md`، بخش «Product.price و Product.stock_quantity» و «منطق سالم قابل انتقال به Variant»). قیمت کمپین در این ADR تعیین نمی‌شود.

7. **تمام مسیرهای تراکنشی فروش بر `variant_id` تکیه می‌کنند.** CartItem، OrderItem، عملیات موجودی، ثبت/تأیید پرداخت، لغو و انقضا باید Variant را مرجع قرار دهند. callback پرداخت نباید Cart را دوباره بخواند و باید از OrderItemهای مرتبط با Variant استفاده کند. این تصمیم مستقیماً از cutoverهای `42af69a` و `5ebd6b1` و شکست‌های تاریخی F-002 و F-008 ناشی می‌شود؛ `history-recovery.md` نیز Order/OrderItems را منبع قطعی پرداخت و restore موجودی Variant را الزام جریان لغو/انقضا می‌داند.

8. **کوپن‌های Product، Category و Brand از طریق Product مادر Variant ارزیابی می‌شوند.** Variant ابتدا به Product خود resolve می‌شود و eligibility موجود Product/Category/Brand روی همان والد سنجیده می‌شود. هدف‌گیری مستقیم Variant فعلاً خارج از دامنه است. این تصمیم خطای تاریخی پاس‌دادن variant IDs به product eligibility را رفع می‌کند و از منطق قابل انتقال کوپن در `history-recovery.md` پیروی می‌کند.

9. **Variant باید قابل آدرس‌دهی پایدار باشد.** هر Variant قابلیت داشتن URL پایدار و slug منحصربه‌فرد در محدودهٔ Product را دارد. مدل دامنه و API باید این هویت مستقل را حفظ کنند تا معماری در آینده صفحهٔ مستقل و SEO Metadata اختصاصی Variant را پشتیبانی کند. ساختار نهایی slug و URL در ADR مستقل SEO/API تعیین خواهد شد؛ این ADR فقط capability و قید هویت را قطعی می‌کند.

10. **indexability و canonical برای Variant صریح و قابل‌کنترل است.** همهٔ Variantها الزاماً index نمی‌شوند. Variant بدون محتوای SEO اختصاصی باید بتواند canonical به Product مادر داشته باشد. تولید خودکار صفحهٔ indexable برای تمام ترکیب‌های Attribute ممنوع است. این محدودیت از یکسان‌گرفتن «ترکیب Attribute» با «مقصد SEO مستقل» جلوگیری می‌کند و با تصمیم درجه‌اول‌بودن Variant بدون تحمیل indexation عمومی سازگار است.

11. **بازگشت یا fallback دوگانه مجاز نیست.** بازگشت به Product-only، fallback موجودی Product و نگه‌داشتن دو مسیر دامنه‌ای جدا برای محصول ساده و متغیر ممنوع است. محصول ساده همان مسیر Variant را با default variant طی می‌کند. تاریخچه نشان می‌دهد مسیرهای موازی legacy علت اصلی ناسازگاری payment، cleanup، Seeder/import/report و InventoryLog بوده‌اند (`history-recovery.md`، «خلاصهٔ اجرایی»، «بخش‌های قدیمی که نباید بازگردند» و «Variant Migration Completion Map»).

## Consequences

- Product، نمای خانواده و محل داده‌های مشترک باقی می‌ماند؛ Variant هویت فروش، موجودی و قابلیت آدرس‌دهی را در اختیار دارد.
- تمام محصولات ساده و متغیر یک مسیر واحد برای Cart، Order، Inventory، Payment، Cancel و Expiry خواهند داشت؛ شرط‌های دامنه‌ای Product-only حذف می‌شوند.
- قراردادهای API باید `variantId` و هویت Variant را صریح نگه دارند و در صورت نیاز Product والد و AttributeValueهای توصیفی را به‌عنوان دادهٔ همراه ارائه کنند، نه اینکه Variant را به آرایهٔ values تبدیل کنند.
- قیمت صفر Variant معتبر می‌ماند و resolver قیمت باید nullish semantics داشته باشد.
- گزارش سطح Product می‌تواند aggregate/read model باشد، اما منبع موجودی قابل فروش نیست.
- Variant می‌تواند در آینده صفحه و metadata مستقل بگیرد، ولی وجود Variant به‌تنهایی مجوز index شدن یا ساخت خودکار صفحهٔ SEO نیست.
- تا تکمیل مهاجرت، برخی مصرف‌کننده‌های legacy عمداً ناسازگار شناخته می‌شوند و باید با failing regression tests برای رفتار صحیح هدف‌گذاری شوند؛ این ADR مجوز fallback موقت به Product را نمی‌دهد.

## Migration Constraints

1. این ADR به‌تنهایی مجوز تغییر schema یا داده نیست. اجرای بعدی باید با الگوی expand/backfill/verify/contract انجام شود و قبل از هر Migration با failing regression tests رفتار صحیح پوشش داده شود.
2. برای هر Product قابل فروش legacy باید یک default variant ساخته یا mapping صریح آن به Variant موجود تأیید شود. رکورد مبهم باید quarantine/گزارش شود؛ حذف داده یا `bulkDelete` مجاز نیست. این قید پاسخ مستقیم به migrationهای مخرب CartItem/OrderItem در `42af69a` و `5ebd6b1` است.
3. CartItem، OrderItem، InventoryLog و تمام ارجاع‌های عملیاتی باید پیش از حذف ستون/مسیر legacy دارای `variant_id` معتبر و قابل verify باشند. migration `6dcef09` نشان داد افزودن `variant_id NOT NULL` بدون FK، backfill و انتقال producerها کافی نیست.
4. در دورهٔ expand، خواندن legacy فقط برای backfill و verification مجاز است؛ dual-write به Product stock، fallback هنگام فروش یا ایجاد مسیر Product-only جدید ممنوع است.
5. حذف `Product.stock_quantity` فقط پس از backfill کامل، reconciliation موجودی، انتقال search/import/export/report/Seeder و اثبات نبود writer یا reader عملیاتی انجام می‌شود. سپس مرحلهٔ contract ستون و کد legacy را حذف می‌کند.
6. تغییر قیمت باید resolver واحد `variant.price ?? product.price` داشته باشد و برای `0`، `null` و مقدار مثبت regression test صریح وجود داشته باشد.
7. slug و وضعیت فروش Variant، در صورت افزوده‌شدن، باید به‌صورت expand و با backfill قابل تکرار وارد شوند. یکتایی slug در محدودهٔ Product و پایداری آدرس باید پیش از فعال‌سازی URL عمومی verify شود؛ ساختار URL هنوز در این ADR تعیین نشده است.
8. rollout صفحه‌های Variant باید مستقل از backfill فروش باشد. هیچ backfill ویژگی یا ترکیب Variant نباید خودکار صفحهٔ indexable تولید کند؛ indexability/canonical تا ADR مستقل SEO/API باید پیش‌فرض محافظه‌کارانه و صریح داشته باشد.
9. rollback فنی هر مرحله نباید معنای دامنه را به Product-only برگرداند. rollback باید مرحلهٔ deployment را بازگرداند، نه اینکه دوباره Product stock یا `product_id` را منبع فروش کند.

## Rejected Alternatives

### Product به‌عنوان واحد فروش باقی بماند

رد شد، چون جهت تاریخچه و schema جاری CartItem/OrderItem/OrderService را نقض می‌کند و ناسازگاری‌های F-002، F-006 و F-008 را دائمی می‌سازد. هیچ نسخهٔ end-to-end سالم Product-only برای بازگردانی وجود ندارد (`history-recovery.md`، «خلاصهٔ اجرایی»).

### موجودی Product به‌عنوان fallback یا منبع دوم نگه داشته شود

رد شد، چون هیچ الگوریتم همگام‌سازی یا تجمیع قابل اتکایی در تاریخچه وجود ندارد و دو منبع حقیقت هم‌اکنون علت اختلاف ProductService/import/report با Cart/Order است (`history-recovery.md`، «Product.price و Product.stock_quantity»).

### برای محصول ساده مسیر Product-only و برای محصول متغیر مسیر Variant ساخته شود

رد شد، چون payment، cleanup، Seederها و گزارش‌ها دقیقاً در اثر باقی‌ماندن همین دو قرارداد جدا شکسته‌اند. default variant بدون AttributeValue یک مسیر واحد و قابل آزمون فراهم می‌کند.

### AttributeValue واحد فروش یا موجودی باشد

رد شد، چون یک AttributeValue مانند «قرمز» یا «بزرگ» می‌تواند میان چند Product و Variant مشترک باشد و به‌تنهایی SKU، قیمت، تصویر، وضعیت فروش یا موجودی مشخصی را تعیین نمی‌کند. تاریخچه نیز موجودی و SKU را روی ProductVariant قرار داده است (`ada3701`).

### همهٔ ترکیب‌های Attribute به‌صورت خودکار Variant و صفحهٔ indexable شوند

رد شد، چون ترکیب توصیفی معادل هویت تجاری یا محتوای SEO مستقل نیست و تولید انبوه صفحات کم‌محتوا ایجاد می‌کند. موجودیت درجه‌اول‌بودن Variant به معنای indexable بودن اجباری آن نیست.

### Variant فقط در API به‌صورت `values[]` نمایش داده شود

رد شد، چون شناسهٔ پایدار لازم برای Cart/Order/Inventory/Payment و هویت URL/SEO را از بین می‌برد و با cutover تاریخی به `variant_id` ناسازگار است.

## Deferred Decisions

موارد زیر بخشی از این ADR نیستند و باید در ADR مستقل تصمیم‌گیری شوند:

- محل `buy_price` و cost basis هر Variant و اثر آن بر ProfitLog و گزارش سود؛ تاریخچه فقط weighted buy price سطح Product را دارد و Variant cost ندارد.
- دامنه و precedence قیمت کمپین نسبت به `Product.price` و `ProductVariant.price`؛ تاریخچه CampaignProduct را Product-scoped نگه داشته و checkout Variant را به آن متصل نکرده است.
- lifecycle رزرو، مصرف و آزادسازی کوپن، شامل زمان place order/payment/cancel/expire و idempotency شمارنده‌ها.
- state machine سفارش و پرداخت و معنای دقیق reserve، sold، released، paid، failed، cancelled و expired.
- snapshotهای تغییرناپذیر OrderItem فراتر از `variant_id`، quantity و `price_at_purchase`، از جمله SKU، نام Product/Variant، AttributeValueها، تصویر، مالیات و breakdown قیمت.

موارد SEO/API زیر نیز باید در ADR مستقل SEO/API تعیین شوند:

- ساختار نهایی variant slug و URL.
- فیلدهای meta title، meta description و محتوای اختصاصی Variant.
- معیارهای index/noindex.
- انتخاب canonical به Product یا self-canonical.
- structured data و نحوهٔ نمایش Offerهای Variant.

