"""Emotion resolution service using LLM providers."""

import json
import logging
from dataclasses import dataclass
from typing import Optional, List
from openai import AsyncOpenAI

from config import get_settings

logger = logging.getLogger(__name__)


@dataclass
class EmotionWord:
    """A nuanced emotion word from another culture."""
    name: str
    language: str
    meaning: str
    cultural_context: str


@dataclass
class EmotionResponse:
    """Response from emotion resolution."""
    intro: str
    emotions: List[EmotionWord]
    success: bool
    error: Optional[str] = None


def _build_emotion_prompt(emotion: str) -> str:
    """Build prompt for emotion resolution query."""
    return f"""You study emotions for a living. While others may know sad, angry and happy, 
your vocabulary of emotions and mastery of words in all languages is simply uncanny in the world.

You want to share some of this cross-cultural knowledge that you have.

Find all other emotion words that fall into the same category as "{emotion}", 
but that are more specific and detailed. They might only capture a subset of the emotion-word.

Find words that apply to different contexts and specific situations, making the emotion more nuanced and accurate.
Focus more on different applications of the emotion rather than words that only change the intensity.

If there are not many in English, try your knowledge of:
[Arabic, Russian, Persian, Chinese, Japanese, Spanish, German, French, Greek, Portuguese, Korean, Hindi]

Mention words ONLY if they have meaning that cannot be translated into one English word, 
and have significantly more meaning than English versions.

Write the word in its original language script and a short English description.
Do NOT repeat boring translations of the initial word. Search for surprising and interesting ones.

Aim for 6 to 12 new emotions.

Return in this exact JSON format:
{{
  "intro": "A brief, evocative introduction about the emotion family (1-2 sentences).",
  "emotions": [
    {{
      "name": "Word (Original Script)",
      "language": "Language name",
      "meaning": "Brief meaning in English",
      "cultural_context": "Historical or cultural background that gives this word its depth"
    }}
  ]
}}

The chosen emotion word is "{emotion}"."""


def _parse_emotion_response(text: str) -> EmotionResponse:
    """Parse LLM response into structured format."""
    try:
        # Try to extract JSON from the response
        text = text.strip()
        
        # Handle markdown code blocks
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        data = json.loads(text)
        
        emotions = []
        for item in data.get("emotions", []):
            emotions.append(EmotionWord(
                name=item.get("name", ""),
                language=item.get("language", ""),
                meaning=item.get("meaning", ""),
                cultural_context=item.get("cultural_context", item.get("cultural context", "")),
            ))
        
        return EmotionResponse(
            intro=data.get("intro", ""),
            emotions=emotions,
            success=True,
        )
    except Exception as e:
        logger.error(f"Failed to parse emotion response: {e}")
        return EmotionResponse(
            intro="",
            emotions=[],
            success=False,
            error=f"Failed to parse response: {str(e)}",
        )


class EmotionResolver:
    """Resolves emotions into nuanced cross-cultural variants."""
    
    def __init__(self):
        settings = get_settings()
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
    
    async def resolve(self, emotion: str) -> EmotionResponse:
        """
        Resolve an emotion into more nuanced variants from different cultures.
        
        Args:
            emotion: The base emotion word to explore (e.g., "happy", "sad", "angry")
            
        Returns:
            EmotionResponse with intro and list of nuanced emotion words
        """
        try:
            prompt = _build_emotion_prompt(emotion)
            
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a polyglot emotion researcher with deep knowledge of untranslatable words across cultures. Respond only in valid JSON."
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=2000,
                temperature=0.7,
            )
            
            text = response.choices[0].message.content or ""
            return _parse_emotion_response(text)
            
        except Exception as e:
            logger.error(f"Error resolving emotion '{emotion}': {e}")
            return EmotionResponse(
                intro="",
                emotions=[],
                success=False,
                error=str(e),
            )


# Singleton instance
emotion_resolver = EmotionResolver()
