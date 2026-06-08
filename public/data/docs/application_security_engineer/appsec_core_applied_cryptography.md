# Applied Cryptography for Secure Systems: Study Guide

This guide provides a comprehensive overview of applied cryptography, focusing on its practical implementation in building secure systems. Understanding these concepts is fundamental for any Application Security Engineer.

## 1. Introduction to Cryptographic Primitives

Cryptography is the practice and study of techniques for secure communication in the presence of adversarial behavior. Applied cryptography involves using these techniques to protect data and communications within real-world systems.

## 2. Symmetric Encryption

Symmetric encryption uses a single, shared secret key for both encrypting and decrypting data. It's highly efficient and ideal for bulk data encryption.

*   **Concept:** Sender and receiver agree on a secret key. Sender encrypts data with this key; receiver decrypts with the same key.
*   **Algorithms:** Advanced Encryption Standard (AES) is the most common and secure symmetric algorithm today.
*   **Use Cases:** Encrypting data at rest (e.g., hard drives, databases) or data in transit after a secure key exchange.

**Example (Conceptual Python using `cryptography` library):**
```python
from cryptography.fernet import Fernet

# Generate a key (should be securely stored and shared)
key = Fernet.generate_key()
fernet = Fernet(key)

# Encrypt data
plaintext = b"My secret message"
encrypted_data = fernet.encrypt(plaintext)
print(f"Encrypted: {encrypted_data}")

# Decrypt data
decrypted_data = fernet.decrypt(encrypted_data)
print(f"Decrypted: {decrypted_data.decode()}")
```

## 3. Asymmetric Encryption (Public-Key Cryptography)

Asymmetric encryption uses a pair of mathematically linked keys: a public key and a private key. The public key can be shared widely, while the private key must be kept secret.

*   **Concept:** Data encrypted with a public key can only be decrypted with the corresponding private key, and vice versa.
*   **Algorithms:** RSA (Rivest-Shamir-Adleman) and Elliptic Curve Cryptography (ECC) are prominent.
*   **Use Cases:** Secure key exchange for symmetric encryption, digital signatures, identity verification.

## 4. Hashing Functions

A cryptographic hash function takes an input (or 'message') and returns a fixed-size alphanumeric string (the 'hash value' or 'digest').

*   **Concept:** One-way function; it's computationally infeasible to reverse a hash to find the original input.
*   **Properties:**
    *   **Deterministic:** Same input always yields the same output.
    *   **Fast computation:** Quick to generate a hash.
    *   **Pre-image resistance:** Hard to find input given an output.
    *   **Second pre-image resistance:** Hard to find a *different* input with the same output as a given input.
    *   **Collision resistance:** Hard to find two different inputs that produce the same output.
*   **Algorithms:** SHA-256, SHA-3.
*   **Use Cases:** Ensuring data integrity (any alteration changes the hash), password storage (store hashes, not actual passwords), digital signatures.

**Example (Python SHA-256):**
```python
import hashlib

data = b"SkillBun is great!"
hash_object = hashlib.sha256(data)
hex_dig = hash_object.hexdigest()
print(f"SHA-256 Hash: {hex_dig}")

altered_data = b"SkillBun is not great!"
altered_hash = hashlib.sha256(altered_data).hexdigest()
print(f"Altered data hash: {altered_hash}")
```

## 5. Digital Signatures

Digital signatures provide integrity, authenticity, and non-repudiation for digital documents and messages.

*   **Concept:** The sender hashes the data and then encrypts this hash with their *private key*. The receiver uses the sender's *public key* to decrypt the hash and compares it with a hash they generate from the received data. If they match, the message is authentic and untampered.
*   **Process:**
    1.  Sender creates a hash of the message.
    2.  Sender encrypts the hash with their private key (this is the digital signature).
    3.  Sender sends the message and the signature.
    4.  Receiver computes a hash of the received message.
    5.  Receiver decrypts the sender's signature using the sender's public key to get the original hash.
    6.  Receiver compares the two hashes. If they match, the signature is valid.
