"use client";

import { useMemo, useRef, type CSSProperties } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uRes;

  vec2 hash(vec2 p){
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(dot(hash(i + vec2(0,0)), f - vec2(0,0)),
                   dot(hash(i + vec2(1,0)), f - vec2(1,0)), u.x),
               mix(dot(hash(i + vec2(0,1)), f - vec2(0,1)),
                   dot(hash(i + vec2(1,1)), f - vec2(1,1)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 6; i++){ v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main(){
    vec2 uv = gl_FragCoord.xy / uRes.xy;
    vec2 p = (gl_FragCoord.xy * 2.0 - uRes.xy) / min(uRes.x, uRes.y);
    float t = uTime * 0.07;

    // анимированный domain-warp с пульсацией
    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p + 1.8 * q + vec2(1.7, 9.2) + 0.18 * sin(t * 1.3)),
                  fbm(p + 1.8 * q + vec2(8.3, 2.8) - t));
    float f = fbm(p + 3.0 * r);

    // курсор: свечение + расходящаяся рябь
    float d = distance(uv, uMouse);
    float glow = smoothstep(0.5, 0.0, d) * 0.7;
    float ripple = (sin(d * 28.0 - uTime * 3.0) * 0.5 + 0.5) * smoothstep(0.4, 0.0, d) * 0.18;

    vec3 base   = vec3(0.012, 0.012, 0.024);
    vec3 lime   = vec3(0.78, 1.0, 0.23);
    vec3 violet = vec3(0.45, 0.32, 1.0);
    vec3 cyan   = vec3(0.18, 0.85, 0.95);

    // цвет переливается во времени и пространстве
    float mixA = 0.5 + 0.5 * sin(t * 0.8 + f * 3.0);
    vec3 hue = mix(violet, cyan, mixA);

    vec3 col = base;
    col += hue * pow(f * 0.5 + 0.5, 3.0) * 0.30;
    col += lime * pow(clamp(f, 0.0, 1.0), 2.2) * 0.12;
    col += lime * (glow + ripple) * 0.5;

    // движущиеся неоновые полосы
    float streak = smoothstep(0.0, 0.09, abs(sin(p.x * 1.5 + t * 2.0 + f * 4.0)));
    col += lime * (1.0 - streak) * 0.03;

    col *= 1.0 - 0.52 * length(p * 0.5);

    float grain = hash(uv * (uTime + 1.0)).x * 0.025;
    col += grain;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Plane() {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uRes.value.set(size.width, size.height);
    uniforms.uMouse.value.lerp(
      new THREE.Vector2(state.pointer.x * 0.5 + 0.5, state.pointer.y * 0.5 + 0.5),
      0.04
    );
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={ref}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

function Particles() {
  const colors = ["#c6ff3a", "#7cc6ff", "#b98cff", "#ffffff"];

  const dust = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 4,
        dur: 6 + Math.random() * 9,
        delay: -Math.random() * 10,
        dy: -(10 + Math.random() * 24),
        min: 0.06 + Math.random() * 0.1,
        max: 0.28 + Math.random() * 0.4,
        color: colors[i % colors.length],
      })),
    []
  );

  const orbs = useMemo(
    () =>
      Array.from({ length: 3 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 220 + Math.random() * 200,
        dur: 18 + Math.random() * 14,
        delay: -Math.random() * 10,
        ox: (Math.random() - 0.5) * 120,
        oy: (Math.random() - 0.5) * 100,
        color: colors[Math.floor(Math.random() * 3)],
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {orbs.map((o, i) => (
        <div
          key={`o-${i}`}
          className="absolute rounded-full blur-[90px]"
          style={
            {
              left: `${o.left}%`,
              top: `${o.top}%`,
              width: o.size,
              height: o.size,
              background: o.color,
              opacity: 0.12,
              "--o-x": `${o.ox}px`,
              "--o-y": `${o.oy}px`,
              animation: `hp-orb ${o.dur}s ease-in-out ${o.delay}s infinite`,
            } as CSSProperties
          }
        />
      ))}
      {dust.map((p, i) => (
        <div
          key={`p-${i}`}
          className="absolute rounded-full"
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              "--p-dy": `${p.dy}px`,
              "--p-min": p.min,
              "--p-max": p.max,
              animation: `hp-particle ${p.dur}s ease-in-out ${p.delay}s infinite`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function ShaderBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 1] }}
      >
        <Plane />
      </Canvas>
      {/* затемняющий слой — гарантирует читаемость текста поверх фона */}
      <div className="absolute inset-0 bg-black/35" />
      {/* живой слой: дрейфующие частицы и мягкие орбы */}
      <Particles />
    </div>
  );
}
