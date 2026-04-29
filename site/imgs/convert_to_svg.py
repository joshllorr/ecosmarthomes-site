# BER Scale - Energy Rating visualization
ber_scale_svg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="280" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="berGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#27ae60;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#f39c12;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e74c3c;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="280" fill="#f5f5f5" rx="10"/>
  <text x="100" y="30" font-size="16" font-weight="bold" text-anchor="middle" fill="#333">BER Scale</text>
  
  <g id="scale">
    <rect x="40" y="50" width="120" height="200" fill="url(#berGradient)" rx="5" stroke="#333" stroke-width="2"/>
    <circle cx="100" cy="120" r="8" fill="white" stroke="#333" stroke-width="2"/>
  </g>
  
  <text x="40" y="270" font-size="10" fill="#666">A (Best)</text>
  <text x="170" y="270" font-size="10" fill="#666">G (Worst)</text>
</svg>'''

# Grant Flow - Process diagram
grant_flow_svg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="250" height="200" viewBox="0 0 250 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="250" height="200" fill="#f5f5f5" rx="10"/>
  <text x="125" y="25" font-size="16" font-weight="bold" text-anchor="middle" fill="#333">Grant Flow</text>
  
  <!-- Step 1 -->
  <rect x="15" y="50" width="40" height="40" fill="#3498db" rx="5"/>
  <text x="35" y="78" font-size="14" font-weight="bold" text-anchor="middle" fill="white">1</text>
  
  <!-- Arrow 1 -->
  <line x1="55" y1="70" x2="80" y2="70" stroke="#333" stroke-width="2"/>
  <polygon points="80,70 75,67 75,73" fill="#333"/>
  
  <!-- Step 2 -->
  <rect x="80" y="50" width="40" height="40" fill="#2ecc71" rx="5"/>
  <text x="100" y="78" font-size="14" font-weight="bold" text-anchor="middle" fill="white">2</text>
  
  <!-- Arrow 2 -->
  <line x1="120" y1="70" x2="145" y2="70" stroke="#333" stroke-width="2"/>
  <polygon points="145,70 140,67 140,73" fill="#333"/>
  
  <!-- Step 3 -->
  <rect x="145" y="50" width="40" height="40" fill="#f39c12" rx="5"/>
  <text x="165" y="78" font-size="14" font-weight="bold" text-anchor="middle" fill="white">3</text>
  
  <!-- Arrow down -->
  <line x1="165" y1="90" x2="165" y2="115" stroke="#333" stroke-width="2"/>
  <polygon points="165,115 162,110 168,110" fill="#333"/>
  
  <!-- Step 4 -->
  <rect x="145" y="115" width="40" height="40" fill="#27ae60" rx="5"/>
  <text x="165" y="143" font-size="14" font-weight="bold" text-anchor="middle" fill="white">✓</text>
  
  <!-- Labels -->
  <text x="35" y="120" font-size="9" text-anchor="middle" fill="#666">Apply</text>
  <text x="100" y="120" font-size="9" text-anchor="middle" fill="#666">Assess</text>
  <text x="165" y="120" font-size="9" text-anchor="middle" fill="#666">Approve</text>
  <text x="165" y="175" font-size="9" text-anchor="middle" fill="#666">Fund</text>
</svg>'''

# Hero Home - House illustration
hero_home_svg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="240" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="240" fill="#f5f5f5" rx="10"/>
  
  <!-- House body -->
  <rect x="40" y="100" width="120" height="100" fill="#d4a574" stroke="#333" stroke-width="2"/>
  
  <!-- Roof -->
  <polygon points="40,100 100,30 160,100" fill="#8b4513" stroke="#333" stroke-width="2"/>
  
  <!-- Door -->
  <rect x="85" y="160" width="30" height="40" fill="#6b4423" stroke="#333" stroke-width="1.5"/>
  <circle cx="113" cy="180" r="2" fill="#ffd700"/>
  
  <!-- Window 1 (left) -->
  <rect x="55" y="115" width="20" height="20" fill="#87ceeb" stroke="#333" stroke-width="1.5"/>
  <line x1="65" y1="115" x2="65" y2="135" stroke="#333" stroke-width="1"/>
  <line x1="55" y1="125" x2="75" y2="125" stroke="#333" stroke-width="1"/>
  
  <!-- Window 2 (right) -->
  <rect x="125" y="115" width="20" height="20" fill="#87ceeb" stroke="#333" stroke-width="1.5"/>
  <line x1="135" y1="115" x2="135" y2="135" stroke="#333" stroke-width="1"/>
  <line x1="125" y1="125" x2="145" y2="125" stroke="#333" stroke-width="1"/>
  
  <!-- Chimney -->
  <rect x="155" y="60" width="12" height="50" fill="#8b4513" stroke="#333" stroke-width="1.5"/>
  
  <!-- Solar panels on roof -->
  <rect x="70" y="50" width="12" height="12" fill="#4169e1" stroke="#333" stroke-width="1"/>
  <rect x="88" y="50" width="12" height="12" fill="#4169e1" stroke="#333" stroke-width="1"/>
  
  <text x="100" y="225" font-size="14" font-weight="bold" text-anchor="middle" fill="#333">Smart Home</text>
