import * as THREE from 'three';

/** Soft layered paper, with separate ownership of its GPU resources. */
export function createBouquetWrapping(palette) {
  const object = new THREE.Group();
  object.name = 'bouquet-wrapping';
  object.position.z = 0.45;
  const geometries = [], materials = [];

  function addCurvedPanel(draw, color, z, roughness = .85, depth = .026) {
    const shape = new THREE.Shape();
    draw(shape); shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth, bevelEnabled: true, bevelSize: .016, bevelThickness: .016,
      bevelSegments: 2, curveSegments: 20, steps: 1,
    });
    // Give the face a gentle bow in depth as well as a curved outline.
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i);
      positions.setZ(i, positions.getZ(i) + Math.sin((y - .1) / 2.5 * Math.PI) * (.065 + .04 * x * x));
    }
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ color, roughness, metalness: .02, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = z; object.add(mesh);
    geometries.push(geometry); materials.push(material);
  }

  addCurvedPanel(s => {
    s.moveTo(-1.18, 2.08);
    s.quadraticCurveTo(-.6, 2.55, 0, 2.52);
    s.quadraticCurveTo(.6, 2.55, 1.18, 2.08);
    s.quadraticCurveTo(.68, 1.25, .22, .72);
    s.lineTo(-.22, .72);
    s.quadraticCurveTo(-.68, 1.25, -1.18, 2.08);
  }, palette.paper, -.95, .92, .02);
  addCurvedPanel(s => {
    s.moveTo(-1.15, 2.06);
    s.bezierCurveTo(-.92, 1.38, -.45, .98, -.18, .78);
    s.lineTo(.18, .78);
    s.bezierCurveTo(.32, 1.12, .22, 1.4, .08, 1.61);
    s.quadraticCurveTo(-.45, 1.72, -.75, 1.91);
    s.quadraticCurveTo(-.78, 1.98, -1.15, 2.06);
  }, palette.roseSoft, .04, .82);
  addCurvedPanel(s => {
    s.moveTo(1.15, 2.06);
    s.bezierCurveTo(.92, 1.38, .45, .98, .18, .78);
    s.lineTo(-.15, .78);
    s.bezierCurveTo(-.28, 1.06, -.2, 1.4, -.16, 1.57);
    s.quadraticCurveTo(.47, 1.72, .77, 1.91);
    s.quadraticCurveTo(.85, 1.96, 1.15, 2.06);
  }, palette.paper, .08);
  addCurvedPanel(s => {
    s.moveTo(-.2, .82);
    s.bezierCurveTo(-.34, .55, -.38, .28, -.26, .14);
    s.quadraticCurveTo(0, .06, .26, .14);
    s.bezierCurveTo(.38, .28, .34, .55, .2, .82);
  }, palette.paper, .02, .88, .03);
  addCurvedPanel(s => {
    s.moveTo(-.14, .8);
    s.quadraticCurveTo(-.24, .45, -.12, .13);
    s.quadraticCurveTo(.02, .11, .1, .15);
    s.quadraticCurveTo(.05, .48, .08, .8);
  }, palette.roseSoft, .06, .84, .022);

  let disposed = false;
  return {
    object,
    ribbonAnchor: new THREE.Vector3(0, .82, .62),
    ribbonLeft: new THREE.Vector3(-.68, .82, .62),
    ribbonRight: new THREE.Vector3(.68, .82, .62),
    setProgress(value) {
      const p = THREE.MathUtils.clamp(value, 0, 1);
      object.visible = p > 0;
      object.scale.set(.9 + p * .1, Math.max(.01, p), 1);
    },
    getResources: () => ({ geometries, materials }),
    dispose() {
      if (disposed) return;
      disposed = true;
      geometries.forEach(value => value.dispose()); materials.forEach(value => value.dispose());
    },
  };
}
