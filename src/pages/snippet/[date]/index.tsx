import { useRouter } from "next/router";
import { useEffect } from "react";

export default function SnippetIndexPage() {
  const router = useRouter();
  const { date } = router.query;

  useEffect(() => {
    if (date) {
      void router.replace(`/snippet/${date}/view`);
    }
  }, [date, router]);

  return null;
}
