"""
Aegis Migration Factory — Claude API Wrapper
Streaming + JSON completion via Anthropic SDK
"""

import json
import re
import asyncio
import logging
from typing import Optional, Callable, Awaitable

import anthropic

logger = logging.getLogger("aegis.claude")


class ClaudeClient:
    def __init__(self, api_key: str, model: str):
        self.client = anthropic.AsyncAnthropic(api_key=api_key)
        self.model = model

    async def complete(
        self,
        system_prompt: str,
        user_message: str,
        max_tokens: int = 4096,
        on_token: Optional[Callable[[str], Awaitable[None]]] = None,
    ) -> str:
        """
        Call Claude API. If on_token is provided, stream tokens and call
        on_token for each chunk. Returns complete response string.
        Retries up to 3 times with exponential backoff on API errors.
        """
        last_error = None
        for attempt in range(3):
            try:
                if on_token:
                    return await self._stream_complete(
                        system_prompt, user_message, max_tokens, on_token
                    )
                else:
                    return await self._batch_complete(
                        system_prompt, user_message, max_tokens
                    )
            except anthropic.APIError as e:
                last_error = e
                wait = 2 ** attempt
                logger.warning(
                    f"Claude API error (attempt {attempt + 1}/3): {e}. "
                    f"Retrying in {wait}s..."
                )
                await asyncio.sleep(wait)
            except Exception as e:
                last_error = e
                wait = 2 ** attempt
                logger.warning(
                    f"Unexpected error calling Claude (attempt {attempt + 1}/3): {e}. "
                    f"Retrying in {wait}s..."
                )
                await asyncio.sleep(wait)

        raise RuntimeError(
            f"Claude API failed after 3 attempts. Last error: {last_error}"
        )

    async def _batch_complete(
        self, system_prompt: str, user_message: str, max_tokens: int
    ) -> str:
        """Non-streaming completion."""
        message = await self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )
        return message.content[0].text

    async def _stream_complete(
        self,
        system_prompt: str,
        user_message: str,
        max_tokens: int,
        on_token: Callable[[str], Awaitable[None]],
    ) -> str:
        """Streaming completion with on_token callback."""
        full_response = ""
        async with self.client.messages.stream(
            model=self.model,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        ) as stream:
            async for text in stream.text_stream:
                full_response += text
                await on_token(text)
        return full_response

    async def complete_json(
        self,
        system_prompt: str,
        user_message: str,
        max_tokens: int = 4096,
    ) -> dict:
        """
        Call Claude and parse JSON response.
        System prompt MUST include instruction to respond only with JSON.
        Strips markdown fences and retries on parse failure.
        """
        json_instruction = (
            "\n\nCRITICAL: Respond ONLY with valid JSON. "
            "No markdown fences. No explanation. Just the raw JSON object."
        )
        if "Respond ONLY with valid JSON" not in system_prompt:
            system_prompt = system_prompt + json_instruction

        last_error = None
        current_user_message = user_message

        for attempt in range(3):
            try:
                raw = await self.complete(
                    system_prompt=system_prompt,
                    user_message=current_user_message,
                    max_tokens=max_tokens,
                )
                parsed = self._parse_json_response(raw)
                return parsed
            except json.JSONDecodeError as e:
                last_error = e
                logger.warning(
                    f"JSON parse failed (attempt {attempt + 1}/3): {e}"
                )
                # Append error feedback for retry
                current_user_message = (
                    f"{user_message}\n\n"
                    f"YOUR PREVIOUS RESPONSE FAILED JSON PARSING WITH ERROR: {e}\n"
                    f"Please fix the JSON and respond again. "
                    f"Remember: ONLY valid JSON, no markdown fences, no explanation."
                )
            except Exception as e:
                last_error = e
                logger.warning(
                    f"Error in complete_json (attempt {attempt + 1}/3): {e}"
                )
                await asyncio.sleep(2 ** attempt)

        raise RuntimeError(
            f"Failed to get valid JSON from Claude after 3 attempts. "
            f"Last error: {last_error}"
        )

    @staticmethod
    def _parse_json_response(raw: str) -> dict:
        """Strip markdown fences and parse JSON."""
        cleaned = raw.strip()
        # Remove ```json ... ``` fences
        cleaned = re.sub(r"^```(?:json)?\s*\n?", "", cleaned)
        cleaned = re.sub(r"\n?```\s*$", "", cleaned)
        cleaned = cleaned.strip()
        return json.loads(cleaned)
