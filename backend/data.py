"""
Data utilities for ChronoCanvas backend.

The frontend is the source of truth for available regions, art forms, and time periods.
The backend accepts any values and uses the cache to store/retrieve data.
"""

import re


# Maximum lengths for input validation (prevents abuse)
MAX_DECADE_LENGTH = 10
MAX_REGION_LENGTH = 100
MAX_ART_FORM_LENGTH = 100


def sanitize_input(value: str, max_length: int = 100) -> str:
    """
    Basic input sanitization to prevent abuse.
    
    - Strips whitespace
    - Limits length
    - Removes control characters
    
    Note: SQL injection is already prevented by SQLAlchemy's parameterized queries.
    This is just defense in depth.
    """
    if not value:
        return ""
    
    # Strip whitespace
    value = value.strip()
    
    # Limit length
    value = value[:max_length]
    
    # Remove control characters (but keep unicode letters, numbers, spaces, punctuation)
    # This allows international characters while blocking injection attempts
    value = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', value)
    
    return value


def validate_inputs(decade: str, region: str, art_form: str) -> tuple[str, str, str]:
    """
    Validate and sanitize inputs.
    
    Returns sanitized values.
    Raises ValueError if inputs are empty after sanitization.
    """
    decade = sanitize_input(decade, MAX_DECADE_LENGTH)
    region = sanitize_input(region, MAX_REGION_LENGTH)
    art_form = sanitize_input(art_form, MAX_ART_FORM_LENGTH)
    
    if not decade:
        raise ValueError("Decade is required")
    if not region:
        raise ValueError("Region is required")
    if not art_form:
        raise ValueError("Art form is required")
    
    return decade, region, art_form