</svg>'''

# Irish Bungalow - Single story house
irish_bungalow_svg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="240" height="220" viewBox="0 0 240 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="240" height="220" fill="#f5f5f5" rx="10"/>
  
  <!-- House body -->
  <rect x="30" y="90" width="180" height="90" fill="#c9a961" stroke="#333" stroke-width="2"/>
  
  <!-- Roof (pitched) -->
  <polygon points="30,90 120,20 210,90" fill="#a0522d" stroke="#333" stroke-width="2"/>
  
  <!-- Front door -->
  <rect x="100" y="140" width="40" height="40" fill="#8b4513" stroke="#333" stroke-width="2"/>
  <circle cx="137" cy="160" r="2.5" fill="#ffd700"/>
  
  <!-- Left window -->
  <rect x="50" y="110" width="25" height="25" fill="#87ceeb" stroke="#333" stroke-width="1.5"/>
  <line x1="62.5" y1="110" x2="62.5" y2="135" stroke="#333" stroke-width="1"/>
  <line x1="50" y1="122.5" x2="75" y2="122.5" stroke="#333" stroke-width="1"/>
  
  <!-- Right window -->
  <rect x="165" y="110" width="25" height="25" fill="#87ceeb" stroke="#333" stroke-width="1.5"/>
  <line x1="177.5" y1="110" x2="177.5" y2="135" stroke="#333" stroke-width="1"/>
  <line x1="165" y1="122.5" x2="190" y2="122.5" stroke="#333" stroke-width="1"/>
  
  <!-- Left side windows -->
  <rect x="50" y="155" width="20" height="20" fill="#87ceeb" stroke="#333" stroke-width="1.5"/>
  <rect x="165" y="155" width="20" height="20" fill="#87ceeb" stroke="#333" stroke-width="1.5"/>
  
  <!-- Insulation indicator (green glow) -->
  <rect x="30" y="90" width="180" height="90" fill="none" stroke="#2ecc71" stroke-width="1" stroke-dasharray="5,5" opacity="0.5"/>
  
  <text x="120" y="205" font-size="12" font-weight="bold" text-anchor="middle" fill="#333">Irish Retrofit Home</text>
</svg>'''

# Ventilation - HVAC system
ventilation_svg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="220" height="240" viewBox="0 0 220 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="220" height="240" fill="#f5f5f5" rx="10"/>
  <text x="110" y="25" font-size="14" font-weight="bold" text-anchor="middle" fill="#333">Ventilation</text>
  
  <!-- Main unit -->
  <rect x="40" y="50" width="140" height="100" fill="#e0e0e0" stroke="#333" stroke-width="2" rx="5"/>
  
  <!-- Fan blades -->
  <circle cx="110" cy="100" r="30" fill="none" stroke="#333" stroke-width="2"/>
  <path d="M 110 70 Q 125 100 110 130 Q 95 100 110 70" fill="#ff6b6b" opacity="0.6"/>
  <circle cx="110" cy="100" r="5" fill="#333"/>
  
  <!-- Intake -->
  <line x1="20" y1="85" x2="40" y2="85" stroke="#3498db" stroke-width="4"/>
  <polygon points="20,85 25,80 25,90" fill="#3498db"/>
  <text x="15" y="105" font-size="10" fill="#3498db" font-weight="bold">Intake</text>
  
  <!-- Exhaust -->
  <line x1="180" y1="115" x2="200" y2="115" stroke="#e74c3c" stroke-width="4"/>
  <polygon points="200,115 195,110 195,120" fill="#e74c3c"/>
  <text x="175" y="135" font-size="10" fill="#e74c3c" font-weight="bold">Exhaust</text>
  
  <!-- Filter -->
  <rect x="50" y="160" width="120" height="20" fill="#ffd700" stroke="#333" stroke-width="2" rx="3"/>
  <text x="110" y="175" font-size="11" font-weight="bold" text-anchor="middle" fill="#333">Filter</text>
  
  <!-- Heat recovery -->
  <rect x="55" y="190" width="110" height="15" fill="#9b59b6" stroke="#333" stroke-width="1.5" rx="2"/>
  <text x="110" y="201" font-size="9" font-weight="bold" text-anchor="middle" fill="white">Heat Recovery</text>
</svg>'''

# Write SVG files
svg_files = {
    'c:\\xampp\\htdocs\\EcoSmartHome\\imgs\\ber_scale.svg': ber_scale_svg,
    'c:\\xampp\\htdocs\\EcoSmartHome\\imgs\\grant_flow.svg': grant_flow_svg,
    'c:\\xampp\\htdocs\\EcoSmartHome\\imgs\\hero_home.svg': hero_home_svg,
    'c:\\xampp\\htdocs\\EcoSmartHome\\imgs\\irish_bungalow.svg': irish_bungalow_svg,
    'c:\\xampp\\htdocs\\EcoSmartHome\\imgs\\ventilation.svg': ventilation_svg,
}

for filepath, content in svg_files.items():
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'✓ Created: {filepath}')
    except Exception as e:
        print(f'✗ Error creating {filepath}: {str(e)}')

print('\nAll SVG files created successfully!')
