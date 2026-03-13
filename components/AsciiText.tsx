'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Component ported and enhanced from https://codepen.io/JuanFuentes/pen/eYEeoyE

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float mouse;
uniform float uEnableWaves;

void main() {
  vUv = uv;
  float time = uTime * 5.;
  
  float waveFactor = uEnableWaves;
  
  vec3 transformed = position;
  
  transformed.x += sin(time + position.y) * 0.5 * waveFactor;
  transformed.y += cos(time + position.z) * 0.15 * waveFactor;
  transformed.z += sin(time + position.x) * waveFactor;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float mouse;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
  float time = uTime;
  vec2 pos = vUv;
  
  float move = sin(time + mouse) * 0.01;
  float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;
  float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;
  float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;
  float a = texture2D(uTexture, pos).a;
  gl_FragColor = vec4(r, g, b, a);
}
`;

// TypeScript workaround for modifying the Math object
declare global {
  interface Math {
    map(n: number, start: number, stop: number, start2: number, stop2: number): number;
  }
}

Math.map = function (n: number, start: number, stop: number, start2: number, stop2: number) {
  return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
};

const PX_RATIO = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

class AsciiFilter {
  renderer: THREE.WebGLRenderer;
  domElement: HTMLDivElement;
  pre: HTMLPreElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  deg: number;
  invert: boolean;
  fontSize: number;
  fontFamily: string;
  charset: string;
  width: number = 0;
  height: number = 0;
  center: { x: number; y: number } = { x: 0, y: 0 };
  mouse: { x: number; y: number } = { x: 0, y: 0 };
  cols: number = 0;
  rows: number = 0;

  constructor(renderer: THREE.WebGLRenderer, { fontSize, fontFamily, charset, invert }: any = {}) {
    this.renderer = renderer;
    this.domElement = document.createElement('div');
    this.domElement.style.position = 'absolute';
    this.domElement.style.top = '0';
    this.domElement.style.left = '0';
    this.domElement.style.width = '100%';
    this.domElement.style.height = '100%';
    
    this.pre = document.createElement('pre');
    this.domElement.appendChild(this.pre);
    
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.domElement.appendChild(this.canvas);
    
    this.deg = 0;
    this.invert = invert ?? true;
    this.fontSize = fontSize ?? 12;
    this.fontFamily = fontFamily ?? "Courier New, monospace";
    this.charset = charset ?? " .';:!+*($W&@#";
    
    this.context.imageSmoothingEnabled = true;
    
    this.onMouseMove = this.onMouseMove.bind(this);
    document.addEventListener('mousemove', this.onMouseMove);
  }
  
  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.reset();
    
    this.center = { x: width / 2, y: height / 2 };
    this.mouse = { x: this.center.x, y: this.center.y };
  }
  
  onMouseMove(e: MouseEvent) {
    this.mouse = { x: (e.clientX * PX_RATIO), y: (e.clientY * PX_RATIO) };
  }
  
  reset() {
    this.context.font = `${this.fontSize}px ${this.fontFamily}`;
    const charWidth = this.context.measureText('A').width;
    
    this.cols = Math.floor(this.width / (this.fontSize * (charWidth / this.fontSize)));
    this.rows = Math.floor(this.height / this.fontSize);
    
    this.canvas.width = this.cols;
    this.canvas.height = this.rows;
    this.pre.style.fontFamily = this.fontFamily;
    this.pre.style.fontSize = `${this.fontSize}px`;
    this.pre.style.margin = '0';
    this.pre.style.padding = '0';
    this.pre.style.lineHeight = '1em';
    this.pre.style.position = 'absolute';
    this.pre.style.left = '0';
    this.pre.style.top = '0';
    this.pre.style.zIndex = '9';
    this.pre.style.color = '#ffffff';
    this.pre.style.backgroundAttachment = 'fixed';
    this.pre.style.mixBlendMode = 'normal';
    
    // Hide the internal 2D canvas from DOM view:
    this.canvas.style.display = 'none';
  }
  
  render(scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer.render(scene, camera);
    
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.context.clearRect(0, 0, w, h);
    this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
    
    this.asciiify(this.context, w, h);
    this.hue();
  }
  
  asciiify(ctx: CanvasRenderingContext2D, w: number, h: number) {
    if (ctx && w && h) {
      const imgData = ctx.getImageData(0, 0, w, h).data;
      let str = "";
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (x + y * w) * 4;
          const [r, g, b, a] = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];
          
          if (a === 0) {
            str += " ";
            continue;
          }
          
          const gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
          let idx = Math.floor((1 - gray) * (this.charset.length - 1));
          if (this.invert) idx = this.charset.length - idx - 1;
          str += this.charset[idx];
        }
        str += "\n";
      }
      this.pre.innerHTML = str;
    }
  }
  
  hue() {
    const deg = (Math.atan2(this.mouse.y - this.center.y, this.mouse.x - this.center.x) * 180) / Math.PI;
    this.deg += (deg - this.deg) * 0.075;
    this.pre.style.filter = `hue-rotate(${this.deg.toFixed(2)}deg)`;
  }
  
  dispose() {
    document.removeEventListener('mousemove', this.onMouseMove);
  }
}

class CanvasTxt {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  font: string;

  constructor(text: string, { fontSize = 200, fontFamily = 'Arial', color = 'white' }: any = {}) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.text = text;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.color = color;
    
    this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
    this.resize();
  }
  
  resize() {
    this.context.font = this.font;
    const metrics = this.context.measureText(this.text);
    this.canvas.width = Math.ceil(metrics.width) + 20;
    this.canvas.height = this.fontSize;
  }
  
  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.color;
    this.context.font = this.font;
    const metrics = this.context.measureText(this.text);
    const yPos = 10 + metrics.actualBoundingBoxAscent;
    this.context.fillText(this.text, 10, yPos);
  }
  
  get texture() { return this.canvas; }
  getWidth() { return this.canvas.width; }
  getHeight() { return this.canvas.height; }
}

class CanvAscii {
  textString: string;
  asciiFontSize: number;
  textFontSize: number;
  textColor: string;
  planeBaseHeight: number;
  container: HTMLElement;
  width: number;
  height: number;
  enableWaves: boolean;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  mouse: { x: number; y: number };
  renderer!: THREE.WebGLRenderer;
  filter!: AsciiFilter;
  textCanvas!: CanvasTxt;
  texture!: THREE.CanvasTexture;
  geometry!: THREE.PlaneGeometry;
  material!: THREE.ShaderMaterial;
  mesh!: THREE.Mesh;
  animationFrameId: number = 0;

  constructor({ text, asciiFontSize, textFontSize, textColor, planeBaseHeight, containerElem, width, height, enableWaves }: any) {
    this.textString = text;
    this.asciiFontSize = asciiFontSize;
    this.textFontSize = textFontSize;
    this.textColor = textColor;
    this.planeBaseHeight = planeBaseHeight;
    this.container = containerElem;
    this.width = width;
    this.height = height;
    this.enableWaves = enableWaves;
    
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.z = 30;
    this.scene = new THREE.Scene();
    this.mouse = { x: this.width / 2, y: this.height / 2 };
    this.onMouseMove = this.onMouseMove.bind(this);
    this.init();
  }
  
  async init() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(PX_RATIO);
    this.renderer.setSize(this.width, this.height);
    
    this.filter = new AsciiFilter(this.renderer, {
      fontFamily: '"Share Tech Mono", Courier New, monospace',
      fontSize: this.asciiFontSize,
      invert: true
    });
    this.container.appendChild(this.filter.domElement);
    
    // We already load Share Tech Mono in Next.js layout, so we don't strictly need document.fonts.load fallback here
    
    this.setMesh();
    this.animate();
  }
  
  setText(newText: string) {
    this.textString = newText;
    if (this.textCanvas) {
      this.textCanvas.text = newText;
      this.textCanvas.resize();
      this.textCanvas.render();
      if (this.texture) {
         this.texture.needsUpdate = true;
      }
      // Recreate geometry based on new text aspect ratio
      const textAspect = this.textCanvas.getWidth() / this.textCanvas.getHeight();
      const planeW = this.planeBaseHeight * textAspect;
      const planeH = this.planeBaseHeight;
      if (this.geometry) this.geometry.dispose();
      this.geometry = new THREE.PlaneGeometry(planeW, planeH, 36, 36);
      if (this.mesh) {
        this.mesh.geometry = this.geometry;
      }
    }
  }

  setMesh() {
    this.textCanvas = new CanvasTxt(this.textString, {
      fontSize: this.textFontSize,
      fontFamily: '"Share Tech Mono", Courier New, monospace',
      color: this.textColor
    });
    this.textCanvas.render();
    
    this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
    this.texture.minFilter = THREE.NearestFilter;
    
    const textAspect = this.textCanvas.getWidth() / this.textCanvas.getHeight();
    const planeW = this.planeBaseHeight * textAspect;
    const planeH = this.planeBaseHeight;
    
    this.geometry = new THREE.PlaneGeometry(planeW, planeH, 36, 36);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        mouse: { value: 1.0 },
        uTexture: { value: this.texture },
        uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 }
      }
    });
    
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }
  
  setSize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.filter.setSize(w, h);
  }
  
  onMouseMove(evt: any) {
    const e = evt.touches ? evt.touches[0] : evt;
    if (!this.container) return;
    const bounds = this.container.getBoundingClientRect();
    this.mouse = { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
  }
  
  animate() {
    const frame = () => {
      this.animationFrameId = requestAnimationFrame(frame);
      this.render();
    };
    frame();
  }
  
  render() {
    const time = new Date().getTime() * 0.001;
    if (this.texture) this.texture.needsUpdate = true;
    if (this.mesh) {
      (this.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = Math.sin(time);
      this.updateRotation();
    }
    this.filter.render(this.scene, this.camera);
  }
  
  updateRotation() {
    const x = Math.map(this.mouse.y, 0, this.height, 0.5, -0.5);
    const y = Math.map(this.mouse.x, 0, this.width, -0.5, 0.5);
    if(this.mesh) {
      this.mesh.rotation.x += (x - this.mesh.rotation.x) * 0.05;
      this.mesh.rotation.y += (y - this.mesh.rotation.y) * 0.05;
    }
  }
  
  dispose() {
    cancelAnimationFrame(this.animationFrameId);
    this.filter.dispose();
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
    if (this.texture) this.texture.dispose();
  }
}

export interface ASCIITextProps {
  text?: string;
  asciiFontSize?: number;
  textFontSize?: number;
  textColor?: string;
  planeBaseHeight?: number;
  enableWaves?: boolean;
}

export default function ASCIIText({
  text = 'hey!',
  asciiFontSize = 8,
  textFontSize = 200,
  textColor = '#ffffff',
  planeBaseHeight = 8,
  enableWaves = true
}: ASCIITextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<CanvAscii | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();
    
    instanceRef.current = new CanvAscii({
      text, 
      asciiFontSize, 
      textFontSize, 
      textColor, 
      planeBaseHeight,
      containerElem: container,
      width: width || window.innerWidth,
      height: height || window.innerHeight,
      enableWaves
    });
    
    const handleResize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      if (instanceRef.current) {
         instanceRef.current.setSize(width || window.innerWidth, height || window.innerHeight);
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (instanceRef.current) instanceRef.current.onMouseMove(e);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (instanceRef.current) instanceRef.current.dispose();
    };
  }, []); // Run essentially once on mount

  // React to text prop changes without remounting the entire ThreeJS scene
  useEffect(() => {
    if (instanceRef.current) {
       instanceRef.current.setText(text);
    }
  }, [text]);
  
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: 'transparent' }} />
  );
}
