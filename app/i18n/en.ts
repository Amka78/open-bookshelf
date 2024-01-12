const en = {
  common: {
    ok: "OK",
    cancel: "Cancel",
    back: "Back",
    login: "Login",
    logOut: "Log Out",
    error: "Error",
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
    timeout: "Connection with Calibre timed out.",
    timeoutDescription: "The connection with Calibre is taking too long. Please wait a few moments before connecting or restart the server."
  },
  connectScreen: {
    welcome: "Welcome!!",
    detail: "Thank you for using OpenBookshelf. Please set up your Calibre URL first.",
    connectDetail: "Set the Calibre URL.",
    connect: "Connect",
    placeHolder: "(http or https)://{Address}:{Port}",
    checkbox: "use opds?",
  },
  sortMenu: {
    sort: "Sort",
    asc: "ASC",
    desc: "DESC",
  },
  bookReadingStyle: {
    title: "Book Reading Style",
    singlePage: "Single Page",
    facingPage: "Facing Page",
    facingPageWithTitle: "Facing Page With Title",
    verticalScroll: "VerticalScroll",
  },
  pageDirection: "Page Direction",
  bookImage: {
    loading: "Preparing to read the book.",
  },
  modal: {
    formatSelectModal: {
      title: "Select format.",
    },
    loginModal: {
      title: "Input login information.",
      userIdPlaceholder: "UserID",
      passwordPlaceholder: "Password",
    },
  },
}

export default en
export type Translations = typeof en
