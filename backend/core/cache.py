"""
Redis cache helper (local redis via redis-py).
Gracefully no-ops if Redis is unreachable so the app keeps working without it.
"""
import json
from typing import Any, Optional

from core.config import settings

_client = None
_failed = False


def _get():
    global _client, _failed
    if _client is not None:
        return _client
    if _failed:
        return None
    try:
        import redis

        _client = redis.Redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
        )
        _client.ping()
        return _client
    except Exception:
        _failed = True
        return None


def _dumps(value: Any) -> str:
    return json.dumps(value, default=str, ensure_ascii=False)


def cache_get(key: str) -> Optional[Any]:
    r = _get()
    if not r:
        return None
    try:
        val = r.get(key)
        return json.loads(val) if val else None
    except Exception:
        return None


def cache_set(key: str, value: Any, ex: int = None) -> None:
    r = _get()
    if not r:
        return
    try:
        r.set(key, _dumps(value), ex=ex or settings.CACHE_TTL_SECONDS)
    except Exception:
        pass


def cache_delete(*keys: str) -> None:
    r = _get()
    if not r or not keys:
        return
    try:
        r.delete(*keys)
    except Exception:
        pass


def cache_delete_pattern(pattern: str) -> None:
    """Delete all keys matching a glob pattern (e.g. 'exam:list:*')."""
    r = _get()
    if not r:
        return
    try:
        keys = list(r.scan_iter(match=pattern, count=200))
        if keys:
            r.delete(*keys)
    except Exception:
        pass
