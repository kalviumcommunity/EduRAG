import logging
import re
import sys


class SensitiveDataFilter(logging.Filter):
    """
    Redacts sensitive keywords from log messages.
    """
    SENSITIVE_PATTERNS = [
        (r'("?password"?\s*:\s*)"[^"]+"', r'\1"***REDACTED***"'),
        (r'("?token"?\s*:\s*)"[^"]+"', r'\1"***REDACTED***"'),
        (r'("?api_key"?\s*:\s*)"[^"]+"', r'\1"***REDACTED***"'),
        (r'(Bearer\s+)[A-Za-z0-9\-\._~\+\/]+=*', r'\1***REDACTED***'),
    ]

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            for pattern, repl in self.SENSITIVE_PATTERNS:
                record.msg = re.sub(pattern, repl, record.msg, flags=re.IGNORECASE)
        return True


def setup_logging() -> logging.Logger:
    logger = logging.getLogger("edurag")
    logger.setLevel(logging.INFO)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        handler.addFilter(SensitiveDataFilter())
        logger.addHandler(handler)

    return logger


logger = setup_logging()
