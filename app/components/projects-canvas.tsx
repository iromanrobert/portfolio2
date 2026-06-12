"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

/* ─── Effect library ──────────────────────────────────────────────────────── */

export type EffectName =
  | "wave-glitch"    // horizontal sine-wave distortion + RGB channel split
  | "noise-dissolve" // organic value-noise dissolve
  | "scanline"       // VHS scanline row-shift
  | "shockwave"      // circular ripple expanding from center
  | "burn"           // brightness-threshold burn with orange glow
  | "lens";          // barrel lens distortion

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGS: Record<EffectName, string> = {

  /* ── 1. Wave Glitch ────────────────────────────────────────────────────── */
  "wave-glitch": /* glsl */ `
    uniform sampler2D uTex1;
    uniform sampler2D uTex2;
    uniform float uProg;
    varying vec2 vUv;
    void main() {
      float peak  = sin(uProg * 3.14159265);
      float wave  = sin(vUv.y * 14.0) * 0.07 * peak;
      float split = peak * 0.022;
      vec2 uv1 = vec2(vUv.x + wave, vUv.y);
      vec2 uv2 = vec2(vUv.x - wave, vUv.y);
      vec4 c1 = vec4(
        texture2D(uTex1, vec2(uv1.x + split, uv1.y)).r,
        texture2D(uTex1, uv1).g,
        texture2D(uTex1, vec2(uv1.x - split, uv1.y)).b, 1.0);
      vec4 c2 = vec4(
        texture2D(uTex2, vec2(uv2.x - split, uv2.y)).r,
        texture2D(uTex2, uv2).g,
        texture2D(uTex2, vec2(uv2.x + split, uv2.y)).b, 1.0);
      gl_FragColor = mix(c1, c2, uProg);
    }
  `,

  /* ── 2. Noise Dissolve ─────────────────────────────────────────────────── */
  "noise-dissolve": /* glsl */ `
    uniform sampler2D uTex1;
    uniform sampler2D uTex2;
    uniform float uProg;
    varying vec2 vUv;
    float rand(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(rand(i), rand(i + vec2(1,0)), u.x),
                 mix(rand(i + vec2(0,1)), rand(i + vec2(1,1)), u.x), u.y);
    }
    void main() {
      float n = noise(vUv * 5.0);
      float edge = smoothstep(uProg - 0.18, uProg + 0.18, n);
      gl_FragColor = mix(texture2D(uTex1, vUv), texture2D(uTex2, vUv), edge);
    }
  `,

  /* ── 3. Scanline ───────────────────────────────────────────────────────── */
  "scanline": /* glsl */ `
    uniform sampler2D uTex1;
    uniform sampler2D uTex2;
    uniform float uProg;
    varying vec2 vUv;
    float rand(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      float peak = sin(uProg * 3.14159265);
      float row  = floor(vUv.y * 120.0);
      float r    = rand(vec2(row, floor(uProg * 30.0)));
      float disp = (r - 0.5) * 0.14 * peak;
      float rowT = rand(vec2(row, 1.0));
      float t    = smoothstep(uProg - 0.28, uProg + 0.28, rowT);
      vec4 c1 = texture2D(uTex1, vec2(vUv.x + disp,        vUv.y));
      vec4 c2 = texture2D(uTex2, vec2(vUv.x - disp * 0.5,  vUv.y));
      gl_FragColor = mix(c1, c2, t);
    }
  `,

  /* ── 4. Shockwave ──────────────────────────────────────────────────────── */
  "shockwave": /* glsl */ `
    uniform sampler2D uTex1;
    uniform sampler2D uTex2;
    uniform float uProg;
    varying vec2 vUv;
    void main() {
      vec2  dir    = vUv - vec2(0.5);
      float dist   = length(dir);
      float front  = smoothstep(uProg, uProg - 0.08, dist);
      float disp   = front * 0.07 * sin((dist - uProg) * 60.0);
      vec2  norm   = normalize(dir + 0.001);
      vec4 c1 = texture2D(uTex1, vUv + norm * disp);
      vec4 c2 = texture2D(uTex2, vUv - norm * disp * 0.5);
      float reveal = 1.0 - smoothstep(uProg - 0.04, uProg, dist);
      gl_FragColor = mix(c1, c2, reveal);
    }
  `,

  /* ── 5. Burn ───────────────────────────────────────────────────────────── */
  "burn": /* glsl */ `
    uniform sampler2D uTex1;
    uniform sampler2D uTex2;
    uniform float uProg;
    varying vec2 vUv;
    void main() {
      vec4  t1        = texture2D(uTex1, vUv);
      vec4  t2        = texture2D(uTex2, vUv);
      float luma      = dot(t1.rgb, vec3(0.299, 0.587, 0.114));
      float threshold = uProg * 1.3 - 0.15;
      float reveal    = smoothstep(threshold - 0.1, threshold + 0.1, luma);
      float glow      = smoothstep(0.18, 0.0, abs(luma - threshold))
                        * sin(uProg * 3.14159265);
      vec4 result = mix(t1, t2, reveal);
      result.rgb += vec3(1.0, 0.35, 0.0) * glow * 1.8;
      gl_FragColor = result;
    }
  `,

  /* ── 6. Lens ───────────────────────────────────────────────────────────── */
  "lens": /* glsl */ `
    uniform sampler2D uTex1;
    uniform sampler2D uTex2;
    uniform float uProg;
    varying vec2 vUv;
    void main() {
      vec2  uv   = vUv - 0.5;
      float dist = length(uv);
      float peak = sin(uProg * 3.14159265);
      float k    = 1.0 + dist * dist * 2.8 * peak;
      vec2 uv1   = clamp(uv / k + 0.5, 0.0, 1.0);
      vec2 uv2   = clamp(uv * k + 0.5, 0.0, 1.0);
      gl_FragColor = mix(texture2D(uTex1, uv1), texture2D(uTex2, uv2), uProg);
    }
  `,
};

