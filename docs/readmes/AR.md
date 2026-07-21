# ELEMENT DELETER

<p align="center">
=-=-=-=-=-=-=-=-= | <a href="./DE.md">DE</a> | <a href="../README.md">EN</a> | <a href="./ES.md">ES</a> | <a href="./FR.md">FR</a> | <a href="./RU.md">RU</a> | <a href="./ZH.md">中文</a> | عربي | =-=-=-=-=-=-=-=-=
</p>

## الوصف

تزيل Element Deleter بسرعة كل ما يعيق الصفحة، مثل اللافتات والنوافذ المنبثقة والرؤوس الثابتة والأدوات والكتل الإضافية وإطارات iframe والعناصر الأخرى المشتتة.

تفيد الإضافة مطوري الواجهات الأمامية ومختبري الجودة والمصممين: يمكن فحص الصفحة من دون كتل مزعجة، أو إعداد لقطة شاشة نظيفة، أو مراجعة فكرة تخطيط، أو إزالة عنصر يغطي المحتوى. وفي التصفح اليومي تجعل الصفحات أسهل في القراءة والعرض والحفظ.

مرر المؤشر وانقر، فيختفي العنصر. وإذا كان ذلك بالخطأ، يمكنك استعادته.

<p align="center">
  <a href="../publication/screenshots/AR-0.png"><img src="../publication/screenshots/AR-0.png" width="180" alt="Element Deleter screenshot 1"></a>
  <a href="../publication/screenshots/AR-1.png"><img src="../publication/screenshots/AR-1.png" width="180" alt="Element Deleter screenshot 2"></a>
  <a href="../publication/screenshots/AR-2.png"><img src="../publication/screenshots/AR-2.png" width="180" alt="Element Deleter screenshot 3"></a>
  <a href="../publication/screenshots/AR-3.png"><img src="../publication/screenshots/AR-3.png" width="180" alt="Element Deleter screenshot 4"></a>
</p>

## التثبيت

### المتاجر

- [Chrome Web Store](https://chromewebstore.google.com/detail/element-deleter/dpgjhjgfbicnenmdknepflmdahmhlbag)
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/md2it-element-deleter/)

### التثبيت اليدوي

- **GitHub Release.** حمّل أحدث حزمة للإضافة:
  [element-deleter.zip](https://github.com/md2it/element-deleter/releases/latest/download/element-deleter.zip)

- **وضع التطوير.** حمّل مجلد [`extension`](../extension) بالكامل كإضافة غير مضغوطة.

## الميزات الرئيسية

- إزالة عناصر الصفحة ببضع نقرات
- استعادة العناصر المحذوفة
- التراجع عن عدة عمليات حذف أثناء تفعيل وضع الحذف
- حذف العناصر من قائمة السياق
- العمل مع إطارات iframe والمحتوى المضمّن
- إشعار واضح بعد الحذف
- خفيفة وبسيطة
- إعدادات محلية فقط

## الاستخدام

U = المستخدم
E = الإضافة

1. ينفذ U أحد الإجراءات التالية:
   - ينقر بزر الفأرة الأيسر على أيقونة الإضافة
   - يضغط `Ctrl+Shift+X`→`D` (على Mac، يضغط `Cmd+Shift+X`→`D`)
2. تبدأ E
3. يمرر U المؤشر فوق عنصر في الصفحة
4. تميّز E عنصر DOM المقابل
5. ينقر U على العنصر
6. تنفذ E جميع الإجراءات التالية:
   - تزيل العنصر وجميع العناصر التابعة له
   - تعرض إشعارًا بالحذف
   - تميّز عنصرًا آخر إذا كان موجودًا تحت المؤشر
7. ينفذ U أحد الإجراءات التالية:
   - ينقر مجددًا بزر الفأرة الأيسر على أيقونة الإضافة
   - يضغط `Ctrl+Shift+X`→`D` (على Mac، يضغط `Cmd+Shift+X`→`D`)
   - يضغط `Esc`
8. تتوقف E

راجع [جميع مسارات المستخدم](../spec/user-path.md) لمعرفة الحذف المتكرر واستعادة العناصر والحذف من قائمة السياق والإرشاد الأولي والوظائف الأخرى.

## القيود

- **يختلف تحديد iframe** عن تحديد العناصر الأخرى:
   - يتم تحديد iframe بالكامل
   - يرجع ذلك إلى قيد في المنصة، ولا يُنصح بالحقن داخل iframe
   - يبدو التحديد مختلفًا بسبب اختلاف معالجات الأحداث، لكنه لا يؤثر في الوظائف
- **يكون موضع SVG المستعاد** غير صحيح أحيانًا:
   - هذا خلل وظيفي
   - استغرقت محاولات إصلاحه وقتًا طويلًا
   - تأثيره منخفض لأن هذا السيناريو نادر

## الخصوصية

- لا يتم جمع البيانات
- لا يوجد تتبع
- لا توجد طلبات شبكة
- تقتصر التغييرات على الصفحة الحالية
- تؤدي إعادة تحميل الصفحة إلى استعادة المحتوى الأصلي

## لغات الواجهة

- الإنجليزية
- الفرنسية
- الألمانية
- الإسبانية
- الروسية
- العربية
- الصينية المبسطة

## الترخيص

[ترخيص MIT](../LICENSE)
