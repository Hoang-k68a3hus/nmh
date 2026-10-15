import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Matrix4 } from 'three';
import { createFlowerFactory } from '../src/graphics/three/flower-factory.js';
import { createBouquetWrapping } from '../src/graphics/three/bouquet.js';
const palette = { rose: '#e8a6b5', roseSoft: '#f5d2d9', roseDeep: '#b8758c', leaf: '#91a68a', leafSoft: '#ced9c9', gold: '#e8c98e', paper: '#fffdf8' };
test('Bảy hoa chia sẻ tài nguyên; geometry/material dispose đúng một lần', () => {
  const factory = createFlowerFactory(palette), geometries = new Set(), materials = new Set();
  for (let index = 0; index < 7; index++) {
    const { root } = factory.createFlower({ variant: ['rose', 'daisy', 'tulip'][index % 3] });
    root.traverse((object) => { if (object.geometry) geometries.add(object.geometry); if (object.material) materials.add(object.material); });
  }
  assert.equal(geometries.size, 3); assert.equal(materials.size, 7);
  let disposed = 0;
  [...geometries, ...materials].forEach((value) => value.addEventListener('dispose', () => disposed++));
  factory.dispose(); factory.dispose(); assert.equal(disposed, 10);
});
test('Cánh nở có kích thước hữu hạn và rộng hơn nụ ở cả ba kiểu hoa', () => {
  const factory = createFlowerFactory(palette);
  for (const variant of ['rose', 'daisy', 'tulip']) {
    const flower = factory.createFlower({ variant }); flower.setBloom(0);
    const bud = new Box3().setFromObject(flower.head); flower.setBloom(1);
    const bloom = new Box3().setFromObject(flower.head);
    assert.ok(Number.isFinite(bloom.max.x) && Number.isFinite(bloom.max.y));
    assert.ok(bloom.max.x - bloom.min.x > bud.max.x - bud.min.x, variant);
  }
  factory.dispose();
});

test('Giấy gói có geometry hữu hạn, mở ra và dispose mỗi tài nguyên một lần', () => {
  const wrapping = createBouquetWrapping(palette); wrapping.setProgress(0); assert.equal(wrapping.object.visible, false);
  wrapping.setProgress(1); assert.equal(wrapping.object.visible, true);
  const bounds = new Box3().setFromObject(wrapping.object); assert.ok(Number.isFinite(bounds.max.x) && bounds.max.y>bounds.min.y);
  const { geometries, materials } = wrapping.getResources(); let disposals = 0;
  const resources = new Set([...geometries, ...materials]);
  assert.ok(geometries.length >= 3, 'Layered wrapping keeps each curved panel');
  resources.forEach(value => value.addEventListener('dispose', () => disposals++));
  wrapping.dispose(); wrapping.dispose(); assert.equal(disposals, resources.size);
});

test('Gom bó hoa đưa lá lên miệng giấy và trả lại dáng vườn khi cuộn ngược', () => {
  const factory = createFlowerFactory(palette);
  const flower = factory.createFlower({ height: 2.45 });
  const leafBatches = flower.root.children.filter(object => object.isInstancedMesh);
  const before = leafBatches.map(batch => [...batch.instanceMatrix.array]);
  flower.setArrangement(1);
  assert.ok(Math.abs(flower.head.position.y - 2.45 * .8) < 1e-8);
  for (const batch of leafBatches) {
    for (let i = 0; i < batch.count; i++) {
      const matrix = new Matrix4(); batch.getMatrixAt(i, matrix);
      assert.ok(matrix.elements[13] >= 1.6 - 1e-6, 'Foliage starts above the paper opening');
      assert.ok(matrix.elements.every(Number.isFinite));
    }
  }
  flower.setArrangement(0);
  assert.equal(flower.head.position.y, 2.45);
  leafBatches.forEach((batch, i) => assert.deepEqual([...batch.instanceMatrix.array], before[i]));
  factory.dispose();
});

test('Cánh/lá được gom theo vật liệu; buffer instance dispose đúng một lần', () => {
  const factory = createFlowerFactory(palette); let disposals = 0;
  for (const variant of ['rose', 'daisy', 'tulip']) {
    const flower = factory.createFlower({ variant }); flower.setBloom(1);
    const instances = []; let drawObjects = 0;
    flower.root.traverse(object => { if (object.isMesh) drawObjects++; if (object.isInstancedMesh) instances.push(object); });
    assert.ok(drawObjects <= 6, variant); assert.ok(instances.length >= 3);
    instances.forEach(object => object.addEventListener('dispose', () => disposals++));
  }
  factory.dispose(); const count = disposals; factory.dispose();
  assert.equal(disposals, count); assert.equal(count, 11);
});
