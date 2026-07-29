/* ============================================================
   THREE-BG.JS — Three.js Animated Background Scene
   Portfolio | AI Engineer & Full Stack Developer
   Lightweight: floating particles + neural network connections
   ============================================================ */

class ThreeBackground {
  constructor() {
    this.scene    = null;
    this.camera   = null;
    this.renderer = null;
    this.canvas   = null;
    this.nodes    = [];
    this.lines    = [];
    this.mouse    = { x: 0, y: 0 };
    this.clock    = null;
    this.rafId    = null;
    this.paused   = false;

    this.config = {
      nodeCount:   55,
      nodeSize:    0.045,
      connectDist: 3.2,
      fieldDepth:  8,
      fieldWidth:  18,
      fieldHeight: 12,
      rotateSpeed: 0.00012,
      mouseInfluence: 0.3,
    };

    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded — ThreeBackground skipped.');
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.init();
  }

  /* ── Init ──────────────────────────────────────────────── */
  init() {
    this.canvas = document.getElementById('bg-canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'bg-canvas';
      this.canvas.setAttribute('aria-hidden', 'true');
      document.body.insertAdjacentElement('afterbegin', this.canvas);
    }

    this.clock = new THREE.Clock();
    this.buildScene();
    this.buildCamera();
    this.buildRenderer();
    this.buildNodes();
    this.buildConnections();
    this.bindEvents();
    this.loop();
  }

  /* ── Scene ─────────────────────────────────────────────── */
  buildScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050816, 0.04);
  }

  /* ── Camera ────────────────────────────────────────────── */
  buildCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 10);
  }

  /* ── Renderer ──────────────────────────────────────────── */
  buildRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas:     this.canvas,
      alpha:      true,
      antialias:  true,
      powerPreference: 'low-power',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setClearColor(0x000000, 0);
  }

  /* ── Create Neural Nodes ───────────────────────────────── */
  buildNodes() {
    const { nodeCount, nodeSize, fieldWidth, fieldHeight, fieldDepth } = this.config;

    // Color palette matching CSS design tokens
    const palette = [0x2563EB, 0x7C3AED, 0x06B6D4, 0x3B82F6, 0x8B5CF6];

    const geo = new THREE.SphereGeometry(nodeSize, 8, 8);

    for (let i = 0; i < nodeCount; i++) {
      const color = palette[Math.floor(Math.random() * palette.length)];
      const mat   = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.55 + Math.random() * 0.45,
      });

      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.set(
        (Math.random() - 0.5) * fieldWidth,
        (Math.random() - 0.5) * fieldHeight,
        (Math.random() - 0.5) * fieldDepth
      );

      // Store drift velocity on mesh
      mesh.userData = {
        vx:    (Math.random() - 0.5) * 0.004,
        vy:    (Math.random() - 0.5) * 0.004,
        vz:    (Math.random() - 0.5) * 0.002,
        phase: Math.random() * Math.PI * 2,
        baseOpacity: mat.opacity,
      };

      this.scene.add(mesh);
      this.nodes.push(mesh);
    }
  }

  /* ── Build Connection Lines ────────────────────────────── */
  buildConnections() {
    // Remove old lines
    this.lines.forEach(l => this.scene.remove(l));
    this.lines = [];

    const { nodes, config } = this;

    const mat = new THREE.LineBasicMaterial({
      color: 0x2563EB,
      transparent: true,
      opacity: 0.08,
      vertexColors: true,
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = nodes[i].position.distanceTo(nodes[j].position);

        if (dist < config.connectDist) {
          const opacity = (1 - dist / config.connectDist) * 0.14;
          const geo  = new THREE.BufferGeometry().setFromPoints([
            nodes[i].position,
            nodes[j].position
          ]);

          const lineMat = new THREE.LineBasicMaterial({
            color: 0x4F86F7,
            transparent: true,
            opacity,
          });

          const line = new THREE.Line(geo, lineMat);
          this.scene.add(line);
          this.lines.push({ line, nodeA: nodes[i], nodeB: nodes[j] });
        }
      }
    }
  }

  /* ── Events ────────────────────────────────────────────── */
  bindEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      this.mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    document.addEventListener('visibilitychange', () => {
      this.paused = document.hidden;
      if (!this.paused) this.loop();
    });
  }

  /* ── Update Nodes ──────────────────────────────────────── */
  updateNodes(elapsed) {
    const { fieldWidth, fieldHeight, fieldDepth, mouseInfluence } = this.config;
    const hw = fieldWidth  / 2;
    const hh = fieldHeight / 2;
    const hd = fieldDepth  / 2;

    this.nodes.forEach(node => {
      const d = node.userData;

      // Gentle float
      node.position.x += d.vx + Math.sin(elapsed * 0.3 + d.phase) * 0.0008;
      node.position.y += d.vy + Math.cos(elapsed * 0.25 + d.phase) * 0.0008;
      node.position.z += d.vz;

      // Mouse subtle parallax
      node.position.x += this.mouse.x * mouseInfluence * 0.0004;
      node.position.y -= this.mouse.y * mouseInfluence * 0.0004;

      // Boundary bounce
      if (Math.abs(node.position.x) > hw) d.vx *= -1;
      if (Math.abs(node.position.y) > hh) d.vy *= -1;
      if (Math.abs(node.position.z) > hd) d.vz *= -1;

      // Opacity pulse
      node.material.opacity = d.baseOpacity * (0.7 + Math.sin(elapsed + d.phase) * 0.3);
    });
  }

  /* ── Update Connection Lines ───────────────────────────── */
  updateConnections() {
    // Rebuild connections every 60 frames (avoid O(n²) every frame)
    this._frameCount = (this._frameCount || 0) + 1;
    if (this._frameCount % 60 !== 0) {
      // Just update existing line geometry positions
      this.lines.forEach(({ line, nodeA, nodeB }) => {
        const positions = line.geometry.attributes.position;
        if (!positions) return;
        positions.setXYZ(0, nodeA.position.x, nodeA.position.y, nodeA.position.z);
        positions.setXYZ(1, nodeB.position.x, nodeB.position.y, nodeB.position.z);
        positions.needsUpdate = true;
      });
    } else {
      this.buildConnections();
    }
  }

  /* ── Main Loop ─────────────────────────────────────────── */
  loop() {
    if (this.paused) return;
    const elapsed = this.clock.getElapsedTime();

    // Slow camera drift
    this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * 0.002;
    this.camera.position.y += (-this.mouse.y * 0.3 - this.camera.position.y) * 0.002;
    this.camera.lookAt(this.scene.position);

    this.updateNodes(elapsed);
    this.updateConnections();
    this.renderer.render(this.scene, this.camera);

    this.rafId = requestAnimationFrame(() => this.loop());
  }

  /* ── Destroy ───────────────────────────────────────────── */
  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.renderer?.dispose();
    this.canvas?.remove();
  }
}

/* ── Init after DOM + Three.js ready ─────────────────────── */
window.addEventListener('load', () => {
  window.threeBackground = new ThreeBackground();
});
