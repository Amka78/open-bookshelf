import type { Translations } from "./en";

const ar: Translations = {
  common: {
    ok: "نعم",
    save: "حفظ",
    cancel: "حذف",
    back: "خلف",
    login: "تسجيل الدخول",
    logOut: "تسجيل خروج",
    error: "خطأ",
  },
  bookEditScreen: {
    save: "حفظ",
  },
  errorScreen: {
    title: "هناك خطأ ما",
    friendlySubtitle:
      "هذه هي الشاشة التي سيشاهدها المستخدمون في عملية الانتاج عند حدوث خطأ. سترغب في تخصيص هذه الرسالة ( الموجودة في 'ts.en/i18n/app') وربما التخطيط ايضاً ('app/screens/ErrorScreen'). إذا كنت تريد إزالة هذا بالكامل، تحقق من 'app/app.tsp' من اجل عنصر <ErrorBoundary>.",
    reset: "اعادة تعيين التطبيق",
    traceTitle: "خطأ من مجموعة %{name}",
  },
  errors: {
    canNotConnect: "تعذر الاتصال بـ Calibre.",
    canNotConnectDescription:
      "لا يمكن الاتصال بـ Calibre. يرجى التحقق من صحة الرابط وأن الخادم يعمل.",
    failedConvert: "خطأ في تحويل الكتاب",
    timeout: "انتهت مهلة الاتصال مع Calibre.",
    timeoutDescription:
      "استغرق الاتصال بـ Calibre وقتًا طويلًا. يرجى الانتظار قليلًا قبل إعادة المحاولة أو إعادة تشغيل الخادم.",
  },
  connectScreen: {
    welcome: "مرحبًا!!",
    detail: "شكرًا لاستخدام OpenBookshelf. يرجى إعداد رابط Calibre أولًا.",
    connectDetail: "اضبط رابط Calibre.",
    connect: "اتصال",
    placeHolder: "(http أو https)://{Address}:{Port}",
    checkbox: "استخدام opds؟",
  },
  libraryScreen: {
    dataSearching: "جارٍ البحث",
  },
  sortMenu: {
    sort: "ترتيب",
    asc: "تصاعدي",
    desc: "تنازلي",
  },
  bookReadingStyle: {
    title: "نمط القراءة",
    singlePage: "صفحة واحدة",
    singlePageDescription: "عرض صفحة واحدة في المرة",
    facingPage: "صفحتان متقابلتان",
    facingPageDescription: "عرض صفحتين متقابلتين جنباً إلى جنب",
    facingPageWithTitle: "صفحتان متقابلتان مع الغلاف",
    facingPageWithTitleDescription: "وضع الصقحات المتقابلة مع عرض الغلاف بمفرده",
    verticalScroll: "تمرير عمودي",
    verticalScrollDescription: "تمرير الصفحات عمودياً في تدفق مستمر",
  },
  pageDirection: {
    label: "اتجاه الصفحة",
    leftToRight: "تقليب الصفحة من اليسار إلى اليمين",
    rightToLeft: "تقليب الصفحة من اليمين إلى اليسار",
  },
  autoPageTurning: {
    tooltip: "تبديل تقليب الصفحة التلقائي",
    tooltipActive: "تقليب الصفحة التلقائي قيد التشغيل",
    tooltipInactive: "تقليب الصفحة التلقائي متوقف",
  },
  bookImage: {
    loading: "يتم تجهيز الكتاب للقراءة.",
  },
  modal: {
    viewerHeaderAutoPageTurn: {
      title: "تقليب الصفحات تلقائيًا",
      intervalLabel: "الفاصل الزمني (مللي ثانية)",
      minIntervalHelp: "يرجى تعيين 100 مللي ثانية أو أكثر.",
    },
    formatSelectModal: {
      title: "اختر التنسيق.",
    },
    loginModal: {
      title: "أدخل معلومات تسجيل الدخول.",
      userIdPlaceholder: "معرّف المستخدم",
      passwordPlaceholder: "كلمة المرور",
    },
    bookDetailModal: {
      title: "تفاصيل الكتاب",
    },
    deleteConfirmModal: {
      title: "تأكيد الحذف",
      message: "هل أنت متأكد أنك تريد حذف {0}؟",
    },
    bookEditModal: {
      title: "تعديل الكتاب",
    },
  },
  rating: {
    noRate: "بدون تقييم",
  },
  bookDetailMenu: {
    openBookTooltip: "فتح الكتاب",
    downloadTooltip: "تنزيل الكتاب",
    convertTooltip: "تحويل الكتاب",
    editTooltip: "تعديل الكتاب",
    deleteTooltip: "حذف الكتاب",
  },
};

export default ar;
