import secrets
import hashlib


def generate_api_key() -> str:
    """Generate a secure API key like sp_live_xxxxxx"""
    token = secrets.token_hex(32)
    return f"sp_live_{token}"


def hash_api_key(api_key: str) -> str:
    """Hash the key before storing in DB (never store raw key)"""
    return hashlib.sha256(api_key.encode()).hexdigest()