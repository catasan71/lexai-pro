/**
 * HeroThree — scenă 3D Three.js pentru hero-ul landing page.
 * Lazy-loaded (React.lazy) → Three.js e într-un chunk separat, nu blochează First Paint.
 *
 * Scenă: rețea de puncte 3D rotativă + torus knot central incandescent + paralaxă mouse.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroThree() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // --- Scene + Camera ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // --- Lumini ---
    scene.add(new THREE.AmbientLight(0x818cf8, 0.4));
    const ptL1 = new THREE.PointLight(0x818cf8, 60, 20);
    ptL1.position.set(4, 4, 4);
    scene.add(ptL1);
    const ptL2 = new THREE.PointLight(0x6ee7b7, 40, 20);
    ptL2.position.set(-4, -2, 2);
    scene.add(ptL2);

    // --- Torus Knot central ---
    const torusGeo = new THREE.TorusKnotGeometry(1, 0.3, 128, 16, 2, 3);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x3730a3,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.8,
      wireframe: false,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    scene.add(torus);

    // Wireframe overlay pe torus
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x818cf8, wireframe: true, transparent: true, opacity: 0.08 });
    const wireOverlay = new THREE.Mesh(torusGeo, wireMat);
    scene.add(wireOverlay);

    // --- Nori de particule ---
    const buildParticles = (count: number, spread: number, color: number, size: number) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * spread;
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.5, sizeAttenuation: true });
      return new THREE.Points(geo, mat);
    };

    const stars1 = buildParticles(500, 20, 0x818cf8, 0.04);
    const stars2 = buildParticles(200, 14, 0x6ee7b7, 0.06);
    scene.add(stars1);
    scene.add(stars2);

    // --- Linii de conexiuni (icosaedru wireframe distant) ---
    const icoGeo = new THREE.IcosahedronGeometry(2.8, 1);
    const icoMat = new THREE.MeshBasicMaterial({ color: 0x818cf8, wireframe: true, transparent: true, opacity: 0.06 });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    const icoGeo2 = new THREE.IcosahedronGeometry(3.8, 1);
    const icoMat2 = new THREE.MeshBasicMaterial({ color: 0x6ee7b7, wireframe: true, transparent: true, opacity: 0.04 });
    const ico2 = new THREE.Mesh(icoGeo2, icoMat2);
    scene.add(ico2);

    // --- Mouse parallax ---
    let mouseX = 0, mouseY = 0;
    const onMouse = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    // --- Resize ---
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // --- Animation loop ---
    let frame = 0;
    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      frame += 0.005;

      // Torus lent
      torus.rotation.x = frame * 0.5;
      torus.rotation.y = frame * 0.3;
      wireOverlay.rotation.copy(torus.rotation);

      // Icosaedre counter-rotate
      ico.rotation.y  =  frame * 0.12;
      ico.rotation.x  = -frame * 0.07;
      ico2.rotation.y = -frame * 0.08;
      ico2.rotation.z =  frame * 0.05;

      // Particule rotesc ușor
      stars1.rotation.y = frame * 0.04;
      stars2.rotation.y = -frame * 0.06;

      // Cameră urmărește mouse (paralaxă ușoară)
      camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.03;
      camera.position.y += (mouseY * 0.4 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      // Pulsație lumini
      ptL1.intensity = 40 + Math.sin(frame * 1.5) * 15;
      ptL2.intensity = 30 + Math.cos(frame * 1.2) * 12;

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
