/**
 * ============================================
 * GHOST BACKGROUND - Three.js Phantom Realm
 * Premium 3D animated ghost background
 * ============================================
 */

// Ghost Background Module
const GhostBackground = (() => {
    let scene, camera, renderer;
    let ghosts = [];
    let particles = [];
    let mouseX = 0, mouseY = 0;
    let animationId;
    let isInitialized = false;

    // Configuration
    const CONFIG = {
        ghostCount: 25,
        particleCount: 200,
        colors: {
            primary: 0x8b5cf6,    // Purple
            secondary: 0x06b6d4,  // Cyan
            accent: 0xa855f7,     // Light purple
            glow: 0xc4b5fd       // Soft purple glow
        },
        ghostSize: { min: 0.3, max: 0.8 },
        speed: { min: 0.001, max: 0.003 },
        floatAmplitude: 0.5,
        floatSpeed: 0.002
    };

    // Ghost geometry (simple ghost shape with vertices)
    function createGhostGeometry(size) {
        const geometry = new THREE.BufferGeometry();

        // Ghost body vertices (simplified ghost silhouette)
        const vertices = [];
        const segments = 32;

        // Top dome
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size + size * 0.5;
            vertices.push(x, y, 0);
        }

        // Wavy bottom
        const waveSegments = 6;
        for (let i = 0; i <= waveSegments; i++) {
            const t = i / waveSegments;
            const x = size - (t * size * 2);
            const waveY = Math.sin(t * Math.PI * 3) * size * 0.2 - size * 0.3;
            vertices.push(x, waveY, 0);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        return geometry;
    }

    // Create a single ghost sprite
    function createGhost(index) {
        const size = CONFIG.ghostSize.min + Math.random() * (CONFIG.ghostSize.max - CONFIG.ghostSize.min);

        // Create ghost canvas texture
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 160;
        const ctx = canvas.getContext('2d');

        // Ghost gradient
        const gradient = ctx.createRadialGradient(64, 60, 0, 64, 80, 80);
        const colorIndex = index % 3;

        if (colorIndex === 0) {
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');  // Purple center
            gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.5)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        } else if (colorIndex === 1) {
            gradient.addColorStop(0, 'rgba(6, 182, 212, 0.9)');   // Cyan center
            gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.5)');
            gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
        } else {
            gradient.addColorStop(0, 'rgba(168, 85, 247, 0.9)');  // Light purple
            gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.5)');
            gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
        }

        // Draw ghost body
        ctx.fillStyle = gradient;
        ctx.beginPath();

        // Head (dome)
        ctx.arc(64, 50, 45, Math.PI, 0, false);

        // Body sides
        ctx.lineTo(109, 120);

        // Wavy bottom
        ctx.quadraticCurveTo(95, 105, 85, 120);
        ctx.quadraticCurveTo(75, 135, 64, 120);
        ctx.quadraticCurveTo(53, 135, 43, 120);
        ctx.quadraticCurveTo(33, 105, 19, 120);

        ctx.lineTo(19, 50);
        ctx.closePath();
        ctx.fill();

        // Eyes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.ellipse(48, 55, 10, 12, 0, 0, Math.PI * 2);
        ctx.ellipse(80, 55, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = 'rgba(20, 10, 30, 0.9)';
        ctx.beginPath();
        ctx.arc(50, 57, 5, 0, Math.PI * 2);
        ctx.arc(82, 57, 5, 0, Math.PI * 2);
        ctx.fill();

        // Cute blush
        ctx.fillStyle = 'rgba(244, 114, 182, 0.4)';
        ctx.beginPath();
        ctx.ellipse(38, 72, 8, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(90, 72, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Create sprite
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.6 + Math.random() * 0.3,
            blending: THREE.AdditiveBlending
        });

        const sprite = new THREE.Sprite(material);
        sprite.scale.set(size * 2, size * 2.5, 1);

        // Random position
        sprite.position.x = (Math.random() - 0.5) * 20;
        sprite.position.y = (Math.random() - 0.5) * 12;
        sprite.position.z = (Math.random() - 0.5) * 10 - 5;

        // Animation properties
        sprite.userData = {
            originalY: sprite.position.y,
            floatOffset: Math.random() * Math.PI * 2,
            floatSpeed: CONFIG.floatSpeed + Math.random() * 0.002,
            floatAmplitude: CONFIG.floatAmplitude + Math.random() * 0.3,
            driftX: (Math.random() - 0.5) * CONFIG.speed.max,
            driftY: (Math.random() - 0.5) * CONFIG.speed.min,
            rotationSpeed: (Math.random() - 0.5) * 0.01,
            pulseSpeed: 0.02 + Math.random() * 0.02,
            pulseOffset: Math.random() * Math.PI * 2
        };

        return sprite;
    }

    // Create floating particle
    function createParticle() {
        const geometry = new THREE.SphereGeometry(0.02 + Math.random() * 0.03, 8, 8);

        const colorChoice = Math.random();
        let color;
        if (colorChoice < 0.4) {
            color = CONFIG.colors.primary;
        } else if (colorChoice < 0.7) {
            color = CONFIG.colors.secondary;
        } else {
            color = CONFIG.colors.accent;
        }

        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.4 + Math.random() * 0.4,
            blending: THREE.AdditiveBlending
        });

        const particle = new THREE.Mesh(geometry, material);

        particle.position.x = (Math.random() - 0.5) * 25;
        particle.position.y = (Math.random() - 0.5) * 15;
        particle.position.z = (Math.random() - 0.5) * 15 - 3;

        particle.userData = {
            speed: 0.005 + Math.random() * 0.015,
            angle: Math.random() * Math.PI * 2,
            radius: 0.5 + Math.random() * 2,
            originalX: particle.position.x,
            originalY: particle.position.y
        };

        return particle;
    }

    // Initialize Three.js scene
    function init() {
        if (isInitialized) return;

        // Create container
        const container = document.createElement('div');
        container.id = 'ghost-background';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
            overflow: hidden;
        `;
        document.body.insertBefore(container, document.body.firstChild);

        // Scene setup
        scene = new THREE.Scene();

        // Camera
        camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 8;

        // Renderer
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Create ghosts
        for (let i = 0; i < CONFIG.ghostCount; i++) {
            const ghost = createGhost(i);
            ghosts.push(ghost);
            scene.add(ghost);
        }

        // Create particles
        for (let i = 0; i < CONFIG.particleCount; i++) {
            const particle = createParticle();
            particles.push(particle);
            scene.add(particle);
        }

        // Add ambient light points
        const lightColors = [0x8b5cf6, 0x06b6d4, 0xa855f7];
        lightColors.forEach((color, index) => {
            const light = new THREE.PointLight(color, 0.5, 20);
            light.position.set(
                Math.cos(index * Math.PI * 2 / 3) * 8,
                Math.sin(index * Math.PI * 2 / 3) * 5,
                2
            );
            scene.add(light);
        });

        // Event listeners
        window.addEventListener('resize', onWindowResize);
        document.addEventListener('mousemove', onMouseMove);

        isInitialized = true;

        // Start animation
        animate();

        console.log('👻 Ghost Background initialized');
    }

    // Animation loop
    function animate() {
        animationId = requestAnimationFrame(animate);

        const time = Date.now() * 0.001;

        // Animate ghosts
        ghosts.forEach((ghost, index) => {
            const data = ghost.userData;

            // Floating motion
            ghost.position.y = data.originalY +
                Math.sin(time * data.floatSpeed * 100 + data.floatOffset) * data.floatAmplitude;

            // Gentle drift
            ghost.position.x += data.driftX;

            // Wrap around screen
            if (ghost.position.x > 12) ghost.position.x = -12;
            if (ghost.position.x < -12) ghost.position.x = 12;
            if (ghost.position.y > 8) ghost.position.y = -8;
            if (ghost.position.y < -8) ghost.position.y = 8;

            // Pulse opacity
            const pulse = Math.sin(time * data.pulseSpeed * 50 + data.pulseOffset) * 0.15 + 0.85;
            ghost.material.opacity = (0.5 + Math.random() * 0.1) * pulse;

            // Subtle rotation
            ghost.material.rotation += data.rotationSpeed * 0.1;

            // React to mouse (subtle attraction)
            const dx = (mouseX * 0.01) - ghost.position.x;
            const dy = (-mouseY * 0.01) - ghost.position.y;
            ghost.position.x += dx * 0.0005;
            ghost.position.y += dy * 0.0005;
        });

        // Animate particles
        particles.forEach((particle, index) => {
            const data = particle.userData;

            // Orbital motion
            data.angle += data.speed * 0.1;
            particle.position.x = data.originalX + Math.cos(data.angle) * data.radius * 0.3;
            particle.position.y = data.originalY + Math.sin(data.angle * 0.7) * data.radius * 0.5;

            // Slow drift upward
            particle.position.y += 0.002;

            // Reset when off screen
            if (particle.position.y > 10) {
                particle.position.y = -10;
                particle.position.x = (Math.random() - 0.5) * 25;
                data.originalX = particle.position.x;
                data.originalY = particle.position.y;
            }

            // Twinkle effect
            particle.material.opacity = 0.3 + Math.sin(time * 3 + index) * 0.3;
        });

        // Subtle camera movement
        camera.position.x += (mouseX * 0.0002 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 0.0002 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    // Window resize handler
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Mouse move handler
    function onMouseMove(event) {
        mouseX = (event.clientX - window.innerWidth / 2);
        mouseY = (event.clientY - window.innerHeight / 2);
    }

    // Create click burst effect (called from game.js)
    function createClickBurst(x, y, power = 1) {
        if (!isInitialized) return;

        const burstCount = Math.min(5 + Math.floor(power / 10), 15);

        for (let i = 0; i < burstCount; i++) {
            const size = 0.05 + Math.random() * 0.1;
            const geometry = new THREE.SphereGeometry(size, 8, 8);

            const colors = [0x8b5cf6, 0x06b6d4, 0xa855f7, 0x22c55e];
            const color = colors[Math.floor(Math.random() * colors.length)];

            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });

            const burst = new THREE.Mesh(geometry, material);

            // Convert screen coords to 3D
            const screenX = (x / window.innerWidth) * 2 - 1;
            const screenY = -(y / window.innerHeight) * 2 + 1;

            burst.position.x = screenX * 8;
            burst.position.y = screenY * 5;
            burst.position.z = 0;

            // Random velocity
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.05 + Math.random() * 0.1;
            burst.userData = {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed + 0.05,
                vz: (Math.random() - 0.5) * 0.05,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.02
            };

            scene.add(burst);

            // Animate and remove
            const animateBurst = () => {
                burst.userData.life -= burst.userData.decay;

                if (burst.userData.life <= 0) {
                    scene.remove(burst);
                    burst.geometry.dispose();
                    burst.material.dispose();
                    return;
                }

                burst.position.x += burst.userData.vx;
                burst.position.y += burst.userData.vy;
                burst.position.z += burst.userData.vz;
                burst.userData.vy -= 0.002; // Gravity
                burst.material.opacity = burst.userData.life * 0.8;
                burst.scale.setScalar(burst.userData.life);

                requestAnimationFrame(animateBurst);
            };

            animateBurst();
        }
    }

    // Spawn a golden ghost (bonus!)
    function spawnGoldenGhost() {
        if (!isInitialized) return null;

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 160;
        const ctx = canvas.getContext('2d');

        // Golden gradient
        const gradient = ctx.createRadialGradient(64, 60, 0, 64, 80, 80);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 185, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 165, 0, 0)');

        // Draw ghost body
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(64, 50, 45, Math.PI, 0, false);
        ctx.lineTo(109, 120);
        ctx.quadraticCurveTo(95, 105, 85, 120);
        ctx.quadraticCurveTo(75, 135, 64, 120);
        ctx.quadraticCurveTo(53, 135, 43, 120);
        ctx.quadraticCurveTo(33, 105, 19, 120);
        ctx.lineTo(19, 50);
        ctx.closePath();
        ctx.fill();

        // Sparkle eyes
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.beginPath();
        ctx.arc(48, 55, 10, 0, Math.PI * 2);
        ctx.arc(80, 55, 10, 0, Math.PI * 2);
        ctx.fill();

        // Star pupils
        ctx.fillStyle = 'rgba(255, 215, 0, 1)';
        ctx.font = '16px serif';
        ctx.fillText('★', 42, 62);
        ctx.fillText('★', 74, 62);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending
        });

        const goldenGhost = new THREE.Sprite(material);
        goldenGhost.scale.set(1.5, 1.875, 1);

        // Random edge spawn
        const side = Math.floor(Math.random() * 4);
        switch(side) {
            case 0: // Left
                goldenGhost.position.set(-12, (Math.random() - 0.5) * 8, 2);
                break;
            case 1: // Right
                goldenGhost.position.set(12, (Math.random() - 0.5) * 8, 2);
                break;
            case 2: // Top
                goldenGhost.position.set((Math.random() - 0.5) * 16, 8, 2);
                break;
            case 3: // Bottom
                goldenGhost.position.set((Math.random() - 0.5) * 16, -8, 2);
                break;
        }

        goldenGhost.userData = {
            isGolden: true,
            targetX: (Math.random() - 0.5) * 8,
            targetY: (Math.random() - 0.5) * 4,
            speed: 0.02,
            lifetime: 10000, // 10 seconds
            spawnTime: Date.now(),
            floatOffset: Math.random() * Math.PI * 2
        };

        scene.add(goldenGhost);

        // Animate golden ghost
        const animateGolden = () => {
            const elapsed = Date.now() - goldenGhost.userData.spawnTime;

            if (elapsed > goldenGhost.userData.lifetime || goldenGhost.userData.clicked) {
                scene.remove(goldenGhost);
                goldenGhost.geometry?.dispose();
                goldenGhost.material.dispose();
                return;
            }

            // Move toward target
            const dx = goldenGhost.userData.targetX - goldenGhost.position.x;
            const dy = goldenGhost.userData.targetY - goldenGhost.position.y;
            goldenGhost.position.x += dx * goldenGhost.userData.speed;
            goldenGhost.position.y += dy * goldenGhost.userData.speed;

            // Float effect
            goldenGhost.position.y += Math.sin(Date.now() * 0.003 + goldenGhost.userData.floatOffset) * 0.02;

            // Pulse glow
            goldenGhost.material.opacity = 0.7 + Math.sin(Date.now() * 0.005) * 0.25;

            // Change target occasionally
            if (Math.random() < 0.01) {
                goldenGhost.userData.targetX = (Math.random() - 0.5) * 8;
                goldenGhost.userData.targetY = (Math.random() - 0.5) * 4;
            }

            requestAnimationFrame(animateGolden);
        };

        animateGolden();

        return goldenGhost;
    }

    // Check if click hit golden ghost
    function checkGoldenGhostClick(screenX, screenY) {
        if (!isInitialized) return null;

        const mouse = new THREE.Vector2(
            (screenX / window.innerWidth) * 2 - 1,
            -(screenY / window.innerHeight) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const goldenGhosts = scene.children.filter(
            obj => obj.userData && obj.userData.isGolden && !obj.userData.clicked
        );

        const intersects = raycaster.intersectObjects(goldenGhosts);

        if (intersects.length > 0) {
            const ghost = intersects[0].object;
            ghost.userData.clicked = true;

            // Explosion effect
            for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                    createClickBurst(screenX, screenY, 50);
                }, i * 20);
            }

            return true;
        }

        return false;
    }

    // Cleanup
    function destroy() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }

        window.removeEventListener('resize', onWindowResize);
        document.removeEventListener('mousemove', onMouseMove);

        const container = document.getElementById('ghost-background');
        if (container) {
            container.remove();
        }

        ghosts = [];
        particles = [];
        isInitialized = false;
    }

    // Public API
    return {
        init,
        destroy,
        createClickBurst,
        spawnGoldenGhost,
        checkGoldenGhostClick
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', GhostBackground.init);
} else {
    GhostBackground.init();
}
