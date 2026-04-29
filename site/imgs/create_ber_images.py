#!/usr/bin/env python3
"""
Create BER-related SVG images based on Irish energy efficiency information
"""

# BER Scale with A-G Ratings
ber_rating_scale = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="300" height="400" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="berGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#2ecc71;stop-opacity:1" />
      <stop offset="14%" style="stop-color:#27ae60;stop-opacity:1" />
      <stop offset="28%" style="stop-color:#f1c40f;stop-opacity:1" />
      <stop offset="42%" style="stop-color:#e67e22;stop-opacity:1" />
      <stop offset="56%" style="stop-color:#e74c3c;stop-opacity:1" />
      <stop offset="70%" style="stop-color:#c0392b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7f1818;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="300" height="400" fill="#f5f5f5"/>
  
  <!-- Title -->
  <text x="150" y="35" font-size="22" font-weight="bold" text-anchor="middle" fill="#003f2d">BER Scale A-G</text>
  <text x="150" y="60" font-size="12" text-anchor="middle" fill="#666">Building Energy Rating</text>
  
  <!-- Main Scale Bar -->
  <rect x="50" y="80" width="200" height="220" fill="url(#berGradient)" stroke="#333" stroke-width="2" rx="5"/>
  
  <!-- Rating Labels -->
  <text x="40" y="115" font-size="14" font-weight="bold" fill="#2ecc71">A</text>
  <text x="40" y="155" font-size="14" font-weight="bold" fill="#27ae60">B</text>
  <text x="40" y="195" font-size="14" font-weight="bold" fill="#f1c40f">C</text>
  <text x="40" y="235" font-size="14" font-weight="bold" fill="#e67e22">D</text>
  <text x="40" y="275" font-size="14" font-weight="bold" fill="#e74c3c">E</text>
  <text x="40" y="315" font-size="14" font-weight="bold" fill="#c0392b">F</text>
  
  <!-- Efficiency Labels -->
  <text x="260" y="115" font-size="11" fill="#2ecc71" font-weight="bold">Most Efficient</text>
  <text x="260" y="155" font-size="10" fill="#27ae60">Very Good</text>
  <text x="260" y="195" font-size="10" fill="#333">Good</text>
  <text x="260" y="235" font-size="10" fill="#333">Average</text>
  <text x="260" y="275" font-size="10" fill="#333">Poor</text>
  <text x="260" y="315" font-size="10" fill="#c0392b">Very Poor</text>
  
  <!-- Bottom Info -->
  <rect x="20" y="340" width="260" height="50" fill="#f0f0f0" stroke="#ddd" stroke-width="1" rx="3"/>
  <text x="30" y="360" font-size="11" fill="#333" font-weight="bold">Lower Bills:</text>
  <text x="30" y="378" font-size="10" fill="#666">A-rated homes save more on energy costs</text>
</svg>'''

# BER Assessment Process
ber_assessment_process = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f5f5f5"/>
  
  <text x="200" y="30" font-size="18" font-weight="bold" text-anchor="middle" fill="#003f2d">BER Assessment Process</text>
  
  <!-- Step 1: Book Assessment -->
  <g>
    <rect x="20" y="60" width="70" height="70" fill="#3498db" rx="5"/>
    <text x="55" y="110" font-size="24" font-weight="bold" text-anchor="middle" fill="white">1</text>
    <text x="55" y="145" font-size="12" text-anchor="middle" fill="#333" font-weight="bold">Book</text>
    <text x="55" y="160" font-size="10" text-anchor="middle" fill="#666">Assessor</text>
  </g>
  
  <!-- Arrow 1 -->
  <line x1="90" y1="95" x2="120" y2="95" stroke="#666" stroke-width="2"/>
  <polygon points="120,95 115,92 115,98" fill="#666"/>
  
  <!-- Step 2: Home Survey -->
  <g>
    <rect x="120" y="60" width="70" height="70" fill="#2ecc71" rx="5"/>
    <text x="155" y="110" font-size="24" font-weight="bold" text-anchor="middle" fill="white">2</text>
    <text x="155" y="145" font-size="12" text-anchor="middle" fill="#333" font-weight="bold">Survey</text>
    <text x="155" y="160" font-size="10" text-anchor="middle" fill="#666">Property</text>
  </g>
  
  <!-- Arrow 2 -->
  <line x1="190" y1="95" x2="220" y2="95" stroke="#666" stroke-width="2"/>
  <polygon points="220,95 215,92 215,98" fill="#666"/>
  
  <!-- Step 3: Get Certificate -->
  <g>
    <rect x="220" y="60" width="70" height="70" fill="#f39c12" rx="5"/>
    <text x="255" y="110" font-size="24" font-weight="bold" text-anchor="middle" fill="white">3</text>
    <text x="255" y="145" font-size="12" text-anchor="middle" fill="#333" font-weight="bold">Receive</text>
    <text x="255" y="160" font-size="10" text-anchor="middle" fill="#666">Certificate</text>
  </g>
  
  <!-- Arrow 3 (down) -->
  <line x1="255" y1="130" x2="255" y2="160" stroke="#666" stroke-width="2"/>
  <polygon points="255,160 252,155 258,155" fill="#666"/>
  
  <!-- Step 4: Advisory Report -->
  <g>
    <rect x="220" y="160" width="70" height="70" fill="#9b59b6" rx="5"/>
    <text x="255" y="210" font-size="24" font-weight="bold" text-anchor="middle" fill="white">4</text>
    <text x="255" y="245" font-size="12" text-anchor="middle" fill="#333" font-weight="bold">Advisory</text>
    <text x="255" y="260" font-size="10" text-anchor="middle" fill="#666">Report</text>
  </g>
  
  <!-- Info Box -->
  <rect x="20" y="190" width="180" height="80" fill="#ecf0f1" stroke="#bdc3c7" stroke-width="1" rx="3"/>
  <text x="30" y="210" font-size="11" font-weight="bold" fill="#333">Key Factors Assessed:</text>
  <text x="30" y="228" font-size="10" fill="#666">• Insulation levels</text>
  <text x="30" y="243" font-size="10" fill="#666">• Heating system type</text>
  <text x="30" y="258" font-size="10" fill="#666">• Windows & doors</text>
</svg>'''

