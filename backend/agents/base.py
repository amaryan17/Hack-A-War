"""
Aegis Migration Factory — Base Agent
Abstract base class for all pipeline agents
"""

import logging
from abc import ABC, abstractmethod
from typing import Optional, Callable, Awaitable, Any

from core.claude import ClaudeClient
from core.config import settings

logger = logging.getLogger("aegis.agents")


class BaseAgent(ABC):
    """Abstract base class for pipeline agents."""

    name: str = "BaseAgent"
    stage_index: int = 0

    def __init__(
        self,
        claude_client: ClaudeClient,
        on_token: Optional[Callable[[str], Awaitable[None]]] = None,
    ):
        self.claude = claude_client
        self.on_token = on_token

    @abstractmethod
    def get_system_prompt(self) -> str:
        """Return the system prompt for this agent."""
        ...

    @abstractmethod
    def build_user_message(self, **kwargs) -> str:
        """Build the user message from input data."""
        ...

    @abstractmethod
    def parse_output(self, raw: dict) -> Any:
        """Parse and validate the raw JSON output into a typed model."""
        ...

    async def run(self, **kwargs) -> Any:
        """
        Execute the agent:
        1. Build prompts
        2. Call Claude (streaming if on_token provided)
        3. Parse and return typed output
        """
        system_prompt = self.get_system_prompt()
        user_message = self.build_user_message(**kwargs)

        logger.info(f"[{self.name}] Starting Claude call...")

        if self.on_token:
            # Stream tokens and also collect JSON
            raw_text = await self.claude.complete(
                system_prompt=system_prompt,
                user_message=user_message,
                max_tokens=8192,
                on_token=self.on_token,
            )
            # Parse the complete response
            parsed = ClaudeClient._parse_json_response(raw_text)
        else:
            parsed = await self.claude.complete_json(
                system_prompt=system_prompt,
                user_message=user_message,
                max_tokens=8192,
            )

        logger.info(f"[{self.name}] Claude call complete, parsing output...")
        return self.parse_output(parsed)
