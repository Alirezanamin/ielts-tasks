import { Suspense } from "react";
import VocabPageContent from "./VocabPageContent";

export default function VocabularyPage() {
  return (
    <Suspense fallback={<p>Loading vocabulary...</p>}>
      <VocabPageContent />
    </Suspense>
  );
}