# Energy Efficiency Improvements
ber_improvements = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="350" height="400" viewBox="0 0 350 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="350" height="400" fill="#f5f5f5"/>
  
  <text x="175" y="30" font-size="18" font-weight="bold" text-anchor="middle" fill="#003f2d">How to Improve Your BER</text>
  
  <!-- Insulation Icon -->
  <g>
    <rect x="20" y="50" width="150" height="80" fill="#fff" stroke="#ddd" stroke-width="1" rx="5"/>
    <rect x="30" y="60" width="130" height="15" fill="#3498db" rx="2"/>
    <rect x="30" y="78" width="130" height="15" fill="#3498db" rx="2"/>
    <rect x="30" y="96" width="130" height="15" fill="#3498db" rx="2"/>
    <text x="95" y="135" font-size="13" font-weight="bold" text-anchor="middle" fill="#333">Wall Insulation</text>
  </g>
  
  <!-- Windows Icon -->
  <g>
    <rect x="180" y="50" width="150" height="80" fill="#fff" stroke="#ddd" stroke-width="1" rx="5"/>
    <rect x="195" y="65" width="30" height="30" fill="#87ceeb" stroke="#333" stroke-width="1"/>
    <line x1="210" y1="65" x2="210" y2="95" stroke="#333" stroke-width="1"/>
    <line x1="195" y1="80" x2="225" y2="80" stroke="#333" stroke-width="1"/>
    <rect x="245" y="65" width="30" height="30" fill="#87ceeb" stroke="#333" stroke-width="1"/>
    <line x1="260" y1="65" x2="260" y2="95" stroke="#333" stroke-width="1"/>
    <line x1="245" y1="80" x2="275" y2="80" stroke="#333" stroke-width="1"/>
    <text x="255" y="135" font-size="13" font-weight="bold" text-anchor="middle" fill="#333">Double Glazing</text>
  </g>
  
  <!-- Heating System -->
  <g>
    <rect x="20" y="160" width="150" height="80" fill="#fff" stroke="#ddd" stroke-width="1" rx="5"/>
    <circle cx="60" cy="190" r="15" fill="#ff6b6b" stroke="#333" stroke-width="1"/>
    <path d="M 60 205 L 60 215 M 50 210 L 70 210" stroke="#333" stroke-width="1.5"/>
    <rect x="75" y="185" width="40" height="20" fill="#e74c3c" stroke="#333" stroke-width="1" rx="2"/>
    <text x="95" y="135" font-size="13" font-weight="bold" text-anchor="middle" fill="#333">Modern Boiler</text>
    <text x="95" y="225" font-size="10" text-anchor="middle" fill="#666">Or Heat Pump</text>
  </g>
  
  <!-- Renewable Energy -->
  <g>
    <rect x="180" y="160" width="150" height="80" fill="#fff" stroke="#ddd" stroke-width="1" rx="5"/>
    <!-- Solar panels -->
    <rect x="200" y="175" width="20" height="20" fill="#ffc107" stroke="#333" stroke-width="1"/>
    <rect x="225" y="175" width="20" height="20" fill="#ffc107" stroke="#333" stroke-width="1"/>
    <rect x="200" y="200" width="20" height="20" fill="#ffc107" stroke="#333" stroke-width="1"/>
    <rect x="225" y="200" width="20" height="20" fill="#ffc107" stroke="#333" stroke-width="1"/>
    <text x="255" y="135" font-size="13" font-weight="bold" text-anchor="middle" fill="#333">Solar Panels</text>
    <text x="255" y="230" font-size="10" text-anchor="middle" fill="#666">Renewable Energy</text>
  </g>
  
  <!-- Air Tightness -->
  <g>
    <rect x="20" y="270" width="150" height="80" fill="#fff" stroke="#ddd" stroke-width="1" rx="5"/>
    <rect x="35" y="290" width="20" height="40" fill="#ddd" stroke="#333" stroke-width="1"/>
    <rect x="60" y="290" width="20" height="40" fill="#ddd" stroke="#333" stroke-width="1"/>
    <rect x="85" y="290" width="20" height="40" fill="#ddd" stroke="#333" stroke-width="1"/>
    <path d="M 40 310 L 45 310" stroke="#27ae60" stroke-width="2"/>
    <path d="M 65 310 L 70 310" stroke="#27ae60" stroke-width="2"/>
    <path d="M 90 310 L 95 310" stroke="#27ae60" stroke-width="2"/>
    <text x="95" y="235" font-size="13" font-weight="bold" text-anchor="middle" fill="#333">Seal Air Leaks</text>
    <text x="95" y="355" font-size="10" text-anchor="middle" fill="#666">Draught Sealing</text>
  </g>
  
  <!-- Lighting -->
  <g>
    <rect x="180" y="270" width="150" height="80" fill="#fff" stroke="#ddd" stroke-width="1" rx="5"/>
    <!-- LED bulbs -->
    <circle cx="210" cy="295" r="8" fill="#ffeb3b" stroke="#333" stroke-width="1"/>
    <path d="M 210 303 L 210 315" stroke="#333" stroke-width="1"/>
    <circle cx="245" cy="295" r="8" fill="#ffeb3b" stroke="#333" stroke-width="1"/>
    <path d="M 245 303 L 245 315" stroke="#333" stroke-width="1"/>
    <circle cx="280" cy="295" r="8" fill="#ffeb3b" stroke="#333" stroke-width="1"/>
    <path d="M 280 303 L 280 315" stroke="#333" stroke-width="1"/>
    <text x="255" y="235" font-size="13" font-weight="bold" text-anchor="middle" fill="#333">LED Lighting</text>
    <text x="255" y="355" font-size="10" text-anchor="middle" fill="#666">Energy Efficient</text>
  </g>
