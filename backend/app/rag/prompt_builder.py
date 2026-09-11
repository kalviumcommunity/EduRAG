from typing import List, Dict, Any
from app.rag.retriever import RetrievedChunk

SYSTEM_PROMPT = """You are an educational assistant.

Answer the student's question using only the provided course material.

Do not invent facts that are not supported by the provided context.

If the provided course material does not contain enough information to answer the question reliably, clearly state that sufficient information was not found in the course material.

Give concise, student-friendly explanations.

When useful, explain concepts with examples from the provided material.

Do not claim that information comes from a source unless that source was actually retrieved."""


class PromptBuilder:
    @staticmethod
    def build_system_prompt() -> str:
        return SYSTEM_PROMPT

    @staticmethod
    def format_context(chunks: List[RetrievedChunk]) -> str:
        if not chunks:
            return "No relevant course material found."

        context_blocks = []
        for idx, chunk in enumerate(chunks, 1):
            page_info = f", Page {chunk.page_number}" if chunk.page_number else ""
            header = f"[Source {idx}: Document '{chunk.document_title}' ({chunk.document_type}){page_info}]"
            context_blocks.append(f"{header}\n{chunk.content}")

        return "\n\n".join(context_blocks)

    @classmethod
    def build_user_prompt(
        cls, question: str, chunks: List[RetrievedChunk], conversation_history: List[Dict[str, str]] = None
    ) -> str:
        context_str = cls.format_context(chunks)

        history_str = ""
        if conversation_history:
            formatted_history = []
            for msg in conversation_history[-4:]:  # Include last 4 messages for context
                role = "Student" if msg.get("role") == "user" else "Assistant"
                formatted_history.append(f"{role}: {msg.get('content')}")
            history_str = "\n--- RECENT CONVERSATION HISTORY ---\n" + "\n".join(formatted_history) + "\n"

        return f"""--- PROVIDED COURSE MATERIAL ---
{context_str}
{history_str}
--- STUDENT QUESTION ---
{question}

Answer the student question based ONLY on the provided course material above:"""