/* ─── Component ───────────────────────────────────────────────────────────── */

interface State {
  material: THREE.ShaderMaterial | null;
  texCache: Map<string, THREE.Texture>;
  prevActive: number;
  targetProg: number;
  animId: number;
  visible: boolean;
  kick: () => void;
}

export default function ProjectsCanvas({
  images,
  active,
  effect = "wave-glitch",
}: {
  images: string[];
  active: number;
  effect?: EffectName;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const effectRef    = useRef(effect); // capture at mount; change in code to switch
  const state        = useRef<State>({
    material: null,
    texCache: new Map(),
    prevActive: 0,
    targetProg: 0,
    animId: 0,
    visible: false,
    kick: () => {},
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const s = state.current;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // OrthographicCamera(-1,1,1,-1) maps exactly to PlaneGeometry(2,2)
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const scene = new THREE.Scene();

    const black = new THREE.DataTexture(new Uint8Array([0,0,0,255]), 1, 1, THREE.RGBAFormat);
    black.needsUpdate = true;

    const material = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAGS[effectRef.current],
      uniforms: {
        uTex1: { value: black },
        uTex2: { value: black },
        uProg: { value: 0 },
      },
    });
    s.material = material;
    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    const loader = new THREE.TextureLoader();
    images.forEach((url, i) => {
      loader.load(url, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        s.texCache.set(url, t);
        if (i === 0) {
          material.uniforms.uTex1.value = t;
          material.uniforms.uTex2.value = t;
          // loop is idle by now — paint the first frame once it arrives
          if (s.visible) renderer.render(scene, camera);
        }
      });
    });

    // Render-on-demand: the loop only runs while a transition is in flight
    // (and the canvas is on screen). Once uProg settles it stops scheduling
    // frames, so an idle/offscreen canvas costs nothing on the main thread.
    const tick = () => {
      const cur  = material.uniforms.uProg.value as number;
      const next = THREE.MathUtils.lerp(cur, s.targetProg, 0.07);
      material.uniforms.uProg.value = next;
      if (next > 0.998 && s.targetProg === 1) {
        material.uniforms.uTex1.value = material.uniforms.uTex2.value;
        material.uniforms.uProg.value = 0;
        s.targetProg = 0;
      }
      renderer.render(scene, camera);

      // keep going only while still animating toward a target
      const settled = s.targetProg === 0 && material.uniforms.uProg.value < 0.001;
      s.animId = settled ? 0 : requestAnimationFrame(tick);
    };

    // start the loop if it isn't already running and we're visible
    s.kick = () => {
      if (!s.animId && s.visible) s.animId = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(() => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.render(scene, camera); // repaint the static frame on resize
    });
    ro.observe(container);

    // pause entirely when scrolled out of view; resume + repaint on re-entry
    const io = new IntersectionObserver(
      ([entry]) => {
        s.visible = entry.isIntersecting;
        if (s.visible) {
          renderer.render(scene, camera);
          s.kick();
        } else if (s.animId) {
          cancelAnimationFrame(s.animId);
          s.animId = 0;
        }
      },
      { threshold: 0 },
    );
    io.observe(container);

    return () => {
      cancelAnimationFrame(s.animId);
      s.animId = 0;
      ro.disconnect();
      io.disconnect();
      // free GPU resources before tearing down the context
      s.texCache.forEach((t) => t.dispose());
      s.texCache.clear();
      black.dispose();
      geometry.dispose();
      material.dispose();
      s.material = null;
      renderer.dispose();
      // dispose() alone leaks the WebGL context under HMR/StrictMode remounts —
      // force the context loss so the browser reclaims it immediately.
      renderer.forceContextLoss();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const s = state.current;
    if (!s.material || active === s.prevActive) return;
    const from = s.texCache.get(images[s.prevActive]) ?? s.material.uniforms.uTex1.value;
    const to   = s.texCache.get(images[active]);
    s.material.uniforms.uTex1.value = from;
    if (to) s.material.uniforms.uTex2.value = to;
    s.material.uniforms.uProg.value = 0;
    s.targetProg = 1;
    s.prevActive = active;
    s.kick(); // restart the render loop for this transition
  }, [active, images]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
