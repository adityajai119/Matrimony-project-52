import { Component, ElementRef, Input, AfterViewInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import * as THREE from 'three';

@Component({
    selector: 'app-three-scene',
    template: `<div #canvasContainer class="canvas-container"></div>`,
    styles: [`
    .canvas-container {
      width: 100%;
      height: 100%;
      position: fixed;
      top: 0;
      left: 0;
      z-index: -1;
      overflow: hidden;
      pointer-events: none;
    }
  `]
})
export class ThreeSceneComponent implements AfterViewInit, OnDestroy {
    @ViewChild('canvasContainer') canvasContainer!: ElementRef;
    @Input() sceneType: 'login' | 'dashboard' | 'progress' = 'login';

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private animationId!: number;
    private stars!: THREE.Points;
    private twinkleStars: { mesh: THREE.Points; speed: number; phase: number }[] = [];
    private shootingStars: { mesh: THREE.Mesh; speed: number; life: number; active: boolean }[] = [];
    private planets: THREE.Mesh[] = [];
    private clock = new THREE.Clock();
    private mouseX = 0;
    private mouseY = 0;
    private targetMouseX = 0;
    private targetMouseY = 0;

    ngAfterViewInit(): void {
        this.initThree();
        this.animate();
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    ngOnDestroy(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
        window.removeEventListener('mousemove', this.onMouseMove.bind(this));
    }

    private onMouseMove(event: MouseEvent): void {
        this.targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
        this.targetMouseY = (event.clientY / window.innerHeight) * 2 - 1;
    }

    private initThree(): void {
        const container = this.canvasContainer.nativeElement;
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        // Scene setup
        this.scene = new THREE.Scene();

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
        this.camera.position.z = 1;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        // Create live space environment
        this.createStarField();
        this.createTwinklingStars();
        this.createDistantPlanets();
        this.createShootingStars();
    }

    /** Create a circular texture for stars (no squares!) */
    private createStarTexture(): THREE.Texture {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d')!;

        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    /** Main star field */
    private createStarField(): void {
        const starCount = 2500;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        const starColors = [
            new THREE.Color(0xffffff),
            new THREE.Color(0xffffff),
            new THREE.Color(0xffe4b5),
            new THREE.Color(0x87ceeb),
            new THREE.Color(0xffd700),
        ];

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 1200;
            positions[i3 + 1] = (Math.random() - 0.5) * 800;
            positions[i3 + 2] = -Math.random() * 800 - 50;

            const color = starColors[Math.floor(Math.random() * starColors.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 2,
            map: this.createStarTexture(),
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            sizeAttenuation: true,
            depthWrite: false
        });

        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);
    }

    /** Multiple layers of twinkling stars with different speeds */
    private createTwinklingStars(): void {
        // Create 3 layers of twinkling stars
        for (let layer = 0; layer < 3; layer++) {
            const count = 80 + layer * 30;
            const positions = new Float32Array(count * 3);

            for (let i = 0; i < count * 3; i += 3) {
                positions[i] = (Math.random() - 0.5) * 1000;
                positions[i + 1] = (Math.random() - 0.5) * 600;
                positions[i + 2] = -Math.random() * 400 - 30;
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const material = new THREE.PointsMaterial({
                size: 4 + layer,
                map: this.createStarTexture(),
                color: layer === 0 ? 0xffffff : (layer === 1 ? 0x87ceeb : 0xffd700),
                transparent: true,
                opacity: 1,
                depthWrite: false
            });

            const stars = new THREE.Points(geometry, material);
            this.scene.add(stars);

            this.twinkleStars.push({
                mesh: stars,
                speed: 2 + layer * 1.5,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    /** Distant planets with glow */
    private createDistantPlanets(): void {
        // Large orange planet (DBZ King Kai style)
        const planet1 = new THREE.Mesh(
            new THREE.SphereGeometry(25, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0xff6b35, transparent: true, opacity: 0.25 })
        );
        planet1.position.set(-250, 120, -500);
        this.planets.push(planet1);
        this.scene.add(planet1);

        // Glow effect using a larger transparent sphere
        const glow1 = new THREE.Mesh(
            new THREE.SphereGeometry(32, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0xff6b35, transparent: true, opacity: 0.08 })
        );
        glow1.position.copy(planet1.position);
        this.scene.add(glow1);

        // Blue ice planet
        const planet2 = new THREE.Mesh(
            new THREE.SphereGeometry(15, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0x00b4d8, transparent: true, opacity: 0.2 })
        );
        planet2.position.set(280, -100, -450);
        this.planets.push(planet2);
        this.scene.add(planet2);

        // Small red planet
        const planet3 = new THREE.Mesh(
            new THREE.SphereGeometry(8, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0xef233c, transparent: true, opacity: 0.3 })
        );
        planet3.position.set(180, 180, -600);
        this.planets.push(planet3);
        this.scene.add(planet3);
    }

    /** Shooting stars that streak across frequently */
    private createShootingStars(): void {
        for (let i = 0; i < 5; i++) {
            this.spawnShootingStar(i * 2); // Stagger initial spawns
        }
    }

    private spawnShootingStar(delay: number = 0): void {
        // Create a line-based shooting star (no boxes!)
        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(-20, -12, 0)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0,
            linewidth: 2
        });

        const star = new THREE.Line(geometry, material);
        star.position.set(
            Math.random() * 600 + 200,
            Math.random() * 400 + 100,
            -Math.random() * 200 - 50
        );

        this.scene.add(star);

        this.shootingStars.push({
            mesh: star as any,
            speed: 8 + Math.random() * 6,
            life: -delay,
            active: false
        });
    }

    private resetShootingStar(star: { mesh: THREE.Mesh; speed: number; life: number; active: boolean }): void {
        star.mesh.position.set(
            Math.random() * 600 + 300,
            Math.random() * 400 + 150,
            -Math.random() * 150 - 50
        );
        (star.mesh.material as THREE.LineBasicMaterial).opacity = 0;
        star.life = -(Math.random() * 3 + 1); // Random delay 1-4 seconds
        star.speed = 8 + Math.random() * 6;
        star.active = false;
    }

    private animate(): void {
        this.animationId = requestAnimationFrame(() => this.animate());
        const elapsed = this.clock.getElapsedTime();

        // Smooth parallax camera movement (MORE NOTICEABLE)
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;
        this.camera.position.x = this.mouseX * 20;
        this.camera.position.y = -this.mouseY * 15;
        this.camera.lookAt(0, 0, -500);

        // Star field gentle drift
        if (this.stars) {
            this.stars.rotation.y = elapsed * 0.008;
            this.stars.rotation.x = Math.sin(elapsed * 0.003) * 0.02;
        }

        // DRAMATIC twinkling effect
        this.twinkleStars.forEach((layer) => {
            const mat = layer.mesh.material as THREE.PointsMaterial;
            const pulse = Math.sin(elapsed * layer.speed + layer.phase);
            mat.opacity = 0.3 + pulse * 0.7; // Range: 0.3 to 1.0
            mat.size = 2 + pulse * 3; // Size pulses too
        });

        // Planet rotation and gentle bob
        this.planets.forEach((planet, i) => {
            planet.rotation.y = elapsed * (0.05 + i * 0.02);
            planet.position.y += Math.sin(elapsed * 0.3 + i) * 0.05;
        });

        // Shooting stars animation (MORE FREQUENT)
        this.shootingStars.forEach(star => {
            star.life += 0.016;

            if (star.life > 0) {
                star.active = true;
                const mat = star.mesh.material as THREE.LineBasicMaterial;

                // Fade in quickly, stay visible, fade out
                if (star.life < 0.2) {
                    mat.opacity = star.life / 0.2;
                } else if (star.life > 1.2) {
                    mat.opacity = Math.max(0, 1 - (star.life - 1.2) / 0.3);
                } else {
                    mat.opacity = 1;
                }

                // Move diagonally across screen
                star.mesh.position.x -= star.speed;
                star.mesh.position.y -= star.speed * 0.6;

                // Reset when done
                if (star.life > 1.8 || star.mesh.position.x < -400) {
                    this.resetShootingStar(star);
                }
            }
        });

        this.renderer.render(this.scene, this.camera);
    }

    @HostListener('window:resize')
    onWindowResize(): void {
        const container = this.canvasContainer.nativeElement;
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
