import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";
import type { Tables } from "~/lib/database.types";

type User = Tables<"users">;
type UserMap = Record<string, User>;

// 이미지를 프리로드하는 함수
const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve();
      return;
    }
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

export function useUsers() {
  const [users, setUsers] = useState<UserMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        // users 테이블에서 데이터 조회
        const { data, error } = await supabase
          .from("users")
          .select("id, email, full_name, avatar_url, created_at, updated_at")
          .order("full_name");

        if (error) {
          throw error;
        }

        // 이미지 프리로딩
        await Promise.all(
          data.map((user) => user.avatar_url && preloadImage(user.avatar_url)),
        );

        // user_email을 키로 하는 맵 생성
        const userMap = data.reduce<UserMap>((acc, user) => {
          acc[user.email] = user;
          return acc;
        }, {});

        setUsers(userMap);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred"),
        );
      } finally {
        setLoading(false);
      }
    }

    void fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
  };
}
