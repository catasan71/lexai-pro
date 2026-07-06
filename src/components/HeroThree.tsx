/**
 * HeroThree — scenă 3D Three.js pentru hero-ul landing page (versiunea îmbunătățită).
 * Lazy-loaded (React.lazy) → Three.js într-un chunk separat, nu blochează First Paint.
 *
 * Scenă: torus knot + rețea de fire (icosaedre) + nor de particule tricolor +
 *        inel orbital + paralaxă mouse ușoară.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroThree() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ───────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5.5);

    // ── Lumini ────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x818cf8, 0.5));
    const ptL1 = new THREE.PointLight(0x818cf8, 70, 22);
    ptL1.position.set(5, 5, 4);
    scene.add(ptL1);
    const ptL2 = new THREE.PointLight(0x6ee7b7, 50, 20);
    ptL2.position.set(-5, -3, 2);
    scene.add(ptL2);
    const ptL3 = new THREE.PointLight(0xf59e0b, 30, 18);
    ptL3.position.set(2, -5, -2);
    scene.add(ptL3);

    // ── Torus Knot central ────────────────────────────────────────────
    const torusGeo = new THREE.TorusKnotGeometry(1.05, 0.32, 160, 20, 2, 3);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x3730a3,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.9,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    scene.add(torus);

    // Wireframe overlay subțire
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xc4b5fd, wireframe: true, transparent: true, opacity: 0.07 });
    const wireOverlay = new THREE.Mesh(torusGeo, wireMat);
    scene.add(wireOverlay);

    // Al doilea torus mic (orbital offset) — accent amber
    const torus2Geo = new THREE.TorusGeometry(2.2, 0.015, 8, 80);
    const torus2Mat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.35 });
    const torus2 = new THREE.Mesh(torus2Geo, torus2Mat);
    torus2.rotation.x = Math.PI / 2.5;
    scene.add(torus2);

    // Al treilea inel (teal) — inclinat diferit
    const ring3Geo = new THREE.TorusGeometry(3.1, 0.01, 8, 100);
    const ring3Mat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7, transparent: true, opacity: 0.2 });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 3;
    ring3.rotation.x = Math.PI / 4;
    scene.add(ring3);

    // ── Particule (3 seturi de culori) ────────────────────────────────
    const buildPts = (n: number, spread: number, color: number, size: number, opacity = 0.5) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(n * 3);
      for (let i = 0; i < n * 3; i++) pos[i] = (Math.random() - 0.5) * spread;
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ color, size, transparent: true, opacity, sizeAttenuation: true });
      return new THREE.Points(geo, mat);
    };

    const pts1 = buildPts(600, 22, 0x818cf8, 0.04);
    const pts2 = buildPts(300, 16, 0x6ee7b7, 0.055);
    const pts3 = buildPts(150, 18, 0xf59e0b, 0.045, 0.35);
    scene.add(pts1, pts2, pts3);

    // ── Icosaedre wireframe (rețea de conexiuni) ───────────────────────
    const icoA = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.9, 1),
      new THREE.MeshBasicMaterial({ color: 0x818cf8, wireframe: true, transparent: true, opacity: 0.055 }),
    );
    const icoB = new THREE.Mesh(
      new THREE.IcosahedronGeometry(3.9, 1),
      new THREE.MeshBasicMaterial({ color: 0x6ee7b7, wireframe: true, transparent: true, opacity: 0.035 }),
    );
    scene.add(icoA, icoB);

    // ── Mouse parallax ────────────────────────────────────────────────
    let mx = 0, my = 0;
    const onMouse = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop ────────────────────────────────────────────────
    let t = 0;
    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      t += 0.005;

      torus.rotation.x = t * 0.45;
      torus.rotation.y = t * 0.28;
      wireOverlay.rotation.copy(torus.rotation);

      torus2.rotation.z = t * 0.22;
      ring3.rotation.z  = -t * 0.15;

      icoA.rotation.y =  t * 0.11;
      icoA.rotation.x = -t * 0.07;
      icoB.rotation.y = -t * 0.07;
      icoB.rotation.z =  t * 0.05;

      pts1.rotation.y =  t * 0.035;
      pts2.rotation.y = -t * 0.05;
      pts3.rotation.x =  t * 0.025;

      camera.position.x += (mx * 0.55 - camera.position.x) * 0.03;
      camera.position.y += (my * 0.38 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      ptL1.intensity = 50 + Math.sin(t * 1.4) * 18;
      ptL2.intensity = 38 + Math.cos(t * 1.1) * 14;
      ptL3.intensity = 22 + Math.sin(t * 0.8) * 10;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
    />
  );
}
