"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";

export default function SnippetIndexPage() {
  const router = useRouter();
  const { date } = router.query;

  useEffect(() => {
    if (date) {
      const dateStr = Array.isArray(date) ? date[0] : date;
      void router.replace(`/snippet/${dateStr}/view`);
    }
  }, [date, router]);

  return null;
}
