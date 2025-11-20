# MzeeChakula App Icons

This directory should contain the PWA app icons in various sizes.

## Required Icon Sizes

The following icon sizes are required for full PWA support:

- `icon-72x72.png` - Small icon for older devices
- `icon-96x96.png` - Standard small icon
- `icon-128x128.png` - Medium icon
- `icon-144x144.png` - Windows tile icon
- `icon-152x152.png` - iOS icon
- `icon-192x192.png` - Standard icon (required for PWA)
- `icon-384x384.png` - Large icon
- `icon-512x512.png` - Extra large icon (required for PWA)

## Design Guidelines

### Icon Design
- **Primary Color**: #d90000 (Uganda flag red)
- **Secondary Color**: #fcdc04 (Uganda flag yellow)
- **Accent Color**: #078930 (Uganda flag green)
- **Theme**: Elderly care, nutrition, Uganda
- **Style**: Simple, clear, recognizable at small sizes

### Suggested Icon Elements
- Bowl or plate (representing food/nutrition)
- Heart (representing care/health)
- Uganda flag colors
- Simple, bold design for visibility

## How to Generate Icons

### Option 1: Using Online Tools
1. Create a 512x512px master icon
2. Use [PWA Asset Generator](https://www.pwabuilder.com/) or [RealFaviconGenerator](https://realfavicongenerator.net/)
3. Upload your master icon
4. Download all generated sizes
5. Place them in this directory

### Option 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick if not already installed
# Ubuntu/Debian: sudo apt-get install imagemagick
# macOS: brew install imagemagick

# Generate all sizes from a master 512x512 icon
convert master-icon.png -resize 72x72 icon-72x72.png
convert master-icon.png -resize 96x96 icon-96x96.png
convert master-icon.png -resize 128x128 icon-128x128.png
convert master-icon.png -resize 144x144 icon-144x144.png
convert master-icon.png -resize 152x152 icon-152x152.png
convert master-icon.png -resize 192x192 icon-192x192.png
convert master-icon.png -resize 384x384 icon-384x384.png
convert master-icon.png -resize 512x512 icon-512x512.png
```

### Option 3: Using Node.js (pwa-asset-generator)
```bash
npm install -g pwa-asset-generator

# Generate all icons
pwa-asset-generator master-icon.svg ./icons
```

## Temporary Placeholder

Until proper icons are created, you can use a simple colored square as a placeholder:

```bash
# Create a simple red placeholder (requires ImageMagick)
convert -size 512x512 xc:#d90000 -gravity center -pointsize 200 -fill white -annotate +0+0 "M" icon-512x512.png
convert icon-512x512.png -resize 192x192 icon-192x192.png
convert icon-512x512.png -resize 152x152 icon-152x152.png
convert icon-512x512.png -resize 144x144 icon-144x144.png
convert icon-512x512.png -resize 128x128 icon-128x128.png
convert icon-512x512.png -resize 96x96 icon-96x96.png
convert icon-512x512.png -resize 72x72 icon-72x72.png
convert icon-512x512.png -resize 384x384 icon-384x384.png
```

## Testing Icons

After generating icons:
1. Deploy the app
2. Open Chrome DevTools > Application > Manifest
3. Verify all icons are loading correctly
4. Test "Add to Home Screen" functionality
5. Check icon appearance on home screen

## Notes

- Icons should have transparent backgrounds or solid colors
- Avoid detailed designs that won't be visible at smaller sizes
- Test on multiple devices (iOS, Android, Windows)
- Maskable icons should have a safe zone (padding) of at least 10%
