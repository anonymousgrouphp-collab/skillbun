## Cryptography Fundamentals: A Study Guide

Cryptography is the practice and study of techniques for secure communication in the presence of adversarial behavior. It's a cornerstone of modern cybersecurity, ensuring data confidentiality, integrity, authenticity, and non-repudiation.

### 1. Goals of Cryptography
*   **Confidentiality:** Preventing unauthorized disclosure of information.
*   **Integrity:** Ensuring information has not been altered.
*   **Authenticity:** Verifying the identity of users or the origin of data.
*   **Non-Repudiation:** Preventing someone from denying their actions.

### 2. Symmetric Encryption
Symmetric encryption uses a single, shared secret key for both encrypting and decrypting data. It's generally faster than asymmetric encryption.

*   **How it works:** Sender and receiver agree on a key in advance. The sender uses this key to encrypt the message, and the receiver uses the same key to decrypt it.
*   **Key Challenge:** Securely exchanging the shared secret key, especially over insecure channels.
*   **Algorithm Example: AES (Advanced Encryption Standard)**
    *   A block cipher that operates on fixed-size blocks of data (128 bits).
    *   Key sizes can be 128, 192, or 256 bits, providing strong security.
    *   Widely used in various applications, including Wi-Fi security (WPA2/3), file encryption, and secure communication protocols.

### 3. Asymmetric Encryption (Public Key Cryptography)
Asymmetric encryption uses a pair of mathematically linked keys: a public key and a private key. Data encrypted with one key can only be decrypted with the other.

*   **How it works:**
    *   **Public Key:** Can be freely distributed. Used for encrypting messages or verifying digital signatures.
    *   **Private Key:** Must be kept secret by its owner. Used for decrypting messages or creating digital signatures.
*   **Advantages:** Solves the key exchange problem of symmetric encryption.
*   **Algorithms Examples:**
    *   **RSA (Rivest-Shamir-Adleman):**
        *   One of the oldest and most widely used asymmetric algorithms.
        *   Based on the computational difficulty of factoring large prime numbers.
        *   Used for secure data transmission, digital signatures, and key exchange.
    *   **ECC (Elliptic Curve Cryptography):**
        *   Provides comparable security to RSA with smaller key sizes.
        *   Based on the mathematical properties of elliptic curves over finite fields.
        *   More efficient for mobile and resource-constrained devices.
        *   Gaining popularity in SSL/TLS, cryptocurrencies, and embedded systems.

### 4. Hashing Functions
A hashing function takes an input (or 'message') and returns a fixed-size alphanumeric string (the 'hash value', 'message digest', or 'fingerprint'). Hashing is a one-way process; it's computationally infeasible to reverse a hash to find the original input.

*   **Properties:**
    *   **Deterministic:** The same input always produces the same output.
    *   **One-way:** Cannot be reversed.
    *   **Collision Resistant:** It's difficult to find two different inputs that produce the same output.
*   **Algorithms Examples:**
    *   **SHA-256 (Secure Hash Algorithm 256):**
        *   Produces a 256-bit (32-byte) hash value.
        *   Widely used for verifying data integrity, password storage, and in blockchain technologies.
    *   **MD5 (Message Digest 5):**
        *   Produces a 128-bit hash value.
        *   **Weaknesses:** Known vulnerabilities to collision attacks, meaning different inputs can produce the same hash. **Should not be used for security-critical applications like digital signatures or password storage.** Still sometimes used for checksums to verify file integrity in non-security-critical contexts.

#### Code Example: Hashing with Python (SHA-256)
```python
import hashlib

def generate_sha256_hash(data):
    """Generates a SHA-256 hash for the given string data."""
    # Encode the string to bytes before hashing
    data_bytes = data.encode('utf-8')
    # Create a SHA-256 hash object
    sha256_hash = hashlib.sha256()
    # Update the hash object with the data
    sha256_hash.update(data_bytes)
    # Get the hexadecimal representation of the hash
    return sha256_hash.hexdigest()

message1 = "Hello, SkillBun Students!"
message2 = "Hello, SkillBun Students!"
message3 = "hello, skillbun students!"

print(f"Hash of message1: {generate_sha256_hash(message1)}")
print(f"Hash of message2: {generate_sha256_hash(message2)}")
print(f"Hash of message3: {generate_sha256_hash(message3)}")

# Demonstrating immutability: even a small change results in a totally different hash
message_original = "The quick brown fox jumps over the lazy dog"
message_modified = "The quick brown fox jumps over the lazy cat"

print(f"Hash of original: {generate_sha256_hash(message_original)}")
print(f"Hash of modified: {generate_sha256_hash(message_modified)}")
```

