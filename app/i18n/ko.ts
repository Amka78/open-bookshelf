import type { Translations } from "./en"

const ko: Translations = {
  common: {
    ok: "확인!",
    yes: "예",
    no: "아니요",
    save: "저장",
    cancel: "취소",
    back: "뒤로",
    login: "로그인",
    logOut: "로그아웃",
    error: "오류",
  },
  bookEditScreen: {
    save: "저장",
  },
  errorScreen: {
    title: "뭔가 잘못되었습니다!",
    friendlySubtitle:
      "이 화면은 오류가 발생할 때 프로덕션에서 사용자에게 표시됩니다. 이 메시지를 커스터마이징 할 수 있고(해당 파일은 `app/i18n/ko.ts` 에 있습니다) 레이아웃도 마찬가지로 수정할 수 있습니다(`app/screens/error`). 만약 이 오류화면을 완전히 없에버리고 싶다면 `app/app.tsx` 파일에서 <ErrorBoundary> 컴포넌트를 확인하기 바랍니다.",
    reset: "초기화",
    traceTitle: "%{name} 스택에서의 오류",
  },
  errors: {
    canNotConnect: "Calibre에 연결할 수 없습니다.",
    canNotConnectDescription:
      "Calibre에 연결할 수 없습니다. URL이 올바른지, 서버가 동작 중인지 확인하세요.",
    failedConvert: "책 변환 오류",
    timeout: "Calibre와의 연결 시간이 초과되었습니다.",
    timeoutDescription:
      "Calibre 연결이 너무 오래 걸리고 있습니다. 잠시 후 다시 시도하거나 서버를 재시작해 주세요.",
  },
  connectScreen: {
    welcome: "환영합니다!!",
    detail: "OpenBookshelf를 이용해 주셔서 감사합니다. 먼저 Calibre URL을 설정해 주세요.",
    connectDetail: "Calibre URL을 설정하세요.",
    connect: "연결",
    placeHolder: "(http 또는 https)://{Address}:{Port}",
    checkbox: "opds 사용?",
  },
  libraryScreen: {
    dataSearching: "검색 중",
  },
  sortMenu: {
    sort: "정렬",
    asc: "오름차순",
    desc: "내림차순",
  },
  bookReadingStyle: {
    title: "읽기 스타일",
    singlePage: "단일 페이지",
    singlePageDescription: "한 번에 한 페이지씩 표시",
    facingPage: "양면 페이지",
    facingPageDescription: "마주보는 두 페이지를 나란히 표시",
    facingPageWithTitle: "표지 포함 양면 페이지",
    facingPageWithTitleDescription: "기본적으로 양면 표시, 표지만 단독 표시",
    verticalScroll: "세로 스크롤",
    verticalScrollDescription: "연속적인 흐름으로 페이지를 세로로 스크롤",
  },
  pageDirection: {
    label: "페이지 방향",
    leftToRight: "왼쪽에서 오른쪽으로 페이지 넘김",
    rightToLeft: "오른쪽에서 왼쪽으로 페이지 넘김",
  },
  autoPageTurning: {
    tooltip: "자동 페이지 넘김 설정",
    tooltipActive: "자동 페이지 넘김 켜짐",
    tooltipInactive: "자동 페이지 넘김 꺼짐",
  },
  bookImage: {
    loading: "책을 읽을 준비 중입니다.",
  },
  modal: {
    viewerHeaderAutoPageTurn: {
      title: "자동 페이지 넘김",
      intervalLabel: "간격 (ms)",
      minIntervalHelp: "100ms 이상으로 설정해 주세요.",
    },
    formatSelectModal: {
      title: "형식을 선택하세요.",
    },
    loginModal: {
      title: "로그인 정보를 입력하세요.",
      userIdPlaceholder: "사용자 ID",
      passwordPlaceholder: "비밀번호",
    },
    bookDetailModal: {
      title: "책 상세",
    },
    deleteConfirmModal: {
      title: "삭제 확인",
      message: "{0}을(를) 삭제하시겠습니까?",
    },
    bookEditModal: {
      title: "책 편집",
    },
    cacheClearConfirmModal: {
      title: "캐시 삭제",
      message: "캐시를 삭제하시겠습니까?",
    },
    resumeReadingConfirmModal: {
      title: "이어 읽기",
      message: "읽던 페이지가 있습니다. 이어서 읽으시겠습니까?",
    },
  },
  rating: {
    noRate: "평점 없음",
  },
  bookDetailMenu: {
    openBookTooltip: "책 열기",
    downloadTooltip: "책 다운로드",
    convertTooltip: "책 변환",
    editTooltip: "책 편집",
    deleteTooltip: "책 삭제",
  },
}

export default ko
