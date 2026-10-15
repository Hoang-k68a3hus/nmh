import * as THREE from 'three';

/** Factory sở hữu geometry/material, các bông hoa chỉ mượn cùng tài nguyên. */
export function createFlowerFactory(palette) {
  const geometries = new Set(), materials = new Set(), instances = new Set();
  const makeInstances = (geometry, surface, count) => {
    const mesh = new THREE.InstancedMesh(geometry, surface, count); instances.add(mesh); return mesh;
  };
  const own = (geometry) => { geometries.add(geometry); return geometry; };
  const material = (color) => {
    const value = new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0 });
    materials.add(value); return value;
  };
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(-0.12, 0.1, -0.28, 0.5, 0, 0.68);
  shape.bezierCurveTo(0.28, 0.5, 0.12, 0.1, 0, 0);
  const petal = own(new THREE.ExtrudeGeometry(shape, {
    depth: 0.025, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2, curveSegments: 6, steps: 1,
  }));
  const stem = own(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(), new THREE.Vector3(0.08, 0.55, 0), new THREE.Vector3(0, 1, 0),
  ), 10, 0.028, 5, false));
  const center = own(new THREE.SphereGeometry(1, 12, 8));
  const colors = {
    rose: material(palette.rose), light: material(palette.roseSoft), deep: material(palette.roseDeep),
    paper: material(palette.paper), leaf: material(palette.leaf), leafSoft: material(palette.leafSoft), gold: material(palette.gold),
  };
  let disposed = false;
  function createFlower({ variant = 'rose', height = 3.2, phase = 0 }) {
    const root = new THREE.Group(); root.name = `flower-${variant}`;
    const stalk = new THREE.Mesh(stem, colors.leaf); stalk.scale.y = height; root.add(stalk);
    const leaves = [makeInstances(petal, colors.leaf, 2), makeInstances(petal, colors.leafSoft, 1)];
    const leaf = new THREE.Object3D();
    leaves.forEach(batch => root.add(batch));
    const head = new THREE.Group(); head.position.y = height;
    head.rotation.set(-0.08, phase * 0.025, 0); root.add(head);
    let arrangement = -1;
    function setArrangement(value) {
      const next = THREE.MathUtils.clamp(value, 0, 1);
      if (arrangement === next) return;
      arrangement = next;
      const stalkHeight = height * (1 - .2 * next);
      stalk.scale.y = stalkHeight; head.position.y = stalkHeight;
      for (let index = 0; index < 3; index++) {
        const sign = index % 2 ? -1 : 1;
        const gardenY = height * (.24 + index * .16);
        // Foliage belongs above the mouth of the wrapper. The stalks fan out
        // from the ribbon, so low garden leaves would protrude through its sides.
        const bouquetY = Math.max(1.6, height * .8 * (.58 + index * .1));
        leaf.position.set(0, THREE.MathUtils.lerp(gardenY, bouquetY, next), -.02);
        leaf.rotation.set(-.2, sign * .25, sign * .95);
        leaf.scale.set(.52 - .1 * next, .95 - .27 * next, .6); leaf.updateMatrix();
        leaves[index % 2].setMatrixAt(Math.floor(index / 2), leaf.matrix);
      }
      leaves.forEach(batch => {
        batch.instanceMatrix.needsUpdate = true; batch.boundingBox = null; batch.boundingSphere = null;
      });
    }
    setArrangement(0);
    const petals = [];
    const add = (angle, size, surface, tilt, y = 0) => {
      const pivot = new THREE.Object3D(); pivot.rotation.z = angle; pivot.position.set(0, y, 0);
      const mesh = new THREE.Object3D(); pivot.add(mesh); petals.push({ pivot, mesh, size, tilt, surface });
    };
    if (variant === 'tulip') {
      for (let index = 0; index < 5; index++) add((index - 2) * 0.3, index % 2 ? 0.92 : 1.05, index % 2 ? colors.rose : colors.deep, 0.08 + index * 0.06, -0.22);
    } else {
      const count = variant === 'daisy' ? 10 : 9;
      for (let index = 0; index < count; index++) add(index / count * Math.PI * 2, variant === 'daisy' ? 0.86 : 0.91,
        variant === 'daisy' ? colors.paper : index % 2 ? colors.rose : colors.light, variant === 'daisy' ? 0.12 : 0.32);
      if (variant === 'rose') for (let index = 0; index < 5; index++) add((index + 0.5) / 5 * Math.PI * 2, 0.57, colors.rose, 0.53);
      const core = new THREE.Mesh(center, variant === 'daisy' ? colors.gold : colors.deep);
      core.position.z = 0.11; core.scale.setScalar(variant === 'daisy' ? 0.17 : 0.1); core.scale.z *= 0.55; head.add(core);
    }
    const batches = new Map();
    petals.forEach(entry => {
      if (!batches.has(entry.surface)) batches.set(entry.surface, []);
      batches.get(entry.surface).push(entry);
    });
    const petalsByBatch = [...batches].map(([surface, entries]) => {
      const batch = makeInstances(petal, surface, entries.length);
      batch.instanceMatrix.setUsage(THREE.DynamicDrawUsage); head.add(batch);
      return { batch, entries };
    });
    let bloom = -1;
    return {
      root, head, phase, setArrangement,
      setBloom(value) {
        const next = Math.max(0, Math.min(1, value)); if (next === bloom) return; bloom = next;
        petalsByBatch.forEach(({ batch, entries }) => {
          entries.forEach(({ pivot, mesh, size, tilt }, index) => {
            mesh.scale.set(size * (0.25 + next * 0.75), size * (0.35 + next * 0.65), 1);
            mesh.rotation.x = tilt + (1 - next) * 1.05;
            pivot.updateMatrixWorld(true); batch.setMatrixAt(index, mesh.matrixWorld);
          });
          batch.instanceMatrix.needsUpdate = true; batch.boundingBox = null; batch.boundingSphere = null;
        });
      },
    };
  }
  return {
    createFlower,
    getResources: () => ({ geometries: [...geometries], materials: [...materials] }),
    dispose() { if (disposed) return; disposed = true; instances.forEach(value => value.dispose()); geometries.forEach((value) => value.dispose()); materials.forEach((value) => value.dispose()); },
  };
}
