"""Consensus layer - synthesizes responses from multiple providers."""

import logging
from typing import Optional, List, Tuple
from collections import Counter

from openai import AsyncOpenAI
from anthropic import AsyncAnthropic

from config import get_settings
from llm_providers import FactCheckResponse
from models import ArtEntry

logger = logging.getLogger(__name__)


def _find_majority(responses: List[FactCheckResponse]) -> Tuple[Optional[str], List[str]]:
    """
    Find majority art name from responses.
    
    Returns (majority_name, all_names).
    Majority requires > 50% of successful responses.
    """
    successful = [r for r in responses if r.success and r.art_name]
    if not successful:
        return None, []
    
    def normalize(name: str) -> str:
        return name.lower().strip().strip('"\'')
    
    names = [r.art_name for r in successful]
    normalized = [normalize(n) for n in names]
    
    counts = Counter(normalized)
    most_common = counts.most_common(1)
    
    if most_common:
        top_name, top_count = most_common[0]
        if top_count > len(successful) / 2:
            for name, norm in zip(names, normalized):
                if norm == top_name:
                    return name, names
    
    return None, names


def _build_consensus_prompt(
    decade: str,
    region: str,
    art_form: str,
    query_type: str,
    responses: List[FactCheckResponse],
    majority_name: Optional[str],
) -> str:
    """Build prompt for synthesis."""
    decade_label = f"{decade}s"
    
    provider_info = []
    for r in responses:
        if r.success:
            provider_info.append(f"- {r.provider.upper()}: \"{r.art_name}\" - {r.brief_reason}")
        else:
            provider_info.append(f"- {r.provider.upper()}: (failed)")
    
    provider_text = "\n".join(provider_info)
    type_label = "most popular" if query_type == "popular" else "most timeless/enduring"
    
    if majority_name:
        return f"""Sources on the {type_label} {art_form.lower()} from {region} in the {decade_label}:
{provider_text}

Majority: "{majority_name}"

Write 2-3 sentences about this work. Casual, friendly, surprising/juicy details. No formal tone."""
    else:
        return f"""Sources on the {type_label} {art_form.lower()} from {region} in the {decade_label}:
{provider_text}

No majority. Pick the best choice and write 2-3 sentences. Casual, friendly, surprising/juicy.

Format:
CHOICE: "Name" by Artist
DESCRIPTION: Your description"""


async def _synthesize_with_openai(
    combined_prompt: str,
    popular_majority: Optional[str],
    popular_names: List[str],
    timeless_majority: Optional[str],
    timeless_names: List[str],
) -> Tuple[ArtEntry, ArtEntry]:
    """Fallback to OpenAI for synthesis."""
    settings = get_settings()
    client = AsyncOpenAI(api_key=settings.openai_api_key)
    
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": combined_prompt}],
        max_tokens=500,
        temperature=0.7,
    )
    
    text = response.choices[0].message.content or ""
    logger.info(f"OpenAI response:\n{text[:500]}")
    
    popular_entry = _parse_response(text, "POPULAR", popular_majority, popular_names)
    timeless_entry = _parse_response(text, "TIMELESS", timeless_majority, timeless_names)
    
    return popular_entry, timeless_entry


async def _synthesize_with_claude(
    combined_prompt: str,
    popular_majority: Optional[str],
    popular_names: List[str],
    timeless_majority: Optional[str],
    timeless_names: List[str],
) -> Tuple[ArtEntry, ArtEntry]:
    """Use Claude for synthesis."""
    settings = get_settings()
    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    
    response = await client.messages.create(
        model="claude-3-5-haiku-20241022",  # Cheapest & fastest Claude
        max_tokens=500,
        messages=[{"role": "user", "content": combined_prompt}],
    )
    
    text = response.content[0].text
    logger.info(f"Claude response:\n{text[:500]}")
    
    popular_entry = _parse_response(text, "POPULAR", popular_majority, popular_names)
    timeless_entry = _parse_response(text, "TIMELESS", timeless_majority, timeless_names)
    
    return popular_entry, timeless_entry


async def synthesize_with_claude(
    decade: str,
    region: str,
    art_form: str,
    popular_responses: List[FactCheckResponse],
    timeless_responses: List[FactCheckResponse],
) -> Tuple[ArtEntry, ArtEntry]:
    """
    Synthesize responses and write final descriptions.
    Falls back to OpenAI if Claude fails.
    """
    popular_majority, popular_names = _find_majority(popular_responses)
    timeless_majority, timeless_names = _find_majority(timeless_responses)
    
    popular_prompt = _build_consensus_prompt(
        decade, region, art_form, "popular", popular_responses, popular_majority
    )
    timeless_prompt = _build_consensus_prompt(
        decade, region, art_form, "timeless", timeless_responses, timeless_majority
    )
    
    combined_prompt = f"""You are writing for an art history website. Based on the sources below, provide the name and a short engaging description for each artwork/piece.

=== MOST POPULAR WORK ===
{popular_prompt}

=== MOST TIMELESS WORK ===
{timeless_prompt}

Respond in this exact format:
POPULAR_NAME: [name of the artwork/album/book]
POPULAR_DESCRIPTION: [2-3 casual, engaging sentences about this specific work]

TIMELESS_NAME: [name of the artwork/album/book]
TIMELESS_DESCRIPTION: [2-3 casual, engaging sentences about this specific work]"""

    settings = get_settings()
    
    # Try Claude first, fallback to OpenAI
    if settings.anthropic_api_key:
        try:
            return await _synthesize_with_claude(
                combined_prompt, popular_majority, popular_names,
                timeless_majority, timeless_names
            )
        except Exception as e:
            logger.warning(f"Claude failed, falling back to OpenAI: {e}")
    
    # Fallback to OpenAI
    return await _synthesize_with_openai(
        combined_prompt, popular_majority, popular_names,
        timeless_majority, timeless_names
    )


def _parse_response(
    text: str, 
    prefix: str, 
    majority_name: Optional[str],
    all_names: List[str],
) -> ArtEntry:
    """Parse response to extract name and description."""
    lines = text.split('\n')
    
    name = ""
    description = ""
    
    for line in lines:
        line = line.strip()
        if line.startswith(f"{prefix}_NAME:"):
            name = line.replace(f"{prefix}_NAME:", "").strip()
        elif line.startswith(f"{prefix}_DESCRIPTION:"):
            description = line.replace(f"{prefix}_DESCRIPTION:", "").strip()
    
    if not name:
        name = majority_name or (all_names[0] if all_names else "Unknown Work")
    if not description:
        description = "A notable work from this period."
    
    return ArtEntry(name=name, description=description)
