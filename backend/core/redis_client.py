"""
Aegis Migration Factory — Async Redis Client
Connection management + pub/sub helpers
"""

import json
import logging
from typing import Optional, Any

import redis.asyncio as aioredis
from core.config import settings

logger = logging.getLogger("aegis.redis")

_redis_client: Optional[aioredis.Redis] = None


async def get_redis() -> Optional[aioredis.Redis]:
    """Get the shared async Redis connection."""
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = aioredis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                encoding="utf-8",
            )
            await _redis_client.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}. Continuing without Redis.")
            _redis_client = None
    return _redis_client


async def close_redis():
    """Close the Redis connection cleanly."""
    global _redis_client
    if _redis_client:
        await _redis_client.close()
        _redis_client = None
        logger.info("Redis connection closed")


async def redis_set(key: str, value: Any, ex: int = None):
    """Set a key in Redis. Silently fails if Redis is unavailable."""
    r = await get_redis()
    if r is None:
        return
    try:
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        await r.set(key, value, ex=ex)
    except Exception as e:
        logger.warning(f"Redis SET failed for {key}: {e}")


async def redis_get(key: str) -> Optional[str]:
    """Get a key from Redis."""
    r = await get_redis()
    if r is None:
        return None
    try:
        return await r.get(key)
    except Exception as e:
        logger.warning(f"Redis GET failed for {key}: {e}")
        return None


async def redis_get_json(key: str) -> Optional[Any]:
    """Get and parse JSON from Redis."""
    val = await redis_get(key)
    if val is None:
        return None
    try:
        return json.loads(val)
    except json.JSONDecodeError:
        return val


async def redis_lpush(key: str, value: Any):
    """Push to a Redis list."""
    r = await get_redis()
    if r is None:
        return
    try:
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        await r.rpush(key, value)
    except Exception as e:
        logger.warning(f"Redis RPUSH failed for {key}: {e}")


async def redis_lrange(key: str, start: int, end: int) -> list:
    """Get a range from a Redis list."""
    r = await get_redis()
    if r is None:
        return []
    try:
        return await r.lrange(key, start, end)
    except Exception as e:
        logger.warning(f"Redis LRANGE failed for {key}: {e}")
        return []


async def redis_llen(key: str) -> int:
    """Get length of a Redis list."""
    r = await get_redis()
    if r is None:
        return 0
    try:
        return await r.llen(key)
    except Exception as e:
        logger.warning(f"Redis LLEN failed for {key}: {e}")
        return 0


async def redis_publish(channel: str, message: Any):
    """Publish a message to a Redis pub/sub channel."""
    r = await get_redis()
    if r is None:
        return
    try:
        if isinstance(message, (dict, list)):
            message = json.dumps(message)
        await r.publish(channel, message)
    except Exception as e:
        logger.warning(f"Redis PUBLISH failed for {channel}: {e}")


async def redis_delete(key: str):
    """Delete a key from Redis."""
    r = await get_redis()
    if r is None:
        return
    try:
        await r.delete(key)
    except Exception as e:
        logger.warning(f"Redis DELETE failed for {key}: {e}")


async def redis_keys(pattern: str) -> list:
    """Get keys matching a pattern."""
    r = await get_redis()
    if r is None:
        return []
    try:
        return await r.keys(pattern)
    except Exception as e:
        logger.warning(f"Redis KEYS failed for {pattern}: {e}")
        return []
