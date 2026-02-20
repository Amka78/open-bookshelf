import type { Translations } from "./en";

const ar: Translations = {
  common: {
    ok: "نعم",
    save: "حفظ",
    cancel: "حذف",
    back: "خلف",
    login: "تسجيل الدخول",
    logOut: "تسجيل خروج", // @demo remove-current-line
    error: "خطأ",
  },
  welcomeScreen: {
    postscript:
      "ربما لا يكون هذا هو الشكل الذي يبدو عليه تطبيقك مالم يمنحك المصمم هذه الشاشات وشحنها في هذه الحالة",
    readyForLaunch: "تطبيقك تقريبا جاهز للتشغيل",
    exciting: "اوه هذا مثير",
    letsGo: "لنذهب", // @demo remove-current-line
  },
  errorScreen: {
    title: "هناك خطأ ما",
    friendlySubtitle:
      "هذه هي الشاشة التي سيشاهدها المستخدمون في عملية الانتاج عند حدوث خطأ. سترغب في تخصيص هذه الرسالة ( الموجودة في 'ts.en/i18n/app') وربما التخطيط ايضاً ('app/screens/ErrorScreen'). إذا كنت تريد إزالة هذا بالكامل، تحقق من 'app/app.tsp' من اجل عنصر <ErrorBoundary>.",
    reset: "اعادة تعيين التطبيق",
    traceTitle: "خطأ من مجموعة %{name}", // @demo remove-current-line
  },
  bookDetailMenu: {
    openBookTooltip: "فتح الكتاب",
    downloadTooltip: "تنزيل الكتاب",
    convertTooltip: "تحويل الكتاب",
    editTooltip: "تعديل الكتاب",
    deleteTooltip: "حذف الكتاب",
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
  pageDirection: "اتجاه الصفحة",
  bookReadingStyle: {
    title: "نمط القراءة",
    singlePage: "صفحة واحدة",
    facingPage: "صفحتان متقابلتان",
    facingPageWithTitle: "صفحتان متقابلتان مع الغلاف",
    verticalScroll: "تمرير عمودي",
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
  bookImage: {
    loading: "يتم تجهيز الكتاب للقراءة.",
  },
  rating: {
    noRate: "بدون تقييم",
  },
  bookEditScreen: {
    save: "حفظ",
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
};

export default ar;
