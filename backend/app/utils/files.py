import os
import uuid


def generate_unique_filename(original_filename: str) -> str:
    ext = os.path.splitext(original_filename)[1].lower()
    return f"{uuid.uuid4().hex}{ext}"


def is_safe_filename(filename: str) -> bool:
    # Basic path traversal check
    return not (".." in filename or "/" in filename or "\\" in filename)
