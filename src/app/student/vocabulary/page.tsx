"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const VocabPageContent = dynamic(() => import("./VocabPageContent"), {
  ssr: false,
});

export default function VocabularyPage() {
  return (
    <Suspense fallback={<p>Loading vocabulary…</p>}>
      <VocabPageContent />
    </Suspense>
  );
}
