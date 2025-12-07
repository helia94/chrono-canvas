"""Claude consensus layer - synthesizes responses from multiple providers."""

from typing import Optional, List, Tuple
from anthropic import AsyncAnthropic
from collections import Counter

from config import get_settings
from llm_providers import FactCheckResponse
from models import ArtEntry


def _find_majority_genre(responses: List[FactCheckResponse]) -> Tuple[Optional[str], List[str]]:
    """
    Find majority genre from responses.
    
    Returns (majority_genre, all_genres).
    Majority requires > 50% of successful responses.
    """
    successful = [r for r in responses if r.success and r.genre]
    if not successful:
        return None, []
    
    # Normalize names for comparison (lowercase, strip quotes)
    def normalize(name: str) -> str:
        return name.lower().strip().strip('"\'')
    
    genres = [r.genre for r in successful]
    normalized = [normalize(g) for g in genres]
    
    # Count occurrences
    counts = Counter(normalized)
    most_common = counts.most_common(1)
    
    if most_common:
        top_name, top_count = most_common[0]
        # Majority = more than half
        if top_count > len(successful) / 2:
            # Return the original (non-normalized) name
            for genre, norm in zip(genres, normalized):
                if norm == top_name:
                    return genre, genres
    
    return None, genres


def _build_consensus_prompt(
    decade: str,
    region: str,
    art_form: str,
    query_type: str,
    responses: List[FactCheckResponse],
    majority_genre: Optional[str],
) -> str:
    """Build prompt for Claude to synthesize responses."""
    decade_label = f"{decade}s"
    
    # Format provider responses
    provider_info = []
    for r in responses:
        if r.success:
            provider_info.append(
                f"- {r.provider.upper()}:\n"
                f"  Genre: {r.genre}\n"
                f"  Artists: {r.artists}\n"
                f"  Example: {r.example_work}\n"
                f"  Reason: {r.brief_reason}"
            )
        else:
            provider_info.append(f"- {r.provider.upper()}: (failed: {r.error})")
    
    provider_text = "\n".join(provider_info)
    
    type_label = "most popular" if query_type == "popular" else "most timeless/enduring"
    
    tone_instructions = """Write a short, honest description (2-3 sentences) about this genre. 
Be authentic and direct - like a knowledgeable friend who genuinely cares about this art form.
NO marketing language, NO romanticizing, NO hyperbole like "revolutionary" or "transformed everything".
Tell the truth about what made it interesting, including any contradictions or complexities.
If it had flaws or critics, acknowledge them briefly. Sound like a thoughtful person, not a museum placard."""

    if majority_genre:
        return f"""Three AI sources were asked about the {type_label} {art_form.lower()} genre from {region} in the {decade_label}.

Their responses:
{provider_text}

The majority agreed on genre: "{majority_genre}"

Based on these responses, provide:
1. The genre name (use the majority)
2. The most notable artists mentioned (combine the best from all sources)
3. Pick the best example work mentioned
4. {tone_instructions}"""
    else:
        return f"""Three AI sources were asked about the {type_label} {art_form.lower()} genre from {region} in the {decade_label}.

Their responses:
{provider_text}

There's no clear majority on genre. Using your judgment:
1. Pick the most accurate/notable genre
2. List the most notable artists
3. Pick the best example work
4. {tone_instructions}"""


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
    popular_majority, popular_genres = _find_majority_genre(popular_responses)
    timeless_majority, timeless_genres = _find_majority_genre(timeless_responses)
    
    # Build prompts
    popular_prompt = _build_consensus_prompt(
        decade, region, art_form, "popular", popular_responses, popular_majority
    )
    timeless_prompt = _build_consensus_prompt(
        decade, region, art_form, "timeless", timeless_responses, timeless_majority
    )
    
    # Combined prompt to save on API calls
    combined_prompt = f"""I need you to synthesize information about art genres for an art exploration app.

=== TASK 1: MOST POPULAR ===
{popular_prompt}

=== TASK 2: MOST TIMELESS ===
{timeless_prompt}

Format your response exactly like this:
POPULAR_GENRE: [genre name]
POPULAR_ARTISTS: [artist names, comma separated]
POPULAR_EXAMPLE: [specific work title by artist]
POPULAR_DESCRIPTION: [your engaging 2-3 sentence description]

TIMELESS_GENRE: [genre name]
TIMELESS_ARTISTS: [artist names, comma separated]
TIMELESS_EXAMPLE: [specific work title by artist]
TIMELESS_DESCRIPTION: [your engaging 2-3 sentence description]"""

    response = await client.messages.create(
        model="claude-3-5-haiku-20241022",  # Fast & cheap: $1/M in, $5/M out
        max_tokens=700,
        messages=[
            {
                "role": "user",
                "content": combined_prompt,
            }
        ],
    )
    
    # Parse response
    text = response.content[0].text
    
    popular_entry = _parse_claude_response(text, "POPULAR", popular_responses)
    timeless_entry = _parse_claude_response(text, "TIMELESS", timeless_responses)
    
    return popular_entry, timeless_entry


def _parse_claude_response(
    text: str, 
    prefix: str, 
    responses: List[FactCheckResponse],
) -> ArtEntry:
    """Parse Claude's response to extract genre, artists, example, and description."""
    lines = text.split('\n')
    
    genre = ""
    artists = ""
    example_work = ""
    description = ""
    
    for line in lines:
        line = line.strip()
        if line.startswith(f"{prefix}_GENRE:"):
            genre = line.replace(f"{prefix}_GENRE:", "").strip()
        elif line.startswith(f"{prefix}_ARTISTS:"):
            artists = line.replace(f"{prefix}_ARTISTS:", "").strip()
        elif line.startswith(f"{prefix}_EXAMPLE:"):
            example_work = line.replace(f"{prefix}_EXAMPLE:", "").strip()
        elif line.startswith(f"{prefix}_DESCRIPTION:"):
            description = line.replace(f"{prefix}_DESCRIPTION:", "").strip()
    
    # Fallbacks from provider responses
    successful = [r for r in responses if r.success]
    if not genre and successful:
        genre = successful[0].genre or "Unknown Genre"
    if not artists and successful:
        artists = successful[0].artists or "Various Artists"
    if not example_work and successful:
        example_work = successful[0].example_work or "Notable Work"
    if not description:
        description = "A notable genre from this period."
    
    return ArtEntry(
        genre=genre or "Unknown Genre",
        artists=artists or "Various Artists", 
        exampleWork=example_work or "Notable Work",
        description=description
    )
