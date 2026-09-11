import re


class TextCleaner:
    @staticmethod
    def clean(text: str) -> str:
        if not text:
            return ""

        # Remove NULL bytes
        text = text.replace("\x00", "")

        # Normalize multiple horizontal whitespace characters to a single space
        text = re.sub(r"[ \t]+", " ", text)

        # Normalize multiple newlines (3 or more) to max 2 newlines to preserve paragraphs
        text = re.sub(r"\n{3,}", "\n\n", text)

        # Strip leading/trailing whitespace on each line
        lines = [line.strip() for line in text.split("\n")]
        text = "\n".join(lines)

        return text.strip()
