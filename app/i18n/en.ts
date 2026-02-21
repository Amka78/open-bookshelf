const en = {
  common: {
    ok: "OK",
    yes: "Yes",
    no: "No",
    save: "Save",
    cancel: "Cancel",
    back: "Back",
    login: "Login",
    logOut: "Log Out",
    error: "Error",
  },
  bookEditScreen: {
    save: "Save",
  },
  errorScreen: {
    title: "Something went wrong!",
    friendlySubtitle:
      "This is the screen that your users will see in production when an error is thrown. You'll want to customize this message (located in `app/i18n/en.ts`) and probably the layout as well (`app/screens/ErrorScreen`). If you want to remove this entirely, check `app/app.tsx` for the <ErrorBoundary> component.",
    reset: "RESET APP",
    traceTitle: "Error from %{name} stack",
  },
  errors: {
    canNotConnect: "Unable to connect to Calibre.",
    canNotConnectDescription:
      "Can't connect to Calibre, please check URL is correct and Calibre server is working.",
    failedConvert: "Book conversion error",
    failedRating: "Failed to update rating.",
    timeout: "Connection with Calibre timed out.",
    timeoutDescription:
      "The connection with Calibre is taking too long. Please wait a few moments before connecting or restart the server.",
  },
  connectScreen: {
    welcome: "Welcome!!",
    detail: "Thank you for using OpenBookshelf. Please set up your Calibre URL first.",
    connectDetail: "Set the Calibre URL.",
    connect: "Connect",
    placeHolder: "(http or https)://{Address}:{Port}",
    checkbox: "use opds?",
  },
  libraryScreen: {
    dataSearching: "Searching",
  },
  sortMenu: {
    sort: "Sort",
    asc: "ASC",
    desc: "DESC",
  },
  bookReadingStyle: {
    title: "Book Reading Style",
    singlePage: "Single Page",
    singlePageDescription: "Display one page at a time",
    facingPage: "Facing Page",
    facingPageDescription: "Display two facing pages side by side",
    facingPageWithTitle: "Facing Page With Title",
    facingPageWithTitleDescription: "Facing pages mode with a single cover page displayed alone",
    verticalScroll: "VerticalScroll",
    verticalScrollDescription: "Scroll through pages vertically in a continuous flow",
  },
  pageDirection: {
    label: "Page Direction",
    leftToRight: "Left to right page turning",
    rightToLeft: "Right to left page turning",
  },
  autoPageTurning: {
    tooltip: "Toggle automatic page turning",
    tooltipActive: "Automatic page turning is ON",
    tooltipInactive: "Automatic page turning is OFF",
  },
  bookImage: {
    loading: "Preparing to read the book.",
  },
  modal: {
    viewerHeaderAutoPageTurn: {
      title: "Auto page turning",
      intervalLabel: "Interval (ms)",
      minIntervalHelp: "Please set 100ms or more.",
    },
    formatSelectModal: {
      title: "Select format.",
    },
    loginModal: {
      title: "Input login information.",
      userIdPlaceholder: "UserID",
      passwordPlaceholder: "Password",
    },
    bookDetailModal: {
      title: "Book detail",
    },
    deleteConfirmModal: {
      title: "Confirmation of deletion",
      message: "Are you sure you want to delete {0}?",
    },
    bookEditModal: {
      title: "Book Edit",
    },
    cacheClearConfirmModal: {
      title: "Clear cache",
      message: "Do you want to clear cache?",
    },
    resumeReadingConfirmModal: {
      title: "Resume reading",
      message: "You have unfinished progress. Continue from where you left off?",
    },
    viewerRatingModal: {
      title: "Rate this book",
      message: "Please rate this book.",
    },
  },
  rating: {
    noRate: "No Rate",
  },
  bookDetailMenu: {
    openBookTooltip: "Open book",
    downloadTooltip: "Download book",
    convertTooltip: "Convert book",
    editTooltip: "Edit book",
    deleteTooltip: "Delete book",
  },
}

export default en
export type Translations = typeof en
