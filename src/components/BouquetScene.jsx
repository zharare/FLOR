import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const pastel = [0xf3b9c7, 0xf7d1c3, 0xcbb9df, 0xf3e6a1, 0xbfdcc7];

function makePetal(color) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(-0.38, 0.22, -0.32, 0.9, 0, 1.25);
  shape.bezierCurveTo(0.32, 0.9, 0.38, 0.22, 0, 0);
  const geometry = new THREE.ShapeGeometry(shape, 18);
  geometry.translate(0, -0.42, 0);
  return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.72, side: THREE.DoubleSide }));
}

function makeLily(color, scale = 1) {
  const flower = new THREE.Group();
  for (let i = 0; i < 6; i += 1) {
    const petal = makePetal(color);
    petal.rotation.z = (i / 6) * Math.PI * 2;
    petal.rotation.x = 0.42;
    petal.scale.setScalar(scale);
    flower.add(petal);
  }
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.13 * scale, 18, 18),
    new THREE.MeshStandardMaterial({ color: 0xd59b43, roughness: 0.45, emissive: 0x3d1a04, emissiveIntensity: 0.08 }),
  );
  core.position.z = 0.12;
  flower.add(core);
  return flower;
}

function addLavender(root) {
  const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x637c66, roughness: 0.9 });
  const bloomMaterial = new THREE.MeshStandardMaterial({ color: 0x9b7eb8, roughness: 0.7 });
  for (let s = 0; s < 17; s += 1) {
    const angle = (s / 17) * Math.PI * 2;
    const radius = 1.4 + (s % 3) * 0.18;
    const height = 1.1 + (s % 4) * 0.16;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, height, 6), stemMaterial);
    stem.position.set(Math.cos(angle) * radius, -0.8 + height / 2, Math.sin(angle) * radius * 0.5);
    stem.rotation.z = -Math.cos(angle) * 0.34;
    root.add(stem);
    for (let b = 0; b < 6; b += 1) {
      const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 8), bloomMaterial);
      bloom.scale.set(0.7, 1.25, 0.7);
      bloom.position.set(Math.cos(angle) * (radius + b * 0.055), 0.06 + b * 0.13, Math.sin(angle) * radius * 0.5);
      root.add(bloom);
    }
  }
}

function makeTextSprite(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 180;
  const context = canvas.getContext('2d');
  context.font = 'italic 76px Georgia';
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 256, 92);
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(1.85, 0.65, 1);
  return sprite;
}

export default function BouquetScene({ active }) {
  const mount = useRef(null);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const host = mount.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(37, host.clientWidth / host.clientHeight, 0.1, 100);
    camera.position.set(0, 0.15, 8.8);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffe8e0, 0x4a5550, 2.4));
    const key = new THREE.DirectionalLight(0xfffbdf, 3.2); key.position.set(-3, 4, 5); scene.add(key);
    const bouquet = new THREE.Group(); bouquet.visible = false; scene.add(bouquet);
    const wrap = new THREE.Mesh(new THREE.ConeGeometry(1.75, 2.6, 5, 1, true), new THREE.MeshStandardMaterial({ color: 0xe9d6bc, roughness: 0.95, side: THREE.DoubleSide }));
    wrap.position.y = -1.85; wrap.rotation.x = Math.PI; bouquet.add(wrap);
    const flowers = [[0, 0.6, 0, 3, 1.08], [-1.05, 0.3, 0.1, 0, 0.94], [1.05, 0.28, 0.04, 1, 0.98], [-0.58, 1.24, -0.15, 2, 0.8], [0.62, 1.24, -0.1, 4, 0.8], [-1.42, 0.92, -0.4, 3, 0.66], [1.43, 0.93, -0.38, 1, 0.66]];
    flowers.forEach(([x, y, z, c, scale]) => { const lily = makeLily(pastel[c], scale); lily.position.set(x, y, z); lily.rotation.x = -0.35; bouquet.add(lily); });
    addLavender(bouquet);
    const nameGroup = new THREE.Group(); nameGroup.visible = false; scene.add(nameGroup);
    ['#f4c0d0', '#ead5a1', '#cdbbe1', '#b9d8c5'].forEach((color, index) => { const word = makeTextSprite('Valeria', color); word.userData = { angle: index * Math.PI / 2, radius: 3.1 + index % 2 * 0.25, speed: 0.17 + index * 0.025 }; nameGroup.add(word); });
    const particles = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xffead7, size: 0.055, transparent: true, opacity: 0 }));
    const positions = new Float32Array(520 * 3); const velocities = [];
    for (let i = 0; i < 520; i += 1) { const v = new THREE.Vector3().randomDirection().multiplyScalar(1.5 + Math.random() * 3); velocities.push(v); }
    particles.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); scene.add(particles);
    let started = false; let startAt = 0; let frame;
    const clock = new THREE.Clock();
    function resize() { camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(host.clientWidth, host.clientHeight); }
    window.addEventListener('resize', resize);
    function render() {
      const t = clock.getElapsedTime();
      if (activeRef.current && !started) { started = true; startAt = t; bouquet.visible = true; nameGroup.visible = true; particles.material.opacity = 0.95; }
      if (!activeRef.current && started) { started = false; bouquet.visible = false; nameGroup.visible = false; particles.material.opacity = 0; }
      if (started) {
        const elapsed = t - startAt;
        bouquet.rotation.y = elapsed * 0.26;
        bouquet.position.y = Math.sin(elapsed * 0.75) * 0.12;
        const expansion = Math.max(0, 1 - elapsed * 0.7);
        particles.material.opacity = expansion * 0.85;
        velocities.forEach((velocity, i) => { const p = particles.geometry.attributes.position; p.setXYZ(i, velocity.x * elapsed, velocity.y * elapsed + 0.2, velocity.z * elapsed); });
        particles.geometry.attributes.position.needsUpdate = true;
        nameGroup.children.forEach((word, index) => { const a = word.userData.angle + elapsed * word.userData.speed; word.position.set(Math.cos(a) * word.userData.radius, Math.sin(a * 1.6) * 1.6, Math.sin(a) * 0.8); word.material.opacity = 0.78 + Math.sin(elapsed * 1.5 + index) * 0.2; });
      }
      renderer.render(scene, camera); frame = requestAnimationFrame(render);
    }
    render();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); renderer.dispose(); host.removeChild(renderer.domElement); };
  }, []);
  return <div className="scene" ref={mount} aria-label={active ? 'Ramo de lirios para Valeria' : undefined} />;
}
