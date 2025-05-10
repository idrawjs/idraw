/**
 * Synchronously generates 32-character Base36 encoded hash (enhanced 256-bit algorithm)
 * @param str - Input string (any length)
 * @returns 32-character lowercase Base36 string (0-9a-z)
 */
export function generate32Base36Hash(str: string): string {
  // Generate 256-bit hash (4x64-bit FNV hashes)
  const hash256 = generate256BitHash(str);
  // Convert to Base36 and format to 32 characters
  return bigIntToBase36(hash256).padStart(32, '0').slice(0, 32);
}
// // Usage example
// console.log(generate32Base36Hash('hello world'));
// // Sample output: 2yj8q4z7kpr6s9d5m2w3x1g6h8j4n0q

// Core algorithm for generating 256-bit hash
function generate256BitHash(str: string): bigint {
  let h1 = 0xcbf29ce484222325n,
    h2 = 0x84222325cbf29ce4n;
  let h3 = 0x1b3n * h1,
    h4 = 0x1000000n * h2; // Different initial values
  const prime = 0x100000001b3n;

  // Chunk processing for large texts (per 4096 characters)
  const chunkSize = 4096;
  for (let i = 0; i < str.length; i += chunkSize) {
    const chunk = str.slice(i, i + chunkSize);
    for (let j = 0; j < chunk.length; j++) {
      const code = BigInt(chunk.charCodeAt(j) + i + j); // Position-sensitive
      h1 = (h1 ^ code) * prime;
      h2 = ((h2 ^ h1) * prime) ^ h3;
      h3 = (h3 ^ h2) * prime + h4;
      h4 = ((h4 ^ h3) * prime) | 0x1234567890abcdefn;
    }
  }

  // Combine 4x64-bit hashes into 256-bit
  return (h1 << 192n) | (h2 << 128n) | (h3 << 64n) | h4;
}

// Utility function for BigInt to Base36 conversion
function bigIntToBase36(num: bigint): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  if (num === 0n) return '0';
  let result = '';
  while (num > 0n) {
    const rem = num % 36n;
    result = chars[Number(rem)] + result;
    num = num / 36n;
  }
  return result;
}
