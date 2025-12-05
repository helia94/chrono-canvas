"""LLM provider classes for fact-checking queries."""

import asyncio
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional
import httpx
from openai import AsyncOpenAI

from config import get_settings


@dataclass
class FactCheckResponse:
    """Response from a fact-checking LLM provider."""
    provider: str
    query_type: str  # "popular" or "timeless"
    art_name: str
    brief_reason: str
    success: bool
    error: Optional[str] = None


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Provider name."""
        pass
    
    @abstractmethod
    async def query_popular(self, decade: str, region: str, art_form: str) -> FactCheckResponse:
        """Query for the most popular art of the decade."""
        pass
    
    @abstractmethod
    async def query_timeless(self, decade: str, region: str, art_form: str) -> FactCheckResponse:
        """Query for the most timeless art from the decade."""
        pass


def _build_popular_prompt(decade: str, region: str, art_form: str) -> str:
    """Build prompt for popular art query."""
    decade_label = f"{decade}s"
    return f"""What was the single most popular/famous {art_form.lower()} work from {region} in the {decade_label}?
Give me just the name of the work and artist, plus one brief sentence why it was popular.
Be concise. Format: "Work Name" by Artist - brief reason"""


def _build_timeless_prompt(decade: str, region: str, art_form: str) -> str:
    """Build prompt for timeless art query."""
    decade_label = f"{decade}s"
    return f"""What is the most timeless/enduring {art_form.lower()} work from {region} created in the {decade_label}?