*   **Use Cases:** Verifying software authenticity, securing email, legal documents, cryptocurrency transactions.

## 6. Key Management Lifecycle

Effective key management is critical for the security of any cryptographic system. It encompasses the entire lifespan of a cryptographic key.

*   **Stages:**
    *   **Key Generation:** Creating strong, random keys.
    *   **Key Distribution:** Securely sharing keys with authorized parties.
    *   **Key Storage:** Protecting keys from unauthorized access (e.g., using Hardware Security Modules - HSMs).
    *   **Key Usage:** Applying keys for encryption/decryption, signing, etc.
    *   **Key Rotation:** Periodically replacing old keys with new ones to limit compromise.
    *   **Key Revocation:** Invalidation of a compromised or no longer needed key.
    *   **Key Destruction:** Securely erasing keys when they are no longer needed.

## 7. Public Key Infrastructure (PKI)

PKI provides the framework and services to create, manage, distribute, use, store, and revoke digital certificates, which are essential for asymmetric encryption and digital signatures.

*   **Components:**
    *   **Certificate Authorities (CAs):** Trusted third parties that issue digital certificates.
    *   **Registration Authorities (RAs):** Verify identity of certificate requesters.
    *   **Digital Certificates:** Bind a public key to an entity's identity, signed by a CA.
    *   **Certificate Revocation List (CRL) / Online Certificate Status Protocol (OCSP):** Mechanisms to check if a certificate has been revoked.
*   **Role:** Establishes trust in digital identities, crucial for secure web communication (TLS/SSL).

## 8. Secure TLS/SSL Implementation within Applications

Transport Layer Security (TLS) and its predecessor Secure Sockets Layer (SSL) are cryptographic protocols designed to provide secure communication over a computer network.

*   **Purpose:** Encrypt data in transit, authenticate communicating parties (typically server to client), ensure data integrity.
*   **TLS Handshake (simplified):**
    1.  **Client Hello:** Client sends supported TLS versions, cipher suites, and a random number.
    2.  **Server Hello:** Server responds with chosen TLS version, cipher suite, its certificate (containing public key), and another random number.
    3.  **Authentication:** Client verifies server's certificate with a trusted CA.
    4.  **Key Exchange:** Client and server use asymmetric encryption (from the server's public key) to securely agree on a symmetric session key.
    5.  **Encrypted Communication:** All subsequent communication is encrypted using the agreed-upon symmetric session key.
*   **Best Practices for Applications:**
    *   **Always use HTTPS:** Enforce TLS for all traffic.
    *   **Strong Cipher Suites:** Configure servers to use modern, robust cipher suites and disable weak ones.
    *   **Latest TLS Versions:** Use TLS 1.2 or 1.3, disable older versions (SSLv2, SSLv3, TLS 1.0, TLS 1.1).
    *   **Certificate Pinning:** Hardcode or pre-configure an application to only trust specific server certificates or public keys, preventing Man-in-the-Middle attacks.
    *   **Proper Certificate Validation:** Ensure applications correctly validate server certificates against trusted CAs.
    *   **HSTS (HTTP Strict Transport Security):** Force browsers to only connect via HTTPS to your site.
    *   **Secure Key Storage:** Store private keys securely (e.g., in HSMs or encrypted files with restricted permissions).

**Example (Conceptual Nginx TLS configuration snippet):**
```nginx
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    ssl_protocols TLSv1.2 TLSv1.3; # Use strong protocols
    ssl_ciphers 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE'; # Strong cipher suite
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1h;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        # proxy_pass http://backend_app;
    }
}
```

## Quick Understanding Checklist/Exercise:

1.  Explain the fundamental difference in key usage between symmetric and asymmetric encryption, and provide a common use case for each in a secure application.
2.  You are tasked with storing user passwords securely. Describe why hashing is preferred over encryption for this purpose, and what properties of a good hash function are most relevant here.
3.  Outline the high-level steps involved in a TLS handshake when a browser connects to a web server, focusing on how secure communication is established and validated.