export const qualityPresets = {
  low: { dpr: 1, particles: 0, fps: 24 },
  mobile: { dpr: 1.5, particles: 8, fps: 30 },
  desktop: { dpr: 2, particles: 14, fps: 45 },
};

export function selectQuality({ width, memory, cores, saveData = false, coarsePointer = false, preset = 'auto' }) {
  if (Object.hasOwn(qualityPresets, preset)) return { name: preset, ...qualityPresets[preset] };
  const name = saveData || (memory > 0 && memory <= 4) || (cores > 0 && cores <= 4)
    ? 'low' : coarsePointer || width <= 700 ? 'mobile' : 'desktop';
  return { name, ...qualityPresets[name] };
}
