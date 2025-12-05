"""Claude consensus layer - synthesizes responses from multiple providers."""

from typing import Optional, List, Tuple
from anthropic import AsyncAnthropic
from collections import Counter

from config import get_settings
from llm_providers import FactCheckResponse
from models import ArtEntry


def _find_majority(responses: List[FactCheckResponse]) -> Tuple[Optional[str], List[str]]:
    """
    Find majority art name from responses.
    
    Returns (majority_name, all_names).
    Majority requires > 50% of successful responses.
    """
    successful = [r for r in responses if r.success and r.art_name]
    if not successful:
        return None, []
    
    # Normalize names for comparison (lowercase, strip quotes)
    def normalize(name: str) -> str:
        return name.lower().strip().strip('"\'')
    
    names = [r.art_name for r in successful]
    normalized = [normalize(n) for n in names]
    
    # Count occurrences
    counts = Counter(normalized)
    most_common = counts.most_common(1)
    
    if most_common:
        top_name, top_count = most_common[0]
        # Majority = more than half
        if top_count > len(successful) / 2:
            # Return the original (non-normalized) name
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
    """Build prompt for Claude to synthesize responses."""
    decade_label = f"{decade}s"
    
    # Format provider responses
    provider_info = []
    for r in responses:
        if r.success:
            provider_info.append(f"- {r.provider.upper()}: \"{r.art_name}\" - {r.brief_reason}")
        else:
            provider_info.append(f"- {r.provider.upper()}: (failed: {r.error})")
    
    provider_text = "\n".join(provider_info)
    
    type_label = "most popular" if query_type == "popular" else "most timeless/enduring"
    
    if majority_name:
        return f"""Three AI sources were asked about the {type_label} {art_form.lower()} from {region} in the {decade_label}.

Their responses:
{provider_text}

The majority agreed on: "{majority_name}"

Write a short, engaging description (2-3 sentences max) about this work. Be casual and friendly - focus on what makes it surprising, juicy, or fascinating. No formal academic tone. Start directly with the interesting bit, don't say "This work..." or similar."""
    else:
        return f"""Three AI sources were asked about the {type_label} {art_form.lower()} from {region} in the {decade_label}.

Their responses:
{provider_text}

There's no clear majority. Using your judgment, pick the most accurate/notable choice and write a short, engaging description (2-3 sentences max). Be casual and friendly - focus on what makes it surprising, juicy, or fascinating. No formal academic tone.

Format your response as:
CHOICE: "Name of Work" by Artist
DESCRIPTION: Your engaging description here"""


async def synthesize_with_claude(
    decade: str,
    region: str,
    art_form: str,
    popular_responses: List[FactCheckResponse],
    timeless_responses: List[FactCheckResponse],
) -> Tuple[ArtEntry, ArtEntry]:
    """
    Use Claude to synthesize responses and write final descriptions.
    
    Returns (popular_entry, timeless_entry).
    """
    settings = get_settings()
    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    
    # Find majorities
    popular_majority, popular_names = _find_majority(popular_responses)
    timeless_majority, timeless_names = _find_majority(timeless_responses)
    
    # Build prompts
    popular_prompt = _build_consensus_prompt(
        decade, region, art_form, "popular", popular_responses, popular_majority
    )
    timeless_prompt = _build_consensus_prompt(
        decade, region, art_form, "timeless", timeless_responses, timeless_majority
    )
    
    # Combined prompt to save on API calls
    combined_prompt = f"""I need you to write two short descriptions for an art exploration app.

=== TASK 1: MOST POPULAR ===
{popular_prompt}

=== TASK 2: MOST TIMELESS ===
{timeless_prompt}

Format your response exactly like this:
POPULAR_NAME: [name of the work]
POPULAR_DESCRIPTION: [your engaging 2-3 sentence description]

TIMELESS_NAME: [name of the work]  
TIMELESS_DESCRIPTION: [your engaging 2-3 sentence description]"""

    response = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        messages=[
            {
                "role": "user",
                "content": combined_prompt,
            }
        ],
    )
    
    # Parse response
    text = response.content[0].text
    
    popular_entry = _parse_claude_response(text, "POPULAR", popular_majority, popular_names)
    timeless_entry = _parse_claude_response(text, "TIMELESS", timeless_majority, timeless_names)
    
    return popular_entry, timeless_entry


def _parse_claude_response(
    text: str, 
    prefix: str, 
    majority_name: Optional[str],
    all_names: List[str],
) -> ArtEntry:
    """Parse Claude's response to extract name and description."""
    lines = text.split('\n')
    
    name = ""
    description = ""
    
    for line in lines:
        line = line.strip()
        if line.startswith(f"{prefix}_NAME:"):
            name = line.replace(f"{prefix}_NAME:", "").strip()
        elif line.startswith(f"{prefix}_DESCRIPTION:"):
            description = line.replace(f"{prefix}_DESCRIPTION:", "").strip()
    
    # Fallbacks
    if not name:
        name = majority_name or (all_names[0] if all_names else "Unknown Work")
    if not description:
        description = "A notable work from this period."
    
    return ArtEntry(name=name, description=description)
