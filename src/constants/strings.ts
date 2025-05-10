export const strings = {
  app: {
    title: "GCS Daily Snippet",
    description: "GCS Daily Snippet",
    loading: "로딩 중...",
    noTeams: "소속된 팀이 없습니다. 관리자에게 문의해주세요.",
  },
  auth: {
    signIn: {
      google: "구글 계정으로 로그인",
      loading: "로딩 중...",
      error: {
        default: "로그인 중 오류가 발생했습니다",
        unauthorized:
          "인증되지 않은 이메일 주소입니다. GCS 학생들만 사용할 수 있습니다.",
      },
    },
    signOut: "로그아웃",
    welcome: {
      message: (email: string) => `환영합니다, ${email}님`,
      authorized: "인증된 사용자입니다",
    },
  },
  calendar: {
    today: "오늘",
    month: {
      previous: "이전 달",
      next: "다음 달",
    },
    week: {
      previous: "이전 주",
      next: "다음 주",
    },
    action: {
      today: "오늘",
      back: "캘린더로 돌아가기",
    },
    dayNames: ["일", "월", "화", "수", "목", "금", "토"] as const,
  },
  team: {
    select: "팀 선택",
  },
  snippet: {
    empty: "작성된 스니펫이 없습니다",
    placeholder: "오늘의 스니펫을 작성해주세요",
    invalidDate: "잘못된 날짜입니다",
    title: (date: string) => `${date} - GCS Daily Snippet`,
    action: {
      create: "스니펫 작성",
      edit: "스니펫 수정",
      save: "저장",
      cancel: "취소",
    },
    status: {
      loading: "스니펫을 불러오는 중...",
      saving: "저장 중...",
      saved: "저장되었습니다",
      error: {
        default: "오류가 발생했습니다",
        withMessage: (message: string) => `오류가 발생했습니다: ${message}`,
        dateValidation:
          "스니펫은 오늘이거나 어제 오전 9시 이전에만 생성/수정할 수 있습니다",
      },
    },
    validation: {
      past: "이전 스니펫은 수정할 수 없습니다",
      future: "미래의 스니펫은 작성할 수 없습니다",
    },
  },
} as const;
