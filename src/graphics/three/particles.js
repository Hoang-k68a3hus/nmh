import * as THREE from 'three';

export function createParticles(color) {
  const positions = new Float32Array(14 * 3);
  for (let index = 0; index < 14; index++) {
    const phase = index * 2.39996;
    positions.set([Math.sin(phase) * 2.65, 0.6 + (index * 0.73 % 4.2), -0.7 - (index % 3) * 0.18], index * 3);
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color, size: 0.045, transparent: true, opacity: 0.65, depthWrite: false });
  const object = new THREE.Points(geometry, material); object.name = 'garden-sparkles';
  return {
    object,
    configure(count) { object.visible = count > 0; geometry.setDrawRange(0, count); },
    update(time) { object.rotation.z = Math.sin(time * 0.2) * 0.018; material.opacity = 0.58 + Math.sin(time * 0.65) * 0.12; },
    dispose() { geometry.dispose(); material.dispose(); },
  };
}
