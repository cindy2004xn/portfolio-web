figma.showUI(__html__, { width: 400, height: 500 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'build') {
    await buildDesignSystem();
    figma.ui.postMessage({ type: 'done' });
  }
  if (msg.type === 'close') figma.closePlugin();
};

async function buildDesignSystem() {

  // ── 1. COLOR VARIABLES ──────────────────────────────────────────
  const colorCollection = figma.variables.createVariableCollection('color');
  colorCollection.renameMode(colorCollection.modes[0].modeId, 'default');

  const colors = {
    // Brand
    'color/brand/primary':     { r: 0.173, g: 0.431, b: 0.310 }, // #2c6e4f
    'color/brand/primary-bg':  { r: 0.831, g: 0.929, b: 0.886 }, // #d4ede2

    // Background
    'color/bg/base':     { r: 0.961, g: 0.945, b: 0.922 }, // #f5f1eb
    'color/bg/surface':  { r: 0.918, g: 0.894, b: 0.847 }, // #eae4d8
    'color/bg/card':     { r: 1,     g: 1,     b: 1     }, // #ffffff

    // Text
    'color/text/main':      { r: 0.102, g: 0.102, b: 0.102 }, // #1a1a1a
    'color/text/secondary': { r: 0.420, g: 0.396, b: 0.376 }, // #6b6560
    'color/text/disabled':  { r: 0.698, g: 0.686, b: 0.671 }, // #b2afa9

    // Border
    'color/border/default': { r: 0.867, g: 0.843, b: 0.800 }, // #ddd7cc
    'color/border/strong':  { r: 0.102, g: 0.102, b: 0.102 }, // #1a1a1a

    // Semantic
    'color/brand/dark-surface': { r: 0.102, g: 0.102, b: 0.102 }, // #1a1a1a (dark card)
  };

  for (const [name, rgb] of Object.entries(colors)) {
    const v = figma.variables.createVariable(name, colorCollection, 'COLOR');
    v.setValueForMode(colorCollection.modes[0].modeId, rgb);
  }

  // ── 2. SPACING VARIABLES ────────────────────────────────────────
  const spaceCollection = figma.variables.createVariableCollection('spacing');
  spaceCollection.renameMode(spaceCollection.modes[0].modeId, 'default');

  const spacings = {
    'spacing/xs':  4,
    'spacing/sm':  8,
    'spacing/md':  16,
    'spacing/lg':  24,
    'spacing/xl':  40,
    'spacing/2xl': 64,
  };

  for (const [name, val] of Object.entries(spacings)) {
    const v = figma.variables.createVariable(name, spaceCollection, 'FLOAT');
    v.setValueForMode(spaceCollection.modes[0].modeId, val);
  }

  // ── 3. RADIUS VARIABLES ─────────────────────────────────────────
  const radiusCollection = figma.variables.createVariableCollection('radius');
  radiusCollection.renameMode(radiusCollection.modes[0].modeId, 'default');

  const radii = {
    'radius/sm':   4,
    'radius/md':   8,
    'radius/lg':   12,
    'radius/pill': 999,
  };

  for (const [name, val] of Object.entries(radii)) {
    const v = figma.variables.createVariable(name, radiusCollection, 'FLOAT');
    v.setValueForMode(radiusCollection.modes[0].modeId, val);
  }

  // ── 4. TEXT STYLES ───────────────────────────────────────────────
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });

  const textStyles = [
    { name: 'Display',      size: 48, weight: 400, lineH: 52, tracking: -0.02 },
    { name: 'Heading/H1',   size: 36, weight: 400, lineH: 40, tracking: -0.01 },
    { name: 'Heading/H2',   size: 24, weight: 400, lineH: 30, tracking: -0.01 },
    { name: 'Heading/H3',   size: 18, weight: 500, lineH: 24, tracking: 0     },
    { name: 'Body/Default', size: 15, weight: 400, lineH: 27, tracking: 0     },
    { name: 'Body/Small',   size: 13, weight: 400, lineH: 22, tracking: 0     },
    { name: 'Label/Default',size: 12, weight: 500, lineH: 16, tracking: 0.08  },
    { name: 'Label/Caps',   size: 11, weight: 400, lineH: 16, tracking: 0.14  },
    { name: 'Caption',      size: 11, weight: 400, lineH: 16, tracking: 0.04  },
  ];

  for (const s of textStyles) {
    const style = figma.createTextStyle();
    style.name = s.name;
    style.fontSize = s.size;
    style.fontName = { family: 'Inter', style: s.weight === 500 ? 'Medium' : 'Regular' };
    style.lineHeight = { value: s.lineH, unit: 'PIXELS' };
    style.letterSpacing = { value: s.tracking * 100, unit: 'PERCENT' };
  }

  // ── 5. COLOR STYLES ──────────────────────────────────────────────
  const colorStyles = [
    { name: 'Brand/Primary',      hex: '#2c6e4f' },
    { name: 'Brand/Primary BG',   hex: '#d4ede2' },
    { name: 'Background/Base',    hex: '#f5f1eb' },
    { name: 'Background/Surface', hex: '#eae4d8' },
    { name: 'Background/Card',    hex: '#ffffff' },
    { name: 'Background/Dark',    hex: '#1a1a1a' },
    { name: 'Text/Main',          hex: '#1a1a1a' },
    { name: 'Text/Secondary',     hex: '#6b6560' },
    { name: 'Text/Disabled',      hex: '#b2afa9' },
    { name: 'Border/Default',     hex: '#ddd7cc' },
    { name: 'Border/Strong',      hex: '#1a1a1a' },
  ];

  for (const s of colorStyles) {
    const style = figma.createPaintStyle();
    style.name = s.name;
    const rgb = hexToRgb(s.hex);
    style.paints = [{ type: 'SOLID', color: rgb }];
  }
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16) / 255;
  const g = parseInt(hex.slice(3,5), 16) / 255;
  const b = parseInt(hex.slice(5,7), 16) / 255;
  return { r, g, b };
}
