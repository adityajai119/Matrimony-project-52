import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Input, HostListener } from '@angular/core';
import * as THREE from 'three';

@Component({
    selector: 'app-exercise-model-viewer',
    template: `
    <div class="canvas-container" #canvasContainer>
      <!-- The 3D scene renders here -->
    </div>
  `,
    styles: [`
    .canvas-container {
      width: 100%;
      height: 350px;
      border-radius: 16px;
      overflow: hidden;
      background: linear-gradient(145deg, #0a0a1a 0%, #12122a 100%);
      border: 1px solid rgba(99, 102, 241, 0.3);
      box-shadow: 0 0 30px rgba(99, 102, 241, 0.2);
    }
  `]
})
export class ExerciseModelViewerComponent implements AfterViewInit, OnDestroy {
    @ViewChild('canvasContainer') private canvasContainerRef!: ElementRef;

    @Input() exerciseType: string = 'generic';

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private dumbbellGroup!: THREE.Group;
    private animationId: number = 0;
    private clock = new THREE.Clock();

    ngAfterViewInit(): void {
        this.createScene();
        this.startRendering();
    }

    ngOnDestroy(): void {
        this.stopRendering();
    }

    private createScene(): void {
        const container = this.canvasContainerRef.nativeElement;

        // Scene Setup
        this.scene = new THREE.Scene();

        // Camera Setup
        this.camera = new THREE.PerspectiveCamera(
            50,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;
        this.camera.position.y = 0.5;

        // Renderer Setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        container.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404060, 1);
        this.scene.add(ambientLight);

        // Key Light (Indigo)
        const keyLight = new THREE.PointLight(0x6366f1, 2, 50);
        keyLight.position.set(3, 3, 5);
        this.scene.add(keyLight);

        // Fill Light (Violet)
        const fillLight = new THREE.PointLight(0x8b5cf6, 1.5, 40);
        fillLight.position.set(-3, -1, 4);
        this.scene.add(fillLight);

        // Rim Light (Green accent)
        const rimLight = new THREE.PointLight(0x22c55e, 1, 30);
        rimLight.position.set(0, -3, -3);
        this.scene.add(rimLight);

        // Create Sci-Fi Dumbbell
        this.createSciFiDumbbell();

        // Add floating particles
        this.createFloatingParticles();

        window.addEventListener('resize', this.onResize.bind(this));
    }

    private createSciFiDumbbell(): void {
        this.dumbbellGroup = new THREE.Group();

        // === HANDLE (Carbon Fiber Core) ===
        const handleGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 32);
        const handleMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.8,
            metalness: 0.3
        });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.rotation.z = Math.PI / 2;
        this.dumbbellGroup.add(handle);

        // === GRIP SECTIONS (Glowing Neon) ===
        const gripPositions = [-0.4, 0, 0.4];
        gripPositions.forEach(pos => {
            const gripGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16);
            const gripMat = new THREE.MeshBasicMaterial({
                color: 0x6366f1,
                transparent: true,
                opacity: 0.9
            });
            const grip = new THREE.Mesh(gripGeo, gripMat);
            grip.rotation.z = Math.PI / 2;
            grip.position.x = pos;
            this.dumbbellGroup.add(grip);
        });

        // === ENERGY WEIGHTS (Floating Rings) ===
        const weightPositions = [-0.9, 0.9];
        weightPositions.forEach((pos, index) => {
            const weightGroup = new THREE.Group();
            weightGroup.position.x = pos;

            // Central Disc (Glowing Core)
            const discGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 32);
            const discMat = new THREE.MeshPhysicalMaterial({
                color: 0x8b5cf6,
                emissive: 0x4c1d95,
                emissiveIntensity: 0.5,
                roughness: 0.2,
                metalness: 0.8
            });
            const disc = new THREE.Mesh(discGeo, discMat);
            disc.rotation.z = Math.PI / 2;
            weightGroup.add(disc);

            // Floating Energy Rings
            for (let i = 0; i < 3; i++) {
                const ringGeo = new THREE.TorusGeometry(0.45 + i * 0.12, 0.015, 16, 50);
                const ringMat = new THREE.MeshBasicMaterial({
                    color: i === 1 ? 0x22c55e : 0x6366f1,
                    transparent: true,
                    opacity: 0.7 - i * 0.15
                });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.rotation.y = Math.PI / 2;
                ring.position.x = 0.05 * (index === 0 ? -1 : 1);
                ring.userData = { rotationSpeed: 0.5 + i * 0.3, index: i };
                weightGroup.add(ring);
            }

            this.dumbbellGroup.add(weightGroup);
        });

        // Position for better view
        this.dumbbellGroup.position.y = -0.2;
        this.scene.add(this.dumbbellGroup);
    }

    private createFloatingParticles(): void {
        const count = 100;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 8;
            positions[i + 1] = (Math.random() - 0.5) * 6;
            positions[i + 2] = (Math.random() - 0.5) * 5;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: 0.03,
            color: 0x6366f1,
            transparent: true,
            opacity: 0.5
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
    }

    private startRendering(): void {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            const elapsed = this.clock.getElapsedTime();

            if (this.dumbbellGroup) {
                // Gentle floating
                this.dumbbellGroup.position.y = -0.2 + Math.sin(elapsed * 0.8) * 0.1;

                // Slow rotation
                this.dumbbellGroup.rotation.y = elapsed * 0.3;
                this.dumbbellGroup.rotation.x = Math.sin(elapsed * 0.5) * 0.1;

                // Animate floating rings
                this.dumbbellGroup.children.forEach(child => {
                    if (child instanceof THREE.Group) {
                        child.children.forEach(subChild => {
                            if (subChild.userData['rotationSpeed']) {
                                subChild.rotation.x = elapsed * subChild.userData['rotationSpeed'];
                                subChild.rotation.z = Math.sin(elapsed + subChild.userData['index']) * 0.2;
                            }
                        });
                    }
                });
            }

            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }

    private stopRendering(): void {
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this.onResize.bind(this));
    }

    @HostListener('window:resize')
    private onResize(): void {
        const container = this.canvasContainerRef.nativeElement;
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
}
