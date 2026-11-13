const sharp = require('sharp');
const path = require('path');

async function generateOmniSearchBanner() {
  const width = 1200;
  const height = 675;

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#090a0f" />
    
    <!-- Outer Card Frame -->
    <rect x="60" y="60" width="${width - 120}" height="${height - 120}" rx="20" fill="#12141c" stroke="#232838" stroke-width="2" />
    
    <!-- Top Pill Badge -->
    <rect x="110" y="115" width="380" height="36" rx="18" fill="rgba(37, 99, 235, 0.15)" stroke="rgba(59, 130, 246, 0.4)" stroke-width="1.5" />
    <circle cx="132" cy="133" r="5" fill="#3b82f6" />
    <text x="148" y="138" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#60a5fa" letter-spacing="1.2">ZERO CLOUD EGRESS • DENSE VECTORS</text>

    <!-- Main Title -->
    <text x="110" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="#ffffff" letter-spacing="-1">OmniSearch Local Semantic Engine</text>

    <!-- Subtitle -->
    <text x="110" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="500" fill="#94a3b8">
      In-process vector retrieval evaluating unit-normalized dot products in memory.
    </text>

    <!-- Telemetry Cards -->
    <g transform="translate(110, 310)">
      <!-- Card 1 -->
      <rect x="0" y="0" width="300" height="110" rx="12" fill="#181b26" stroke="#232838" stroke-width="1.5" />
      <text x="24" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#64748b" letter-spacing="1">QUERY LATENCY</text>
      <text x="24" y="80" font-family="monospace" font-size="32" font-weight="800" fill="#38bdf8">0.23 ms</text>
      <text x="160" y="78" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#22c55e">⚡ 400x faster</text>

      <!-- Card 2 -->
      <rect x="330" y="0" width="300" height="110" rx="12" fill="#181b26" stroke="#232838" stroke-width="1.5" />
      <text x="354" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#64748b" letter-spacing="1">CLOUD TOKEN COST</text>
      <text x="354" y="80" font-family="monospace" font-size="32" font-weight="800" fill="#22c55e">$0.00</text>
      <text x="470" y="78" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#94a3b8">zero egress</text>

      <!-- Card 3 -->
      <rect x="660" y="0" width="300" height="110" rx="12" fill="#181b26" stroke="#232838" stroke-width="1.5" />
      <text x="684" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#64748b" letter-spacing="1">SIMILARITY ALGORITHM</text>
      <text x="684" y="80" font-family="monospace" font-size="28" font-weight="800" fill="#a855f7">u · v</text>
      <text x="760" y="78" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#cbd5e1">dot product</text>
    </g>

    <!-- Bottom Bar -->
    <rect x="110" y="470" width="${width - 220}" height="70" rx="10" fill="#181b26" stroke="#232838" stroke-width="1" />
    <text x="140" y="512" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#cbd5e1">
      Accepted Research Basis: ICMLDE 2026 • Lead Author: David Erikefe (@davebuiltit)
    </text>
    <rect x="${width - 320}" y="487" width="170" height="36" rx="8" fill="#2563eb" />
    <text x="${width - 302}" y="510" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#ffffff">LIVE SIMULATOR</text>
  </svg>
  `;

  const destPath = path.resolve("C:/Users/dafen/Documents/My-Portfolio/public/images/omnisearch.png");
  await sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile(destPath);

  console.log("Successfully generated OmniSearch banner at: " + destPath);
}

generateOmniSearchBanner().catch(console.error);
