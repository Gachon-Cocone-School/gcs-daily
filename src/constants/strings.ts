export const strings = {
  leaderboard: {
    title: "팀 리더보드",
    daily: "일간 순위",
    weekly: "주간 순위",
    rank: "{}등",
    noData: "데이터가 없습니다.",
  },
  app: {
    title: "Daily Snippet",
    description: "GCS Daily Snippet",
    loading: "로딩 중...",
    noTeams: "소속된 팀이 없습니다. 관리자에게 문의해주세요.",
    status: {
      initializing: "로딩 중...",
      checking: "인증 체크하는 중...",
      loadingTeam: "팀 정보 로딩 중...",
    },
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
    signOut: "나가기",
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
    placeholderDefault:
      "오늘의 스니펫을 작성해주세요. \n\n 마크다운 문법을 사용할 수 있습니다\n\n# 제목 (# ~ ######)\n* 또는 - 불릿 목록\n1. 2. 3. 숫자 목록\n[링크 텍스트](URL)\n![이미지 설명](이미지 URL)\n`코드 블록`\n**굵게** 또는 *기울임*\n",
    placeholder: "탭키를 누르면 제안된 스니펫이 적용됩니다\n\n",
    invalidDate: "잘못된 날짜입니다",
    title: (date: string) => `${date} - GCS Daily Snippet`,
    editTitle: (date: string) => `${date} - 스니펫 수정`,
    action: {
      create: "작성",
      edit: "수정",
      save: "저장",
      cancel: "취소",
      write: "작성",
      delete: "삭제",
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
      deleteConfirm: "작성한 스니펫을 정말 삭제하시겠습니까?",
    },
    achievements: {
      labels: {
        growth: "성장성",
        specificity: "구체성",
        execution: "실행력",
        authenticity: "진정성",
        clarity: "명확성",
      },
      feedback: "상세 피드백",
      score: "{} 점",
    },
  },
} as const;
