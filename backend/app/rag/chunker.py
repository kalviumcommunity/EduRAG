from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from app.rag.document_loader import ExtractedPage


@dataclass
class ProcessedChunk:
    chunk_index: int
    content: str
    page_number: Optional[int]
    metadata: Dict[str, Any] = field(default_factory=dict)


class TextChunker:
    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 100):
        self.chunk_size = max(100, chunk_size)
        self.chunk_overlap = max(0, min(chunk_overlap, self.chunk_size // 2))

    def _split_text(self, text: str) -> List[str]:
        words = text.split()
        if not words:
            return []

        chunks = []
        start_idx = 0
        total_words = len(words)

        # Estimate words per chunk (~ 1 word is approx 1.3 tokens or characters, let's treat chunk_size as approx word/token count)
        # Using word count for clean boundary preservation:
        words_per_chunk = max(20, int(self.chunk_size / 4))  # 800 chars ~ 150-200 words
        overlap_words = max(0, int(self.chunk_overlap / 4))

        while start_idx < total_words:
            end_idx = min(start_idx + words_per_chunk, total_words)
            chunk_words = words[start_idx:end_idx]
            chunks.append(" ".join(chunk_words))

            if end_idx >= total_words:
                break

            start_idx = end_idx - overlap_words

        return chunks

    def chunk_extracted_pages(
        self, pages: List[ExtractedPage], document_metadata: Dict[str, Any]
    ) -> List[ProcessedChunk]:
        chunks: List[ProcessedChunk] = []
        global_chunk_index = 0

        for page in pages:
            if not page.content.strip():
                continue

            split_texts = self._split_text(page.content)
            for split_text in split_texts:
                if not split_text.strip():
                    continue

                chunk_meta = {
                    **document_metadata,
                    **page.metadata,
                }
                if page.page_number is not None:
                    chunk_meta["page"] = page.page_number

                chunks.append(
                    ProcessedChunk(
                        chunk_index=global_chunk_index,
                        content=split_text,
                        page_number=page.page_number,
                        metadata=chunk_meta,
                    )
                )
                global_chunk_index += 1

        return chunks
