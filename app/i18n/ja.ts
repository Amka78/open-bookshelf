import type { Translations } from "./en"

const ja: Translations = {
  common: {
    ok: "OK",
    yes: "はい",
    no: "いいえ",
    save: "保存",
    cancel: "キャンセル",
    back: "戻る",
    login: "ログイン",
    logOut: "ログアウト",
    error: "エラー",
  },
  bookEditScreen: {
    save: "保存",
    authorSortAutoTooltip: "著者から author_sort を自動生成",
  },
  errorScreen: {
    title: "問題が発生しました",
    friendlySubtitle:
      "この画面は本番環境でエラーが発生したときに表示されます。メッセージ（`app/i18n/ja.ts`）やレイアウト（`app/screens/ErrorScreen`）を必要に応じて調整してください。不要な場合は `app/app.tsx` の <ErrorBoundary> を確認してください。",
    reset: "アプリをリセット",
    traceTitle: "%{name} スタックのエラー",
  },
  errors: {
    canNotConnect: "Calibre に接続できません。",
    canNotConnectDescription:
      "Calibre に接続できません。URL が正しいか、Calibre サーバーが稼働しているか確認してください。",
    failedConvert: "書籍変換エラー",
    failedRating: "評価の更新に失敗しました。",
    timeout: "Calibre との接続がタイムアウトしました。",
    timeoutDescription:
      "Calibre との接続に時間がかかっています。少し待ってから再接続するか、サーバーを再起動してください。",
  },
  connectScreen: {
    welcome: "ようこそ!!",
    detail:
      "OpenBookshelf をご利用いただきありがとうございます。まず Calibre の URL を設定してください。",
    connectDetail: "Calibre の URL を設定してください。",
    connect: "接続",
    placeHolder: "(http または https)://{Address}:{Port}",
    checkbox: "opds を使用する?",
  },
  libraryScreen: {
    dataSearching: "検索中",
  },
  sortMenu: {
    sort: "並び替え",
    asc: "昇順",
    desc: "降順",
  },
  bookReadingStyle: {
    title: "読書スタイル",
    singlePage: "単ページ",
    singlePageDescription: "1ページずつ表示",
    facingPage: "見開き",
    facingPageDescription: "左右2ページを並べて表示",
    facingPageWithTitle: "表紙付き見開き",
    facingPageWithTitleDescription: "表紙は単独、その後は見開きで表示",
    verticalScroll: "縦スクロール",
    verticalScrollDescription: "ページを縦方向に連続スクロール",
  },
  pageDirection: {
    label: "ページ方向",
    leftToRight: "左から右にページをめくる",
    rightToLeft: "右から左にページをめくる",
  },
  autoPageTurning: {
    tooltip: "自動ページめくりを切り替え",
    tooltipActive: "自動ページめくり ON",
    tooltipInactive: "自動ページめくり OFF",
  },
  bookImage: {
    loading: "書籍を開く準備中です。",
  },
  modal: {
    viewerHeaderAutoPageTurn: {
      title: "自動ページめくり",
      intervalLabel: "間隔 (ms)",
      minIntervalHelp: "100ms 以上を指定してください。",
    },
    formatSelectModal: {
      title: "形式を選択してください。",
    },
    loginModal: {
      title: "ログイン情報を入力してください。",
      userIdPlaceholder: "ユーザーID",
      passwordPlaceholder: "パスワード",
    },
    bookDetailModal: {
      title: "書籍詳細",
    },
    deleteConfirmModal: {
      title: "削除確認",
      message: "{0} を削除しますか？",
    },
    bookEditModal: {
      title: "書籍編集",
    },
    cacheClearConfirmModal: {
      title: "キャッシュ削除",
      message: "キャッシュを削除しますか？",
    },
    resumeReadingConfirmModal: {
      title: "続きから読む",
      message: "読みかけの本です。続きから読みますか？",
    },
    viewerRatingModal: {
      title: "この本の評価",
      message: "この本を評価してください。",
    },
  },
  rating: {
    noRate: "評価なし",
  },
  bookDetailMenu: {
    openBookTooltip: "書籍を開く",
    downloadTooltip: "書籍をダウンロード",
    convertTooltip: "書籍を変換",
    editTooltip: "書籍を編集",
    deleteTooltip: "書籍を削除",
  },
}

export default ja