Something that's still celebrated and influential today.
Give me just the name of the work and artist, plus one brief sentence on its lasting impact.
Be concise. Format: "Work Name" by Artist - brief reason"""


def _parse_response(text: str, provider: str, query_type: str) -> FactCheckResponse:
    """Parse LLM response into structured format."""
    # Simple parsing - extract the work name (first quoted string or first line)
    text = text.strip()
    
    # Try to find quoted work name
    if '"' in text:
        parts = text.split('"')
        if len(parts) >= 2:
            art_name = parts[1]
            brief_reason = text.replace(f'"{art_name}"', '').strip()
            # Clean up the reason
            brief_reason = brief_reason.lstrip(' -–—:').strip()
            return FactCheckResponse(
                provider=provider,
                query_type=query_type,
                art_name=art_name,
                brief_reason=brief_reason[:500],  # Limit length
                success=True,
            )
    
    # Fallback: use first line as name, rest as reason
    lines = text.split('\n')
    art_name = lines[0].strip()
    brief_reason = ' '.join(lines[1:]).strip() if len(lines) > 1 else ""
    
    return FactCheckResponse(
        provider=provider,
        query_type=query_type,
        art_name=art_name[:200],
        brief_reason=brief_reason[:500],
        success=True,
    )


class OpenAIProvider(LLMProvider):
    """OpenAI GPT provider."""
    
    def __init__(self):
        settings = get_settings()
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
    
    @property
    def name(self) -> str:
        return "openai"
    
    async def _query(self, prompt: str, query_type: str) -> FactCheckResponse:
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a concise art history expert. Give brief, factual answers."},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=150,
                temperature=0.3,
            )
            text = response.choices[0].message.content or ""
            return _parse_response(text, self.name, query_type)
        except Exception as e:
            return FactCheckResponse(
                provider=self.name,
                query_type=query_type,
                art_name="",
                brief_reason="",
                success=False,
                error=str(e),
            )
    
    async def query_popular(self, decade: str, region: str, art_form: str) -> FactCheckResponse:
        prompt = _build_popular_prompt(decade, region, art_form)
        return await self._query(prompt, "popular")
    
    async def query_timeless(self, decade: str, region: str, art_form: str) -> FactCheckResponse:
        prompt = _build_timeless_prompt(decade, region, art_form)
        return await self._query(prompt, "timeless")


class PerplexityProvider(LLMProvider):
    """Perplexity AI provider (uses OpenAI-compatible API)."""
    
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.perplexity_api_key
        self.base_url = "https://api.perplexity.ai"
    
    @property
    def name(self) -> str:
        return "perplexity"
    
    async def _query(self, prompt: str, query_type: str) -> FactCheckResponse:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "llama-3.1-sonar-small-128k-online",
                        "messages": [
                            {"role": "system", "content": "You are a concise art history expert. Give brief, factual answers."},
                            {"role": "user", "content": prompt},
                        ],
                        "max_tokens": 150,
                        "temperature": 0.3,
                    },
                )
                response.raise_for_status()
                data = response.json()
                text = data["choices"][0]["message"]["content"]
                return _parse_response(text, self.name, query_type)
        except Exception as e:
            return FactCheckResponse(
                provider=self.name,
                query_type=query_type,
                art_name="",
                brief_reason="",
                success=False,
                error=str(e),
            )
    
    async def query_popular(self, decade: str, region: str, art_form: str) -> FactCheckResponse:
        prompt = _build_popular_prompt(decade, region, art_form)
        return await self._query(prompt, "popular")
    
    async def query_timeless(self, decade: str, region: str, art_form: str) -> FactCheckResponse:
        prompt = _build_timeless_prompt(decade, region, art_form)
        return await self._query(prompt, "timeless")


class XAIProvider(LLMProvider):
    """xAI Grok provider (uses OpenAI-compatible API)."""
    
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.xai_api_key
        self.base_url = "https://api.x.ai/v1"
    
    @property
    def name(self) -> str:
        return "xai"
    
    async def _query(self, prompt: str, query_type: str) -> FactCheckResponse:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "grok-beta",
                        "messages": [
                            {"role": "system", "content": "You are a concise art history expert. Give brief, factual answers."},
                            {"role": "user", "content": prompt},
                        ],
                        "max_tokens": 150,
                        "temperature": 0.3,
                    },
                )
                response.raise_for_status()
                data = response.json()
                text = data["choices"][0]["message"]["content"]
                return _parse_response(text, self.name, query_type)
        except Exception as e:
            return FactCheckResponse(
                provider=self.name,
                query_type=query_type,
                art_name="",
                brief_reason="",
                success=False,
                error=str(e),
            )
    
    async def query_popular(self, decade: str, region: str, art_form: str) -> FactCheckResponse:
        prompt = _build_popular_prompt(decade, region, art_form)
        return await self._query(prompt, "popular")
    
    async def query_timeless(self, decade: str, region: str, art_form: str) -> FactCheckResponse:
        prompt = _build_timeless_prompt(decade, region, art_form)
        return await self._query(prompt, "timeless")


async def query_all_providers(
    decade: str, 
    region: str, 
    art_form: str
) -> tuple[list[FactCheckResponse], list[FactCheckResponse]]:
    """
    Query all providers in parallel for both popular and timeless.
    
    Returns (popular_responses, timeless_responses).
    """
    providers = [OpenAIProvider(), PerplexityProvider(), XAIProvider()]
    
    # Build all tasks (6 total: 2 queries × 3 providers)
    popular_tasks = [p.query_popular(decade, region, art_form) for p in providers]
    timeless_tasks = [p.query_timeless(decade, region, art_form) for p in providers]
    
    # Run all in parallel
    all_results = await asyncio.gather(*popular_tasks, *timeless_tasks, return_exceptions=True)
    
    # Split results
    popular_responses = []
    timeless_responses = []
    
    for i, result in enumerate(all_results):
        if isinstance(result, Exception):
            # Create error response
            provider_name = providers[i % 3].name
            query_type = "popular" if i < 3 else "timeless"
            response = FactCheckResponse(
                provider=provider_name,
                query_type=query_type,
                art_name="",
                brief_reason="",
                success=False,
                error=str(result),
            )
        else:
            response = result
        
        if i < 3:
            popular_responses.append(response)
        else:
            timeless_responses.append(response)
    
    return popular_responses, timeless_responses