### 5. Digital Signatures
A digital signature provides authenticity, integrity, and non-repudiation for digital messages or documents. It's essentially a cryptographic stamp of approval.

*   **How it works:**
    1.  The sender hashes the original message.
    2.  The sender encrypts this hash using their **private key**.
    3.  The encrypted hash (the digital signature) is appended to the original message.
    4.  The receiver gets the message and signature.
    5.  The receiver hashes the received message using the same hashing algorithm.
    6.  The receiver decrypts the attached digital signature using the sender's **public key**.
    7.  If the newly calculated hash matches the decrypted hash, the signature is valid, confirming integrity and authenticity.

### 6. Public Key Infrastructure (PKI)
PKI is a system of hardware, software, policies, and procedures required to create, manage, distribute, use, store, and revoke digital certificates. It enables the use of public-key cryptography on a large scale.

*   **Key Components:**
    *   **Certificate Authorities (CAs):** Trusted third parties that issue digital certificates and verify the identity of the certificate owner.
    *   **Registration Authorities (RAs):** Verify the identity of individuals requesting certificates from a CA.
    *   **Digital Certificates:** Electronically bind a public key with an identity (e.g., a person, an organization, or a server).
    *   **Certificate Revocation Lists (CRLs) / Online Certificate Status Protocol (OCSP):** Mechanisms for checking the revocation status of certificates.
*   **Certificate Management:** Involves the entire lifecycle of a certificate, from issuance and renewal to revocation and archiving.

### 7. SSL/TLS Handshake Process
SSL (Secure Sockets Layer) and its successor, TLS (Transport Layer Security), are cryptographic protocols that provide secure communication over a computer network. The TLS handshake is the initial negotiation between a client and a server that establishes the parameters for a secure connection.

*   **Simplified Steps:**
    1.  **Client Hello:** Client sends supported TLS versions, cipher suites, compression methods, and a random number.
    2.  **Server Hello:** Server chooses the best TLS version and cipher suite, sends its digital certificate (containing its public key), and another random number.
    3.  **Authentication & Key Exchange:**
        *   Client verifies the server's certificate against trusted CAs.
        *   Client generates a pre-master secret, encrypts it with the server's public key (from the certificate), and sends it to the server.
        *   Server decrypts the pre-master secret with its private key.
        *   Both client and server use the pre-master secret and their random numbers to independently generate the same symmetric session key.
    4.  **Finished:** Both parties send encrypted messages using the new session key to confirm the handshake is complete and secure communication can begin.

### 8. Common Cryptographic Attacks and Countermeasures

*   **Brute-Force Attacks:**
    *   **Description:** Trying every possible key or password until the correct one is found.
    *   **Countermeasures:** Use long, complex keys/passwords; implement account lockout policies; employ strong cryptographic algorithms with sufficiently large key spaces (e.g., AES-256).
*   **Chosen-Plaintext Attacks (CPA):**
    *   **Description:** The attacker can choose arbitrary plaintexts to be encrypted and obtain the corresponding ciphertexts. This can help reveal information about the encryption key.
    *   **Countermeasures:** Use strong, proven encryption modes (e.g., AES in GCM mode) that incorporate nonces/IVs (Initialization Vectors) and are provably secure against CPAs.
*   **Replay Attacks:**
    *   **Description:** An attacker intercepts a valid data transmission and maliciously re-transmits it, potentially masquerading as a legitimate user or repeating a legitimate action.
    *   **Countermeasures:** Include timestamps, nonces (numbers used once), or sequence numbers in communication to detect and reject replayed messages.
*   **Man-in-the-Middle (MITM) Attacks:**
    *   **Description:** An attacker secretly relays and possibly alters the communication between two parties who believe they are directly communicating with each other.
    *   **Countermeasures:** Implement strong authentication mechanisms (e.g., mutual authentication with digital certificates), use secure protocols like TLS/SSL with proper certificate validation.

### Checklist / Exercise:
1.  Explain the primary difference in key usage between symmetric and asymmetric encryption, and provide one real-world example for each.
2.  Why is MD5 considered insecure for password storage and digital signatures, and what is a better alternative?
3.  Describe the role of a Certificate Authority (CA) within a Public Key Infrastructure (PKI) and how it contributes to trust in online communications.