</svg>'''

# BER Certificate Benefits
ber_benefits = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="350" height="380" viewBox="0 0 350 380" xmlns="http://www.w3.org/2000/svg">
  <rect width="350" height="380" fill="#f5f5f5"/>
  
  <text x="175" y="30" font-size="18" font-weight="bold" text-anchor="middle" fill="#003f2d">Benefits of Better BER</text>
  
  <!-- Benefit 1: Lower Energy Bills -->
  <g>
    <circle cx="50" cy="80" r="25" fill="#27ae60"/>
    <text x="50" y="88" font-size="20" font-weight="bold" text-anchor="middle" fill="white">€</text>
    <text x="90" y="75" font-size="13" font-weight="bold" fill="#333">Lower Energy Bills</text>
    <text x="90" y="92" font-size="11" fill="#666">Save 30-40% on heating</text>
    <text x="90" y="107" font-size="11" fill="#666">and cooling costs</text>
  </g>
  
  <!-- Benefit 2: Higher Property Value -->
  <g>
    <circle cx="50" cy="150" r="25" fill="#3498db"/>
    <text x="50" y="158" font-size="18" font-weight="bold" text-anchor="middle" fill="white">🏠</text>
    <text x="90" y="145" font-size="13" font-weight="bold" fill="#333">Higher Property Value</text>
    <text x="90" y="162" font-size="11" fill="#666">Improved resale value</text>
    <text x="90" y="177" font-size="11" fill="#666">and market appeal</text>
  </g>
  
  <!-- Benefit 3: Better Comfort -->
  <g>
    <circle cx="50" cy="220" r="25" fill="#f39c12"/>
    <text x="50" y="230" font-size="20" font-weight="bold" text-anchor="middle" fill="white">☀</text>
    <text x="90" y="215" font-size="13" font-weight="bold" fill="#333">Better Comfort</text>
    <text x="90" y="232" font-size="11" fill="#666">Warmer in winter,</text>
    <text x="90" y="247" font-size="11" fill="#666">cooler in summer</text>
  </g>
  
  <!-- Benefit 4: Sustainable Living -->
  <g>
    <circle cx="50" cy="290" r="25" fill="#1abc9c"/>
    <text x="50" y="298" font-size="18" font-weight="bold" text-anchor="middle" fill="white">♻</text>
    <text x="90" y="285" font-size="13" font-weight="bold" fill="#333">Environmental Impact</text>
    <text x="90" y="302" font-size="11" fill="#666">Reduce carbon footprint</text>
    <text x="90" y="317" font-size="11" fill="#666">and energy consumption</text>
  </g>
  
  <!-- Bottom Info Box -->
  <rect x="20" y="330" width="310" height="40" fill="#e8f8f5" stroke="#1abc9c" stroke-width="1" rx="3"/>
  <text x="30" y="350" font-size="11" fill="#333" font-weight="bold">💡 BER Valid for 10 years from issue date</text>
</svg>'''

