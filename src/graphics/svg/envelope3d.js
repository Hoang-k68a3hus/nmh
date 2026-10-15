import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * Bảng màu chuẩn theo Art Direction "A Letter Made of Light"
 */
const PALETTE = {
  ivoryBg: 0xfcf6f0,
  envelopeBase: 0xeedfcc,
  envelopeInner: 0xe4d2ba,
  envelopeSide: 0xe9d8c3,
  envelopePocket: 0xf1e4d3,
  cardPaper: 0xfffdf8,
  espressoInk: 0x382b31,
  burgundySeal: 0x91435f,
  sageLeaf: 0x91a58b,
  sageLeafDark: 0x788c73,
  sageStem: 0x6e7f68,
  champagneGold: 0xe9c787,
  shadowWarm: '#4a373d',
};

/**
 * Tạo procedural paper fiber texture nhẹ trong bộ nhớ (không cần tải file ngoài)
 */
function createPaperFiberTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  // Nhiễu hạt giấy mịn kết hợp sợi giấy ngắn
  let seed = 20102026;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < data.length; i += 4) {
    const grain = (rand() - 0.5) * 28;
    const val = Math.max(0, Math.min(255, 128 + grain));
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  // Vẽ các sợi giấy cotton siêu mảnh
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.lineWidth = 0.75;
  for (let i = 0; i < 140; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const len = 4 + rand() * 10;
    const angle = rand() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

/**
 * Tạo texture bề mặt tấm thiệp (in typography editorial + viền vàng champagne + họa tiết)
 */
function createLetterCardTexture() {
  const width = 1024;
  const height = 900;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Nền giấy kem ấm
  ctx.fillStyle = '#FFFDF8';
  ctx.fillRect(0, 0, width, height);

  // Hạt giấy rất nhẹ trên mặt thiệp
  ctx.fillStyle = 'rgba(238, 223, 204, 0.16)';
  for (let i = 0; i < 1800; i++) {
    const x = (i * 73) % width;
    const y = ((i * 139) % height);
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  // Khung viền đôi Champagne Gold
  ctx.strokeStyle = '#E9C787';
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  ctx.strokeStyle = 'rgba(233, 199, 135, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(60, 60, width - 120, height - 120);

  // Góc trang trí tối giản
  const corners = [
    [48, 48, 1, 1],
    [width - 48, 48, -1, 1],
    [48, height - 48, 1, -1],
    [width - 48, height - 48, -1, -1],
  ];
  ctx.strokeStyle = '#D9B46E';
  ctx.lineWidth = 2;
  corners.forEach(([cx, cy, sx, sy]) => {
    ctx.beginPath();
    ctx.arc(cx + sx * 18, cy + sy * 18, 6, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Dòng phụ đề ngày lễ nhỏ phía trên
  ctx.fillStyle = '#91435F';
  ctx.font = '500 22px "Georgia", "Times New Roman", serif';
  ctx.letterSpacing = '6px';
  ctx.textAlign = 'center';
  ctx.fillText('20 · 10 · 2026', width / 2, 148);

  // Đường kẻ mảnh champagne dưới ngày
  ctx.strokeStyle = '#E9C787';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 70, 172);
  ctx.lineTo(width / 2 + 70, 172);
  ctx.stroke();

  // Tiêu đề Editorial Serif
  ctx.fillStyle = '#382B31';
  ctx.font = 'italic 46px "Georgia", "Times New Roman", serif';
  ctx.fillText('Gửi người phụ nữ dịu dàng,', width / 2, 248);

  // Các dòng thư cách điệu tinh tế (ừa đủ rõ khi hé mở và sang trọng khi rút thiệp lên)
  ctx.textAlign = 'left';
  const leftMargin = 132;
  ctx.strokeStyle = 'rgba(56, 43, 49, 0.22)';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';

  const lineLengths = [540, 680, 610, 460];
  lineLengths.forEach((len, idx) => {
    const y = 330 + idx * 46;
    ctx.beginPath();
    ctx.moveTo(leftMargin, y);
    ctx.lineTo(leftMargin + len, y);
    ctx.stroke();
  });

  // Nhành lá sage nhỏ vẽ tay ở góc phải dưới của bức thư
  ctx.save();
  ctx.translate(width - 190, 520);
  ctx.strokeStyle = '#91A58B';
  ctx.fillStyle = 'rgba(145, 165, 139, 0.35)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, 40);
  ctx.quadraticCurveTo(22, 10, 56, -24);
  ctx.stroke();

  const drawMiniLeaf = (lx, ly, angle) => {
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(12, -10, 28, 0);
    ctx.quadraticCurveTo(12, 10, 0, 0);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
  drawMiniLeaf(14, 22, -0.9);
  drawMiniLeaf(30, 4, -0.2);
  drawMiniLeaf(42, -14, -0.75);
  ctx.restore();

  // Chữ ký nhỏ màu dusty burgundy
  ctx.textAlign = 'right';
  ctx.fillStyle = '#91435F';
  ctx.font = 'italic 30px "Georgia", "Times New Roman", serif';
  ctx.fillText('Với trọn vẹn yêu thương ♥', width - 136, 565);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/**
 * Tạo texture bóng đổ tiếp xúc (Contact / Ambient Occlusion Shadow)
 */
function createSoftShadowTexture() {
  const width = 256;
  const height = 128;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    8,
    width / 2,
    height / 2,
    width / 2
  );
  grad.addColorStop(0, 'rgba(72, 50, 56, 0.24)');
  grad.addColorStop(0.55, 'rgba(72, 50, 56, 0.10)');
  grad.addColorStop(1, 'rgba(72, 50, 56, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Tạo hình học bo góc mỏng cho tấm thiệp
 */
function createRoundedRectShape(w, h, r) {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/**
 * Tạo mesh một chiếc lá có độ uốn cong 3D tự nhiên
 */
function createCurvedLeafMesh(length, width, material, bend = 0.08) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 0.65, length * 0.28, width * 0.55, length * 0.78, 0, length);
  shape.bezierCurveTo(-width * 0.55, length * 0.78, -width * 0.65, length * 0.28, 0, 0);

  const geom = new THREE.ShapeGeometry(shape, 12);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    const t = py / length;
    // Độ võng dọc theo sống lá + khum nhẹ hai mép lá
    const archZ = Math.sin(t * Math.PI) * bend - Math.abs(px) * 0.09;
    pos.setZ(i, archZ);
  }
  geom.computeVertexNormals();

  const mesh = new THREE.Mesh(geom, material);
  return mesh;
}

/**
 * Kiểm tra khả năng hỗ trợ WebGL an toàn
 */
export function isWebGLAvailable() {
  if (typeof window === 'undefined') return false;
  let context;
  try {
    context = document.createElement('canvas').getContext('webgl2');
    return Boolean(context);
  } catch {
    return false;
  } finally {
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  }
}

/**
 * Khởi tạo toàn bộ Stage 3D cho Phong bì và tích hợp trực tiếp vào phần tử SVG/Container
 */
export function mountEnvelope3DScene(svgElement, { scrollDriven = false } = {}) {
  if (!svgElement || !isWebGLAvailable()) return null;

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Đảm bảo parent hoặc chính vùng chứa SVG hỗ trợ đặt lớp canvas đồng bộ
  const hostContainer = svgElement.parentElement || svgElement;
  const originalSvgOpacity = svgElement.style.opacity;
  const originalSvgTransition = svgElement.style.transition;
  const computedPos = window.getComputedStyle(hostContainer).position;
  const originalHostPosition = hostContainer.style.position;
  if (computedPos === 'static') {
    hostContainer.style.position = 'relative';
  }

  // Tạo wrapper canvas phủ khớp tuyệt đối với khung SVG
  const canvasWrapper = document.createElement('div');
  canvasWrapper.className = 'envelope-3d-stage';
  canvasWrapper.setAttribute('aria-hidden', 'true');
  Object.assign(canvasWrapper.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '2',
    overflow: 'visible',
  });

  hostContainer.appendChild(canvasWrapper);

  // Ẩn nhẹ phần đồ họa SVG bên dưới (nhưng giữ nguyên DOM node để mọi querySelector không lỗi)
  svgElement.style.opacity = '0';
  svgElement.style.transition = 'opacity 0.25s ease';

  // Khởi tạo Scene, Camera (Orthographic để chuẩn chất Editorial Illustration)
  const scene = new THREE.Scene();

  const aspect = 540 / 460;
  const frustumHeight = 5.0;
  const frustumWidth = frustumHeight * aspect;
  const camera = new THREE.OrthographicCamera(
    -frustumWidth / 2,
    frustumWidth / 2,
    frustumHeight / 2,
    -frustumHeight / 2,
    0.1,
    30
  );
  camera.position.set(0, 0.08, 10);
  camera.lookAt(0, 0.08, 0);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
  } catch {
    svgElement.style.opacity = originalSvgOpacity;
    svgElement.style.transition = originalSvgTransition;
    canvasWrapper.remove();
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const canvas = renderer.domElement;
  Object.assign(canvas.style, {
    width: '100%',
    height: '100%',
    display: 'block',
  });
  canvasWrapper.appendChild(canvas);

  // --- HỆ THỐNG ÁNH SÁNG STUDIO ẤM ÁP ---
  // Ambient ấm áp tông kem
  const ambientLight = new THREE.AmbientLight(0xfff8f0, 1.55);
  scene.add(ambientLight);

  // Key Light từ phía trên bên trái (khớp hướng bố cục Hero)
  const keyLight = new THREE.DirectionalLight(0xfff5e8, 1.35);
  keyLight.position.set(-3.8, 4.6, 5.2);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 15;
  const d = 3.4;
  keyLight.shadow.camera.left = -d;
  keyLight.shadow.camera.right = d;
  keyLight.shadow.camera.top = d;
  keyLight.shadow.camera.bottom = -d;
  keyLight.shadow.bias = -0.0015;
  keyLight.shadow.normalBias = 0.02;
  scene.add(keyLight);

  // Fill Light dịu từ bên phải để vùng tối của giấy vẫn ấm và trong trẻo
  const fillLight = new THREE.DirectionalLight(0xfbeee2, 0.55);
  fillLight.position.set(3.5, -1.8, 3.5);
  scene.add(fillLight);

  // Rim Light rất nhẹ tôn mép giấy gấp
  const rimLight = new THREE.DirectionalLight(0xfffaf2, 0.38);
  rimLight.position.set(0.5, 4.0, -2.5);
  scene.add(rimLight);

  // --- TEXTURES & MATERIALS ---
  const paperFiberTex = createPaperFiberTexture();
  const cardFrontTex = createLetterCardTexture();
  const shadowTex = createSoftShadowTexture();

  const makePaperMaterial = (colorHex, opts = {}) =>
    new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: opts.roughness ?? 0.88,
      metalness: opts.metalness ?? 0.02,
      bumpMap: paperFiberTex,
      bumpScale: opts.bumpScale ?? 0.012,
      side: opts.side ?? THREE.FrontSide,
      ...opts,
    });

  const matBackOuter = makePaperMaterial(PALETTE.envelopeBase, { roughness: 0.9 });
  const matInnerLining = makePaperMaterial(PALETTE.envelopeInner, { roughness: 0.92 });
  const matSideFlapLeft = makePaperMaterial(PALETTE.envelopeSide, { roughness: 0.87 });
  const matSideFlapRight = makePaperMaterial(0xeadac5, { roughness: 0.87 });
  const matBottomPocket = makePaperMaterial(PALETTE.envelopePocket, { roughness: 0.85 });
  const matTopFlapOuter = makePaperMaterial(PALETTE.envelopeBase, {
    roughness: 0.84,
    side: THREE.DoubleSide,
  });
  const matCardFront = new THREE.MeshStandardMaterial({
    map: cardFrontTex,
    roughness: 0.84,
    metalness: 0.03,
    bumpMap: paperFiberTex,
    bumpScale: 0.008,
  });
  const matCardSide = makePaperMaterial(PALETTE.cardPaper, { roughness: 0.86 });
  const matWaxSeal = new THREE.MeshStandardMaterial({
    color: PALETTE.burgundySeal,
    roughness: 0.42,
    metalness: 0.06,
    bumpMap: paperFiberTex,
    bumpScale: 0.016,
  });
  const matGoldDetail = new THREE.MeshStandardMaterial({
    color: PALETTE.champagneGold,
    roughness: 0.36,
    metalness: 0.35,
  });
  const matSilkThread = new THREE.MeshStandardMaterial({
    color: 0xa1516d,
    roughness: 0.6,
    metalness: 0.05,
  });
  const matSageLeaf = makePaperMaterial(PALETTE.sageLeaf, {
    roughness: 0.82,
    side: THREE.DoubleSide,
  });
  const matSageLeafAlt = makePaperMaterial(PALETTE.sageLeafDark, {
    roughness: 0.84,
    side: THREE.DoubleSide,
  });

  // --- DỰNG CẤU TRÚC HÌNH HỌC 3D ---
  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  // 1. Bóng đổ mềm phía dưới phong bì (khớp vị trí ellipse cx=280 cy=388)
  const shadowGeo = new THREE.PlaneGeometry(3.8, 0.72);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.85,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.position.set(0.08, -1.62, -0.5);
  rootGroup.add(contactShadow);

  // 2. Nhóm chính điều khiển nghiêng Hover / Idle của Phong bì
  const interactionGroup = new THREE.Group();
  rootGroup.add(interactionGroup);

  const envelopeAssembly = new THREE.Group();
  // Góc nghiêng -8 độ chuẩn từ thiết kế gốc + độ nghiêng 3D tinh tế
  envelopeAssembly.rotation.set(
    THREE.MathUtils.degToRad(5.5),
    THREE.MathUtils.degToRad(-6.5),
    THREE.MathUtils.degToRad(-8.0)
  );
  envelopeAssembly.position.set(-0.06, -0.18, 0);
  interactionGroup.add(envelopeAssembly);

  // Kích thước phong bì theo tỷ lệ 386 x 188 của SVG gốc
  const envW = 3.56;
  const envH = 1.76;
  const halfW = envW / 2;
  const halfH = envH / 2;

  // 2A. Mặt lưng phong bì (Back Panel + Inner Lining)
  const backShape = createRoundedRectShape(envW, envH, 0.05);
  const backGeo = new THREE.ExtrudeGeometry(backShape, {
    depth: 0.018,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 2,
  });
  const backMesh = new THREE.Mesh(backGeo, [matInnerLining, matBackOuter]);
  backMesh.position.set(0, 0, 0);
  backMesh.receiveShadow = true;
  envelopeAssembly.add(backMesh);

  // 2B. Tấm thiệp (Letter Card) — Đặt tại z = 0.055 (giữa lưng phong bì và hai cánh gấp bên)
  const cardW = 3.04;
  const cardH = 2.42;
  const cardShape = createRoundedRectShape(cardW, cardH, 0.07);
  const cardGeo = new THREE.ExtrudeGeometry(cardShape, {
    depth: 0.016,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
  });

  // Chuẩn hóa UV cho mặt trước của ExtrudeGeometry để map đúng texture tấm thiệp
  const uvAttr = cardGeo.attributes.uv;
  const posAttr = cardGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);
    uvAttr.setXY(i, (vx + cardW / 2) / cardW, (vy + cardH / 2) / cardH);
  }

  const letterCardGroup = new THREE.Group();
  const cardMesh = new THREE.Mesh(cardGeo, [matCardFront, matCardSide]);
  cardMesh.castShadow = true;
  cardMesh.receiveShadow = true;
  letterCardGroup.add(cardMesh);

  // Vị trí ban đầu: nằm gọn trong túi phong bì, nhô nhẹ phần đỉnh lên trên mép túi một cách hợp lý
  // (tuyệt đối không xuyên qua mặt trước vì nằm ở z = 0.055 < pocket z = 0.13)
  const initialCardY = 0.34;
  letterCardGroup.position.set(0, initialCardY, 0.055);
  envelopeAssembly.add(letterCardGroup);

  // 2C. Hai cánh giấy gấp bên trái & bên phải (Side Flaps) — z = 0.095 & 0.105
  const createSideFlap = (isRight) => {
    const dir = isRight ? 1 : -1;
    const flapShape = new THREE.Shape();
    flapShape.moveTo(dir * halfW, -halfH);
    flapShape.lineTo(dir * halfW, halfH);
    flapShape.lineTo(dir * 0.18, 0.04);
    flapShape.quadraticCurveTo(dir * 0.05, -0.04, dir * 0.16, -0.14);
    flapShape.closePath();

    const geo = new THREE.ExtrudeGeometry(flapShape, {
      depth: 0.01,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 2,
    });
    const mesh = new THREE.Mesh(geo, isRight ? matSideFlapRight : matSideFlapLeft);
    mesh.position.z = isRight ? 0.104 : 0.094;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  const leftFlapMesh = createSideFlap(false);
  const rightFlapMesh = createSideFlap(true);
  envelopeAssembly.add(leftFlapMesh, rightFlapMesh);

  // 2D. Túi giấy phía trước (Bottom Front Pocket) — z = 0.125
  const pocketShape = new THREE.Shape();
  pocketShape.moveTo(-halfW, -halfH);
  pocketShape.lineTo(halfW, -halfH);
  pocketShape.lineTo(0.22, 0.18);
  pocketShape.quadraticCurveTo(0, 0.30, -0.22, 0.18);
  pocketShape.closePath();

  const pocketGeo = new THREE.ExtrudeGeometry(pocketShape, {
    depth: 0.014,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 2,
  });
  const bottomPocketMesh = new THREE.Mesh(pocketGeo, matBottomPocket);
  bottomPocketMesh.position.z = 0.125;
  bottomPocketMesh.castShadow = true;
  bottomPocketMesh.receiveShadow = true;
  envelopeAssembly.add(bottomPocketMesh);

  // Đường chỉ vàng champagne rất mảnh dọc mép túi trước
  const pocketCreasePoints = [
    new THREE.Vector3(-halfW + 0.06, -halfH + 0.03, 0.144),
    new THREE.Vector3(0, 0.23, 0.144),
    new THREE.Vector3(halfW - 0.06, -halfH + 0.03, 0.144),
  ];
  const pocketCreaseGeo = new THREE.BufferGeometry().setFromPoints(pocketCreasePoints);
  const pocketCreaseLine = new THREE.Line(
    pocketCreaseGeo,
    new THREE.LineBasicMaterial({ color: 0xd8c3a8, transparent: true, opacity: 0.7 })
  );
  envelopeAssembly.add(pocketCreaseLine);

  // 2E. Nắp phong bì (Top Hinged Flap) — Bản lề thực tại y = +halfH, z = 0.142
  const topFlapPivot = new THREE.Group();
  topFlapPivot.position.set(0, halfH, 0.142);
  envelopeAssembly.add(topFlapPivot);

  // Vẽ hình nắp từ y = 0 (đường bản lề) hướng xuống y = -1.24 (mũi nắp)
  const flapTipY = -1.22;
  const topFlapShape = new THREE.Shape();
  topFlapShape.moveTo(-halfW, 0);
  topFlapShape.lineTo(halfW, 0);
  topFlapShape.lineTo(0.20, flapTipY + 0.14);
  topFlapShape.quadraticCurveTo(0, flapTipY, -0.20, flapTipY + 0.14);
  topFlapShape.closePath();

  const topFlapGeo = new THREE.ExtrudeGeometry(topFlapShape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
  });
  const topFlapMesh = new THREE.Mesh(topFlapGeo, matTopFlapOuter);
  topFlapMesh.castShadow = true;
  topFlapMesh.receiveShadow = true;
  topFlapPivot.add(topFlapMesh);

  // Trạng thái ban đầu của nắp: hé nhẹ 24 độ (0.42 rad) để thấy rõ lớp thiệp lấp ló bên dưới một cách tự nhiên
  const initialFlapAngle = -0.32;
  topFlapPivot.rotation.x = initialFlapAngle;

  // 2F. Dải ruy-băng lụa mảnh và Con dấu sáp (Wax Seal & Ribbon)
  const sealAndRibbonGroup = new THREE.Group();
  sealAndRibbonGroup.position.set(0, -0.18, 0.175);
  envelopeAssembly.add(sealAndRibbonGroup);

  // Dây lụa mảnh uốn lượn ngang thân phong bì
  const ribbonCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-halfW - 0.02, -0.18, -0.02),
    new THREE.Vector3(-0.85, -0.05, 0.01),
    new THREE.Vector3(0, 0.0, 0.02),
    new THREE.Vector3(0.92, 0.12, 0.01),
    new THREE.Vector3(halfW + 0.02, 0.24, -0.02),
  ]);
  const ribbonGeo = new THREE.TubeGeometry(ribbonCurve, 40, 0.014, 8, false);
  const ribbonMesh = new THREE.Mesh(ribbonGeo, matSilkThread);
  ribbonMesh.castShadow = true;
  sealAndRibbonGroup.add(ribbonMesh);

  // Con dấu sáp Dusty Burgundy với viền organic + bông hoa cúc dập nổi
  const waxSealGroup = new THREE.Group();
  sealAndRibbonGroup.add(waxSealGroup);

  const sealShape = new THREE.Shape();
  const sealRadius = 0.26;
  const lobes = 12;
  for (let i = 0; i <= 64; i++) {
    const theta = (i / 64) * Math.PI * 2;
    const r = sealRadius + Math.sin(theta * lobes) * 0.014 + Math.cos(theta * 5) * 0.008;
    const x = Math.cos(theta) * r;
    const y = Math.sin(theta) * r;
    if (i === 0) sealShape.moveTo(x, y);
    else sealShape.lineTo(x, y);
  }
  const sealGeo = new THREE.ExtrudeGeometry(sealShape, {
    depth: 0.036,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.014,
    bevelSegments: 3,
  });
  const sealDiscMesh = new THREE.Mesh(sealGeo, matWaxSeal);
  sealDiscMesh.castShadow = true;
  waxSealGroup.add(sealDiscMesh);

  // Vòng trũng dập nổi bên trong con dấu
  const innerRingGeo = new THREE.TorusGeometry(0.17, 0.01, 12, 32);
  const innerRingMesh = new THREE.Mesh(innerRingGeo, matWaxSeal);
  innerRingMesh.position.z = 0.044;
  waxSealGroup.add(innerRingMesh);

  // Hoa cúc nhỏ bằng vàng champagne ở tâm dấu sáp
  const daisyEmblem = new THREE.Group();
  daisyEmblem.position.z = 0.048;
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const petalGeo = new THREE.SphereGeometry(0.026, 8, 8);
    petalGeo.scale(0.8, 2.2, 0.35);
    const petalMesh = new THREE.Mesh(petalGeo, matGoldDetail);
    petalMesh.position.set(Math.cos(angle) * 0.075, Math.sin(angle) * 0.075, 0);
    petalMesh.rotation.z = angle - Math.PI / 2;
    daisyEmblem.add(petalMesh);
  }
  const centerGem = new THREE.Mesh(
    new THREE.SphereGeometry(0.036, 12, 12),
    matGoldDetail
  );
  centerGem.scale.set(1, 1, 0.45);
  daisyEmblem.add(centerGem);
  waxSealGroup.add(daisyEmblem);

  // 3. CÀNH LÁ BOTANICAL (Sage Botanical Branch — Góc trên bên phải phong bì)
  const botanicalGroup = new THREE.Group();
  // Đặt tựa tự nhiên vào góc phải trên của phong bì
  botanicalGroup.position.set(1.28, 0.58, -0.04);
  interactionGroup.add(botanicalGroup);

  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.22, -0.35, -0.02),
    new THREE.Vector3(0.02, 0.08, 0.02),
    new THREE.Vector3(0.32, 0.52, 0.05),
    new THREE.Vector3(0.66, 0.94, 0.02),
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 28, 0.013, 8, false);
  const stemMat = new THREE.MeshStandardMaterial({
    color: PALETTE.sageStem,
    roughness: 0.85,
  });
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  stemMesh.castShadow = true;
  botanicalGroup.add(stemMesh);

  // Bố trí 5 phiến lá với kích thước, độ vươn và hướng xoay có chủ đích nghệ thuật
  const leafConfigs = [
    { pos: [-0.02, -0.02, 0.02], rot: [0.18, -0.22, 0.65], len: 0.46, w: 0.22, alt: false },
    { pos: [0.12, 0.22, 0.04], rot: [-0.15, 0.25, -0.52], len: 0.52, w: 0.24, alt: true },
    { pos: [0.28, 0.46, 0.05], rot: [0.22, -0.18, 0.58], len: 0.48, w: 0.21, alt: false },
    { pos: [0.46, 0.68, 0.04], rot: [-0.12, 0.2, -0.48], len: 0.40, w: 0.18, alt: true },
    { pos: [0.64, 0.90, 0.02], rot: [0.1, 0.1, -0.32], len: 0.34, w: 0.15, alt: false },
  ];

  const leafMeshes = [];
  leafConfigs.forEach((cfg) => {
    const leafPivot = new THREE.Group();
    leafPivot.position.set(...cfg.pos);
    leafPivot.rotation.set(...cfg.rot);

    const leaf = createCurvedLeafMesh(
      cfg.len,
      cfg.w,
      cfg.alt ? matSageLeafAlt : matSageLeaf,
      0.06
    );
    leaf.castShadow = true;
    leafPivot.add(leaf);
    botanicalGroup.add(leafPivot);
    leafMeshes.push(leafPivot);
  });

  // 4. Cánh hoa bay tinh tế (Poetic Floating Petal — chỉ xuất hiện khi mở thư)
  const petalGroup = new THREE.Group();
  petalGroup.position.set(0.15, 0.55, 0.18);
  petalGroup.scale.setScalar(0.001);
  envelopeAssembly.add(petalGroup);

  const flyingPetalMesh = createCurvedLeafMesh(
    0.34,
    0.22,
    new THREE.MeshStandardMaterial({
      color: 0xd9899e,
      roughness: 0.78,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    }),
    0.09
  );
  petalGroup.add(flyingPetalMesh);

  // --- QUẢN LÝ RENDER ON-DEMAND & RESPONSIVE ---
  let isDisposed = false;
  let isInViewport = true;
  let activeHoverTween = null;

  const renderFrame = () => {
    if (isDisposed || !isInViewport) return;
    renderer.render(scene, camera);
  };

  const updateSize = () => {
    if (isDisposed) return;
    const rect = svgElement.getBoundingClientRect();
    const width = Math.max(1, rect.width || 540);
    const height = Math.max(1, rect.height || 460);
    renderer.setSize(width, height, false);

    const currentAspect = width / height;
    // Tự động điều chỉnh framing trên màn hình nhỏ để thiệp mở lên không bao giờ bị cắt
    const isCompact = window.innerWidth < 640;
    const dynamicFrustumH = isCompact ? 5.35 : 5.0;
    const dynamicFrustumW = dynamicFrustumH * currentAspect;

    camera.left = -dynamicFrustumW / 2;
    camera.right = dynamicFrustumW / 2;
    camera.top = dynamicFrustumH / 2;
    camera.bottom = -dynamicFrustumH / 2;
    camera.updateProjectionMatrix();
    renderFrame();
  };

  updateSize();

  const resizeObserver =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => updateSize())
      : null;
  if (resizeObserver) resizeObserver.observe(svgElement);
  window.addEventListener('resize', updateSize, { passive: true });

  // Tạm dừng khi ra ngoài Viewport để tối ưu hiệu năng
  let intersectionObserver = null;
  if (typeof IntersectionObserver !== 'undefined') {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInViewport = entry.isIntersecting;
          if (isInViewport) renderFrame();
        });
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(hostContainer);
  }

  // --- PHASE A: IDLE ANIMATION (Chuyển động nổi cực nhẹ & cành lá khẽ đung đưa) ---
  let idleTimeline = null;
  if (!reducedMotion && !scrollDriven) {
    idleTimeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: { ease: 'sine.inOut' },
      onUpdate: renderFrame,
    });

    idleTimeline
      .to(
        envelopeAssembly.position,
        {
          y: -0.11,
          duration: 3.4,
        },
        0
      )
      .to(
        contactShadow.scale,
        {
          x: 0.94,
          y: 0.92,
          duration: 3.4,
        },
        0
      )
      .to(
         shadowMat,
        {
          opacity: 0.72,
          duration: 3.4,
        },
        0
      )
      .to(
        botanicalGroup.rotation,
        {
          z: 0.032,
          x: 0.02,
          duration: 4.1,
        },
        0
      );
  }

  // --- PHASE B: INTERACTION FEEDBACK (Hover / Focus / Tap nghiêng 2–4 độ) ---
  const interactiveTrigger =
    svgElement.closest('button, a, [role="button"], .hero-illustration, .envelope-trigger') ||
    hostContainer;

  const onPointerMove = (e) => {
    if (scrollDriven || reducedMotion || isDisposed) return;
    const rect = hostContainer.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    // Giới hạn góc nghiêng đúng 2–4 độ (0.035 - 0.065 rad)
    const targetRotY = THREE.MathUtils.clamp(nx * 0.065, -0.07, 0.07);
    const targetRotX = THREE.MathUtils.clamp(-ny * 0.055, -0.06, 0.06);

    if (activeHoverTween) activeHoverTween.kill();
    activeHoverTween = gsap.to(interactionGroup.rotation, {
      x: targetRotX,
      y: targetRotY,
      duration: 0.55,
      ease: 'power2.out',
      onUpdate: renderFrame,
    });
  };

  const onPointerLeave = () => {
    if (scrollDriven || reducedMotion || isDisposed) return;
    if (activeHoverTween) activeHoverTween.kill();
    activeHoverTween = gsap.to(interactionGroup.rotation, {
      x: 0,
      y: 0,
      duration: 0.75,
      ease: 'power3.out',
      onUpdate: renderFrame,
    });
  };

  const onFocusIn = () => {
    if (scrollDriven || reducedMotion || isDisposed) return;
    gsap.to(interactionGroup.rotation, {
      x: -0.04,
      y: 0.05,
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: renderFrame,
    });
  };

  interactiveTrigger.addEventListener('pointermove', onPointerMove, { passive: true });
  interactiveTrigger.addEventListener('pointerleave', onPointerLeave, { passive: true });
  interactiveTrigger.addEventListener('focusin', onFocusIn);
  interactiveTrigger.addEventListener('focusout', onPointerLeave);

  // Vẽ frame đầu tiên ngay lập tức
  renderFrame();

  // --- PHASE C & D: LETTER REVEAL TIMELINE BUILDER ---
  const buildRevealTimeline = ({ onComplete } = {}) => {
    const tl = gsap.timeline({
      paused: true,
      onUpdate: renderFrame,
      onComplete: () => {
        renderFrame();
        if (typeof onComplete === 'function') onComplete();
      },
    });

    if (reducedMotion) {
      // Chuyển trạng thái mượt, ngắn gọn cho người dùng bật prefers-reduced-motion
      tl.to(
        sealAndRibbonGroup.position,
        { y: -0.4, duration: 0.2, ease: 'power2.out' },
        0
      )
        .to(
          [matWaxSeal, matSilkThread, matGoldDetail],
          { opacity: 0, transparent: true, duration: 0.2 },
          0
        )
        .to(
          topFlapPivot.rotation,
          { x: Math.PI * 0.88, duration: 0.35, ease: 'power2.inOut' },
          0.1
        )
        .to(
          letterCardGroup.position,
          { y: 0.96, z: 0.08, duration: 0.4, ease: 'power2.out' },
          0.25
        );
      return tl;
    }

    // 1. Anticipation (0.00s -> 0.22s): Phong bì lún nhẹ như vừa được chạm tay vào
    tl.to(
      envelopeAssembly.position,
      {
        y: -0.24,
        z: -0.06,
        duration: 0.22,
        ease: 'power2.inOut',
      },
      0
    )
      .to(
        envelopeAssembly.rotation,
        {
          x: THREE.MathUtils.degToRad(8.5),
          z: THREE.MathUtils.degToRad(-6.8),
          duration: 0.22,
          ease: 'power2.inOut',
        },
        0
      )
      // 2. Nút sáp & dây lụa bung nhẹ và tan biến tinh tế (0.08s -> 0.46s)
      .to(
        waxSealGroup.rotation,
        {
          z: 0.24,
          x: 0.35,
          duration: 0.36,
          ease: 'power2.in',
        },
        0.08
      )
      .to(
        sealAndRibbonGroup.position,
        {
          y: -0.48,
          z: 0.28,
          duration: 0.38,
          ease: 'power2.in',
        },
        0.08
      )
      .to(
        [matWaxSeal, matSilkThread, matGoldDetail],
        {
          opacity: 0,
          transparent: true,
          duration: 0.32,
          ease: 'power2.out',
        },
        0.16
      )
      .set(sealAndRibbonGroup, { visible: false }, 0.48)

      // 3. Action — Mở nắp phong bì theo đúng bản lề 3D (0.26s -> 1.12s)
      .to(
        topFlapPivot.rotation,
        {
          x: Math.PI * 0.92, // Gập nắp ra phía sau thiệp quanh bản lề trên
          duration: 0.86,
          ease: 'power3.inOut',
        },
        0.26
      )
      // Ngay khi nắp mở qua góc 90 độ (~0.68s), đẩy nhẹ Z của nắp về phía sau tấm thiệp để khi thiệp đi lên nằm hoàn toàn phía trước mặt trong của nắp
      .to(
        topFlapPivot.position,
        {
          z: 0.035,
          duration: 0.35,
          ease: 'power2.inOut',
        },
        0.58
      )

      // 4. Rút tấm thiệp từ trong túi phong bì lên cao (0.68s -> 1.82s)
      .to(
        letterCardGroup.position,
        {
          y: 1.08,
          x: 0.03,
          z: 0.082, // Luôn nhỏ hơn z của túi trước (0.125) nhưng lớn hơn nắp đã mở (0.035) -> tuyệt đối không xuyên lớp
          duration: 1.14,
          ease: 'power3.out',
        },
        0.68
      )
      .to(
        letterCardGroup.rotation,
        {
          z: THREE.MathUtils.degToRad(2.2),
          x: THREE.MathUtils.degToRad(-2.5),
          duration: 1.14,
          ease: 'power2.out',
        },
        0.68
      )
      // Thân phong bì hơi lùi nhẹ xuống để nhường tâm điểm cho lá thư
      .to(
        envelopeAssembly.position,
        {
          y: -0.34,
          duration: 1.1,
          ease: 'power2.out',
        },
        0.72
      )
      .to(
        contactShadow.scale,
        {
          x: 1.06,
          y: 1.08,
          duration: 1.1,
          ease: 'power2.out',
        },
        0.72
      )

      // 5. Cành lá phản hồi nhẹ theo luồng gió mở thư (0.55s -> 1.65s)
      .to(
        botanicalGroup.rotation,
        {
          z: -0.05,
          y: 0.06,
          duration: 0.95,
          ease: 'sine.out',
        },
        0.55
      )

      // 6. Cánh hoa nhỏ bay lên theo quỹ đạo cong dịu dàng (0.85s -> 2.15s)
      .to(
        flyingPetalMesh.material,
        {
          opacity: 0.9,
          duration: 0.35,
          ease: 'power1.out',
        },
        0.85
      )
      .to(
        petalGroup.scale,
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.45,
          ease: 'back.out(1.4)',
        },
        0.85
      )
      .to(
        petalGroup.position,
        {
          x: -0.62,
          y: 1.72,
          z: 0.32,
          duration: 1.25,
          ease: 'power2.out',
        },
        0.85
      )
      .to(
        petalGroup.rotation,
        {
          z: -0.75,
          y: 0.55,
          x: 0.35,
          duration: 1.25,
          ease: 'sine.inOut',
        },
        0.85
      )
      .to(
        flyingPetalMesh.material,
        {
          opacity: 0,
          duration: 0.42,
          ease: 'power2.in',
        },
        1.72
      )

      // 7. Follow-through & Settle (1.82s -> 2.35s): Thiệp và phong bì đằm lại có trọng lượng
      .to(
        letterCardGroup.position,
        {
          y: 0.98,
          x: 0.01,
          duration: 0.52,
          ease: 'sine.inOut',
        },
        1.82
      )
      .to(
        letterCardGroup.rotation,
        {
          z: THREE.MathUtils.degToRad(1.2),
          x: THREE.MathUtils.degToRad(-1.0),
          duration: 0.52,
          ease: 'sine.inOut',
        },
        1.82
      )
      .to(
        envelopeAssembly.rotation,
        {
          x: THREE.MathUtils.degToRad(6.2),
          z: THREE.MathUtils.degToRad(-7.5),
          duration: 0.52,
          ease: 'sine.inOut',
        },
        1.82
      );

    return tl;
  };

  // --- CLEANUP TOÀN DIỆN ---
  const dispose = ({ preserveFrame = false } = {}) => {
    if (isDisposed) return;

    let preservedFrame = false;
    if (preserveFrame) {
      try {
        renderFrame();
        const frame = document.createElement('canvas');
        frame.width = canvas.width;
        frame.height = canvas.height;
        frame.style.cssText = 'display:block;width:100%;height:100%';
        frame.setAttribute('aria-hidden', 'true');
        const frameContext = frame.getContext('2d');
        if (!frameContext) throw new Error('Không thể lưu khung hình phong thư.');
        frameContext.drawImage(canvas, 0, 0);
        canvasWrapper.replaceChildren(frame);
        preservedFrame = true;
      } catch {
        preservedFrame = false;
      }
    }

    isDisposed = true;

    if (idleTimeline) idleTimeline.kill();
    if (activeHoverTween) activeHoverTween.kill();
    if (resizeObserver) resizeObserver.disconnect();
    if (intersectionObserver) intersectionObserver.disconnect();

    window.removeEventListener('resize', updateSize);
    interactiveTrigger.removeEventListener('pointermove', onPointerMove);
    interactiveTrigger.removeEventListener('pointerleave', onPointerLeave);
    interactiveTrigger.removeEventListener('focusin', onFocusIn);
    interactiveTrigger.removeEventListener('focusout', onPointerLeave);

    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    paperFiberTex.dispose();
    cardFrontTex.dispose();
    shadowTex.dispose();
    renderer.dispose();
    renderer.forceContextLoss();

    if (!preservedFrame && canvasWrapper.parentNode) {
      canvasWrapper.parentNode.removeChild(canvasWrapper);
    }
    svgElement.style.opacity = preservedFrame ? '0' : originalSvgOpacity;
    svgElement.style.transition = originalSvgTransition;
    if (!preservedFrame && computedPos === 'static') hostContainer.style.position = originalHostPosition;
  };

  return {
    buildRevealTimeline,
    setScrollPose(progress, reduced) {
      interactionGroup.rotation.set(reduced ? 0 : Math.sin(progress * Math.PI) * 0.12,
        reduced ? 0 : -0.32 + progress * 0.64, 0);
    },
    renderFrame,
    dispose,
  };
}
