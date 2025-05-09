export const strings = {
  app: {
    title: "GCS Daily Snippet",
    description: "GCS Daily Snippet",
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
} as const;