# Grant Opportunities
ber_grants = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="350" height="400" viewBox="0 0 350 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="350" height="400" fill="#f5f5f5"/>
  
  <text x="175" y="30" font-size="18" font-weight="bold" text-anchor="middle" fill="#003f2d">SEAI Grants Available</text>
  
  <!-- Grant 1 -->
  <g>
    <rect x="20" y="55" width="310" height="65" fill="#fff" stroke="#2ecc71" stroke-width="2" rx="5"/>
    <text x="35" y="77" font-size="13" font-weight="bold" fill="#2ecc71">🏠 Home Energy Upgrade Scheme (HEUS)</text>
    <text x="35" y="98" font-size="11" fill="#666">Up to €6,500 for energy efficiency upgrades</text>
    <text x="35" y="113" font-size="10" fill="#888">Available for homes built before 2006</text>
  </g>
  
  <!-- Grant 2 -->
  <g>
    <rect x="20" y="135" width="310" height="65" fill="#fff" stroke="#3498db" stroke-width="2" rx="5"/>
    <text x="35" y="157" font-size="13" font-weight="bold" fill="#3498db">🔥 Heat Pump Grant</text>
    <text x="35" y="178" font-size="11" fill="#666">€5,000-€8,000 support for heat pump installation</text>
    <text x="35" y="193" font-size="10" fill="#888">Grant levels vary by region and building type</text>
  </g>
  
  <!-- Grant 3 -->
  <g>
    <rect x="20" y="215" width="310" height="65" fill="#fff" stroke="#f39c12" stroke-width="2" rx="5"/>
    <text x="35" y="237" font-size="13" font-weight="bold" fill="#f39c12">🪟 Insulation Support</text>
    <text x="35" y="258" font-size="11" fill="#666">Grants for cavity wall, attic & floor insulation</text>
    <text x="35" y="273" font-size="10" fill="#888">Depends on property type and location</text>
  </g>
  
  <!-- Grant 4 -->
  <g>
    <rect x="20" y="295" width="310" height="65" fill="#fff" stroke="#1abc9c" stroke-width="2" rx="5"/>
    <text x="35" y="317" font-size="13" font-weight="bold" fill="#1abc9c">☀ Solar PV Grant</text>
    <text x="35" y="338" font-size="11" fill="#666">Support for solar panel installation</text>
    <text x="35" y="353" font-size="10" fill="#888">Per-panel system through various SEAI programs</text>
  </g>
</svg>'''

# Save all SVGs
svg_files = {
    'c:\\xampp\\htdocs\\EcoSmartHome\\imgs\\ber-rating-scale.svg': ber_rating_scale,
    'c:\\xampp\\htdocs\\EcoSmartHome\\imgs\\ber-assessment-process.svg': ber_assessment_process,
    'c:\\xampp\\htdocs\\EcoSmartHome\\imgs\\ber-improvements.svg': ber_improvements,
    'c:\\xampp\\htdocs\\EcoSmartHome\\imgs\\ber-benefits.svg': ber_benefits,
    'c:\\xampp\\htdocs\\EcoSmartHome\\imgs\\ber-grants.svg': ber_grants,
}

for filepath, content in svg_files.items():
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'✓ Created: {filepath.split(chr(92))[-1]}')
    except Exception as e:
        print(f'✗ Error: {str(e)}')

print('\nAll BER information images created successfully!')
