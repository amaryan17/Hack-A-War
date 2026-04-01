"""
Aegis Migration Factory — Ed25519 Signing
Keypair generation + PDF hash signing
"""

import hashlib
import base64
import logging
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey,
)
from cryptography.hazmat.primitives import serialization

logger = logging.getLogger("aegis.signing")


class SigningService:
    def __init__(self, keys_dir: str = "./keys"):
        self.keys_dir = Path(keys_dir)
        self.private_key: Ed25519PrivateKey | None = None
        self._ensure_keypair()

    def _ensure_keypair(self):
        """Generate Ed25519 keypair if it doesn't exist."""
        self.keys_dir.mkdir(parents=True, exist_ok=True)
        private_path = self.keys_dir / "private.pem"
        public_path = self.keys_dir / "public.pem"

        if private_path.exists():
            logger.info("Loading existing Ed25519 keypair")
            with open(private_path, "rb") as f:
                self.private_key = serialization.load_pem_private_key(
                    f.read(), password=None
                )
        else:
            logger.info("Generating new Ed25519 keypair")
            self.private_key = Ed25519PrivateKey.generate()

            # Write private key
            private_pem = self.private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption(),
            )
            with open(private_path, "wb") as f:
                f.write(private_pem)

            # Write public key
            public_key = self.private_key.public_key()
            public_pem = public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo,
            )
            with open(public_path, "wb") as f:
                f.write(public_pem)

            logger.info(f"Ed25519 keypair generated at {self.keys_dir}")

    def sign_bytes(self, data: bytes) -> str:
        """
        Hash data with SHA-256, sign with Ed25519.
        Returns base64-encoded signature string.
        """
        if self.private_key is None:
            raise RuntimeError("No private key available for signing")

        digest = hashlib.sha256(data).digest()
        signature = self.private_key.sign(digest)
        return base64.b64encode(signature).decode("utf-8")

    def get_fingerprint(self) -> str:
        """Get SHA-256 fingerprint of the public key."""
        if self.private_key is None:
            return "NO_KEY"
        public_key = self.private_key.public_key()
        public_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw,
        )
        digest = hashlib.sha256(public_bytes).hexdigest()
        # Format as colon-separated pairs
        return ":".join(
            digest[i : i + 2].upper() for i in range(0, len(digest), 2)
        )

    def verify_signature(self, data: bytes, signature_b64: str) -> bool:
        """Verify a signature against data."""
        try:
            if self.private_key is None:
                return False
            public_key = self.private_key.public_key()
            digest = hashlib.sha256(data).digest()
            sig_bytes = base64.b64decode(signature_b64)
            public_key.verify(sig_bytes, digest)
            return True
        except Exception:
            return False
