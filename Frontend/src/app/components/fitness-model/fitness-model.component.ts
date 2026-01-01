import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Input, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import * as THREE from 'three';

@Component({
    selector: 'app-fitness-model',
    template: `
    <div class="canvas-wrapper" #rendererContainer></div>
  `,
    styles: [`
    .canvas-wrapper {
      width: 100%;
      height: 250px;
      display: block;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 30px rgba(99, 102, 241, 0.2);
      background: linear-gradient(145deg, #0a0a1a 0%, #12122a 100%);
      border: 1px solid rgba(99, 102, 241, 0.2);
    }
  `]
})
export class FitnessModelComponent implements AfterViewInit, OnDestroy, OnChanges {
    @ViewChild('rendererContainer') rendererContainer!: ElementRef;

    // Input to decide what to draw: 'dumbbell' | 'barbell' | 'kettlebell'
    @Input() equipmentType: string = 'dumbbell';

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private activeModel: THREE.Group = new THREE.Group();
    private animationId: number = 0;
    private clock = new THREE.Clock();

    constructor() { }

    ngAfterViewInit(): void {
        this.initThreeJS();
        this.loadModelBasedOnInput();
        this.animate();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['equipmentType'] && !changes['equipmentType'].isFirstChange()) {
            this.clearScene();
            this.loadModelBasedOnInput();
        }
    }

    ngOnDestroy(): void {
        cancelAnimationFrame(this.animationId);
        if (this.renderer) {
            this.renderer.dispose();
        }
    }

    private initThreeJS(): void {
        const container = this.rendererContainer.nativeElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene
        this.scene = new THREE.Scene();

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x302010, 1.5);
        this.scene.add(ambientLight);

        // Primary light (power orange)
        const pointLight = new THREE.PointLight(0xff6b35, 2, 50);
        pointLight.position.set(3, 3, 5);
        this.scene.add(pointLight);

        // Secondary light (gold)
        const pointLight2 = new THREE.PointLight(0xffd700, 1.5, 40);
        pointLight2.position.set(-3, -2, 4);
        this.scene.add(pointLight2);

        // Accent light (energy blue)
        const rimLight = new THREE.PointLight(0x00b4d8, 1, 30);
        rimLight.position.set(0, -3, -2);
        this.scene.add(rimLight);

        // Camera
        this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        this.camera.position.z = 4;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        container.appendChild(this.renderer.domElement);
    }

    private loadModelBasedOnInput(): void {
        switch (this.equipmentType.toLowerCase()) {
            case 'kettlebell':
                this.createKettlebell();
                break;
            case 'barbell':
                this.createBarbell();
                break;
            default:
                this.createDumbbell();
                break;
        }
        this.scene.add(this.activeModel);
    }

    // --- MODEL 1: DUMBBELL (Sci-Fi Style) ---
    private createDumbbell(): void {
        this.activeModel = new THREE.Group();

        // Materials
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.8
        });
        const chromeMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6b35,
            roughness: 0.2,
            metalness: 0.9,
            emissive: 0x5a2a10,
            emissiveIntensity: 0.3
        });
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.8
        });

        // Handle
        const handleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 32);
        const handle = new THREE.Mesh(handleGeo, metalMaterial);
        handle.rotation.z = Math.PI / 2;

        // Glowing grip rings
        [-0.3, 0, 0.3].forEach(pos => {
            const gripGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
            const grip = new THREE.Mesh(gripGeo, glowMaterial);
            grip.rotation.z = Math.PI / 2;
            grip.position.x = pos;
            this.activeModel.add(grip);
        });

        // Weights (Hexagons with glow rings)
        const weightGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.25, 6);

        [-0.6, 0.6].forEach(pos => {
            const weight = new THREE.Mesh(weightGeo, chromeMaterial);
            weight.rotation.z = Math.PI / 2;
            weight.position.x = pos;
            this.activeModel.add(weight);

            // Energy ring around weight
            const ringGeo = new THREE.TorusGeometry(0.5, 0.02, 16, 50);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0x00b4d8,
                transparent: true,
                opacity: 0.6
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.y = Math.PI / 2;
            ring.position.x = pos;
            ring.userData = { isRing: true };
            this.activeModel.add(ring);
        });

        this.activeModel.add(handle);
    }

    // --- MODEL 2: BARBELL (Sci-Fi Style) ---
    private createBarbell(): void {
        this.activeModel = new THREE.Group();
        this.activeModel.scale.set(0.55, 0.55, 0.55);

        const plateColor = new THREE.MeshStandardMaterial({
            color: 0x8b5cf6,
            roughness: 0.3,
            metalness: 0.7,
            emissive: 0x2a1a4a,
            emissiveIntensity: 0.2
        });
        const barColor = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.8,
            roughness: 0.3
        });
        const glowRing = new THREE.MeshBasicMaterial({
            color: 0x22c55e,
            transparent: true,
            opacity: 0.7
        });

        // Long Bar
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 5.5, 32), barColor);
        bar.rotation.z = Math.PI / 2;
        this.activeModel.add(bar);

        // Plates with energy rings
        const addPlateWithRing = (xPos: number, size: number, isOuter: boolean) => {
            const plate = new THREE.Mesh(new THREE.CylinderGeometry(size, size, isOuter ? 0.08 : 0.12, 32), plateColor);
            plate.rotation.z = Math.PI / 2;
            plate.position.x = xPos;
            this.activeModel.add(plate);

            if (!isOuter) {
                const ring = new THREE.Mesh(new THREE.TorusGeometry(size + 0.1, 0.02, 16, 50), glowRing);
                ring.rotation.y = Math.PI / 2;
                ring.position.x = xPos;
                ring.userData = { isRing: true };
                this.activeModel.add(ring);
            }
        };

        // Add plates
        addPlateWithRing(-1.8, 0.7, false);
        addPlateWithRing(-2.0, 0.55, true);
        addPlateWithRing(1.8, 0.7, false);
        addPlateWithRing(2.0, 0.55, true);

        // Grip markers
        [-0.6, 0.6].forEach(pos => {
            const gripGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.3, 16);
            const gripMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.8 });
            const grip = new THREE.Mesh(gripGeo, gripMat);
            grip.rotation.z = Math.PI / 2;
            grip.position.x = pos;
            this.activeModel.add(grip);
        });
    }

    // --- MODEL 3: KETTLEBELL (Sci-Fi Style) ---
    private createKettlebell(): void {
        this.activeModel = new THREE.Group();

        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x6366f1,
            roughness: 0.4,
            metalness: 0.6,
            emissive: 0x1a1a4a,
            emissiveIntensity: 0.2
        });
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.3,
            metalness: 0.8
        });

        // The Ball
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.65, 32, 32), bodyMaterial);
        this.activeModel.add(sphere);

        // The Handle (Torus half)
        const handleGeo = new THREE.TorusGeometry(0.45, 0.1, 16, 50, Math.PI);
        const handle = new THREE.Mesh(handleGeo, handleMaterial);
        handle.position.y = 0.55;
        this.activeModel.add(handle);

        // Weight indicator ring
        const indicatorRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.75, 0.02, 16, 50),
            new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.6 })
        );
        indicatorRing.rotation.x = Math.PI / 2;
        indicatorRing.position.y = -0.2;
        indicatorRing.userData = { isRing: true };
        this.activeModel.add(indicatorRing);

        // Glow core
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.5 })
        );
        this.activeModel.add(core);
    }

    private clearScene(): void {
        this.scene.remove(this.activeModel);
        this.activeModel = new THREE.Group();
    }

    private animate = (): void => {
        this.animationId = requestAnimationFrame(this.animate);
        const elapsed = this.clock.getElapsedTime();

        if (this.activeModel) {
            // Gentle floating
            this.activeModel.position.y = Math.sin(elapsed * 0.6) * 0.1;
            this.activeModel.rotation.y = elapsed * 0.4;
            this.activeModel.rotation.x = Math.sin(elapsed * 0.3) * 0.1;

            // Animate rings
            this.activeModel.children.forEach(child => {
                if (child.userData?.['isRing']) {
                    child.rotation.z = elapsed * 0.5;
                }
            });
        }

        this.renderer.render(this.scene, this.camera);
    };

    @HostListener('window:resize')
    onResize(): void {
        const container = this.rendererContainer.nativeElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
