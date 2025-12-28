hereclass Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = null;
        this.gameStarted = false;
        this.selectedTeam = 'nankatsu';
        this.players = [];
        this.ball = null;
        this.score = { nankatsu: 0, toho: 0 };
        this.time = 0;
        this.gameTime = 90 * 60; // 90 minutos en frames (60 fps)
    }

    init() {
        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        
        // Crear cámara
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 20, 30);
        
        // Crear renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('gameCanvas'),
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Configurar controles de cámara
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Reloj para animaciones
        this.clock = new THREE.Clock();
        
        // Configurar luces
        this.setupLights();
        
        // Crear campo
        this.createField();
        
        // Crear equipos
        this.createTeams();
        
        // Crear pelota
        this.createBall();
        
        // Iniciar controles
        this.initControls();
        
        // Iniciar animación
        this.animate();
        
        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLights() {
        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Luz direccional (sol)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
    }

    createField() {
        // Césped
        const fieldGeometry = new THREE.BoxGeometry(80, 1, 120);
        const fieldMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2E7D32 
        });
        const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        field.receiveShadow = true;
        field.position.y = -0.5;
        this.scene.add(field);
        
        // Líneas del campo
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        
        // Círculo central
        const circleGeometry = new THREE.RingGeometry(9, 9.2, 32);
        const circle = new THREE.Mesh(circleGeometry, new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            side: THREE.DoubleSide 
        }));
        circle.rotation.x = Math.PI / 2;
        this.scene.add(circle);
        
        // Porterías
        this.createGoal(-58, 0, 0x4ECDC4); // Portería Nankatsu
        this.createGoal(58, 0, 0xFF6B6B);  // Portería Toho
    }

    createGoal(x, y, color) {
        const goalMaterial = new THREE.MeshLambertMaterial({ color: color });
        
        // Postes verticales
        const postGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2.5);
        const leftPost = new THREE.Mesh(postGeometry, goalMaterial);
        const rightPost = new THREE.Mesh(postGeometry, goalMaterial);
        const crossbar = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.3, 0.3), goalMaterial);
        
        leftPost.position.set(x, 1.25, -3.5);
        rightPost.position.set(x, 1.25, 3.5);
        crossbar.position.set(x, 2.5, 0);
        
        [leftPost, rightPost, crossbar].forEach(post => {
            post.castShadow = true;
            this.scene.add(post);
        });
    }

    createTeams() {
        // Nankatsu SC (azul/rojo)
        const nankatsuPlayers = [
            { name: 'Tsubasa', number: 10, position: 'MF', specialShot: 'Drive Shot' },
            { name: 'Ishizaki', number: 2, position: 'DF', specialShot: 'Bomber Header' },
            { name: 'Misaki', number: 11, position: 'MF', specialShot: 'Golden Duo' },
            { name: 'Nishio', number: 5, position: 'DF', specialShot: 'Tackle' },
            { name: 'Wakabayashi', number: 1, position: 'GK', specialShot: 'God Catch' }
        ];
        
        // Toho Academy (verde)
        const tohoPlayers = [
            { name: 'Hyuga', number: 9, position: 'FW', specialShot: 'Tiger Shot' },
            { name: 'Misugi', number: 6, position: 'MF', specialShot: 'Elegant Play' },
            { name: 'Sano', number: 7, position: 'FW', specialShot: 'Falcon Shot' },
            { name: 'Izawa', number: 8, position: 'MF', specialShot: 'Precision Pass' },
            { name: 'Wakashimazu', number: 1, position: 'GK', specialShot: 'Fist Punch' }
        ];
        
        // Posiciones iniciales (formación 2-1-1)
        const nankatsuPositions = [
            new THREE.Vector3(-30, 0, 0),   // GK
            new THREE.Vector3(-20, 0, -15), // DF
            new THREE.Vector3(-20, 0, 15),  // DF
            new THREE.Vector3(-10, 0, 0),   // MF
            new THREE.Vector3(0, 0, 0)      // FW
        ];
        
        const tohoPositions = [
            new THREE.Vector3(30, 0, 0),    // GK
            new THREE.Vector3(20, 0, -15),  // DF
            new THREE.Vector3(20, 0, 15),   // DF
            new THREE.Vector3(10, 0, 0),    // MF
            new THREE.Vector3(-10, 0, 0)    // FW
        ];
        
        // Crear jugadores de Nankatsu
        nankatsuPlayers.forEach((player, index) => {
            const playerObj = this.createPlayer(
                player.name, 
                player.number, 
                'nankatsu', 
                nankatsuPositions[index],
                index === 0 // Primer jugador es controlado por el usuario si se selecciona Nankatsu
            );
            this.players.push(playerObj);
        });
        
        // Crear jugadores de Toho
        tohoPlayers.forEach((player, index) => {
            const playerObj = this.createPlayer(
                player.name, 
                player.number, 
                'toho', 
                tohoPositions[index],
                index === 0 && this.selectedTeam === 'toho'
            );
            this.players.push(playerObj);
        });
    }

    createPlayer(name, number, team, position, isUserControlled) {
        const group = new THREE.Group();
        
        // Color del equipo
        const color = team === 'nankatsu' ? 0x1E88E5 : 0x43A047;
        
        // Cuerpo
        const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        group.add(body);
        
        // Cabeza
        const headGeometry = new THREE.SphereGeometry(0.4, 8, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFCC99 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.2;
        head.castShadow = true;
        group.add(head);
        
        // Número en la espalda
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        context.fillStyle = 'white';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(number, 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const numberMaterial = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true 
        });
        const numberPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 0.8),
            numberMaterial
        );
        numberPlane.position.set(0, 0.5, -0.6);
        numberPlane.rotation.y = Math.PI;
        group.add(numberPlane);
        
        group.position.copy(position);
        group.userData = {
            name: name,
            number: number,
            team: team,
            isUserControlled: isUserControlled,
            speed: 0.2,
            hasBall: false,
            stamina: 100,
            specialShot: true
        };
        
        this.scene.add(group);
        return group;
    }

    createBall() {
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFFF,
            emissive: 0x222222
        });
        this.ball = new THREE.Mesh(geometry, material);
        this.ball.castShadow = true;
        this.ball.position.set(0, 0.3, 0);
        this.ball.userData = {
            velocity: new THREE.Vector3(0, 0, 0),
            owner: null,
            inPlay: true
        };
        this.scene.add(this.ball);
    }

    initControls() {
        this.keys = {};
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ' && this.gameStarted) {
                this.shootBall();
            }
            
            if (e.key === 'e' && this.gameStarted) {
                this.specialShot();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    update() {
        if (!this.gameStarted) return;
        
        const delta = this.clock.getDelta();
        
        // Actualizar tiempo del partido
        this.time += delta;
        this.updateGameTime();
        
        // Encontrar jugador controlado por usuario
        const userPlayer = this.players.find(p => p.userData.isUserControlled);
        
        if (userPlayer) {
            // Movimiento del jugador
            const speed = this.keys['shift'] ? userPlayer.userData.speed * 1.5 : userPlayer.userData.speed;
            
            if (this.keys['w'] || this.keys['arrowup']) {
                userPlayer.position.z -= speed;
            }
            if (this.keys['s'] || this.keys['arrowdown']) {
                userPlayer.position.z += speed;
            }
            if (this.keys['a'] || this.keys['arrowleft']) {
                userPlayer.position.x -= speed;
            }
            if (this.keys['d'] || this.keys['arrowright']) {
                userPlayer.position.x += speed;
            }
            
            // Rotar hacia la dirección del movimiento
            if (this.keys['w'] || this.keys['s'] || this.keys['a'] || this.keys['d']) {
                const angle = Math.atan2(
                    (this.keys['a'] ? -1 : 0) + (this.keys['d'] ? 1 : 0),
                    (this.keys['w'] ? -1 : 0) + (this.keys['s'] ? 1 : 0)
                );
                userPlayer.rotation.y = angle;
            }
            
            // Limitar al campo
            this.limitToField(userPlayer);
            
            // Si el jugador tiene la pelota, moverla con él
            if (userPlayer.userData.hasBall) {
                this.ball.position.copy(userPlayer.position);
                this.ball.position.y = 0.3;
                this.ball.position.z += 0.8;
            }
        }
        
        // Actualizar física de la pelota
        this.updateBall(delta);
        
        // Actualizar IA de los otros jugadores
        this.updateAI(delta);
        
        // Verificar goles
        this.checkGoals();
    }

    updateBall(delta) {
        if (!this.ball.userData.inPlay) return;
        
        // Aplicar gravedad
        this.ball.userData.velocity.y -= 9.8 * delta;
        
        // Actualizar posición
        this.ball.position.add(this.ball.userData.velocity.clone().multiplyScalar(delta * 60));
        
        // Rebotar en el suelo
        if (this.ball.position.y <= 0.3) {
            this.ball.position.y = 0.3;
            this.ball.userData.velocity.y = Math.abs(this.ball.userData.velocity.y) * 0.7;
            
            // Fricción
            this.ball.userData.velocity.x *= 0.98;
            this.ball.userData.velocity.z *= 0.98;
        }
        
        // Limitar pelota al campo
        this.limitBallToField();
        
        // Verificar colisiones con jugadores
        this.checkPlayerCollisions();
    }

    shootBall() {
        const userPlayer = this.players.find(p => p.userData.isUserControlled);
        if (!userPlayer || !userPlayer.userData.hasBall) return;
        
        // Calcular dirección basada en la rotación del jugador
        const power = 1.5;
        this.ball.userData.velocity.set(
            Math.sin(userPlayer.rotation.y) * power,
            0.5,
            Math.cos(userPlayer.rotation.y) * power
        );
        
        userPlayer.userData.hasBall = false;
        this.ball.userData.owner = null;
        
        // Efecto visual
        this.createShotEffect(userPlayer.position);
    }

    specialShot() {
        const userPlayer = this.players.find(p => p.userData.isUserControlled);
        if (!userPlayer || !userPlayer.userData.hasBall || !userPlayer.userData.specialShot) return;
        
        const power = 3.0;
        this.ball.userData.velocity.set(
            Math.sin(userPlayer.rotation.y) * power,
            1.0,
            Math.cos(userPlayer.rotation.y) * power
        );
        
        // Efecto especial
        this.createSpecialEffect(userPlayer.position, userPlayer.userData.name);
        
        userPlayer.userData.hasBall = false;
        userPlayer.userData.specialShot = false;
        this.ball.userData.owner = null;
    }

    createShotEffect(position) {
        const geometry = new THREE.SphereGeometry(0.5, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            transparent: true,
            opacity: 0.7
        });
        const effect = new THREE.Mesh(geometry, material);
        effect.position.copy(position);
        effect.position.y = 1;
        this.scene.add(effect);
        
        // Animación y eliminación
        let scale = 1;
        const animate = () => {
            scale += 0.1;
            effect.scale.setScalar(scale);
            material.opacity -= 0.05;
            
            if (material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(effect);
            }
        };
        animate();
    }

    createSpecialEffect(position, playerName) {
        // Crear múltiples partículas
        for (let i = 0; i < 20; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 4, 4);
            const material = new THREE.MeshBasicMaterial({
                color: playerName === 'Tsubasa' ? 0x1E88E5 : 
                       playerName === 'Hyuga' ? 0xFF3D00 : 0xFFFF00,
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            particle.position.y = 1;
            
            // Velocidad aleatoria
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
            );
            
            this.scene.add(particle);
            
            // Animación
            setTimeout(() => {
                let opacity = 0.8;
                const animateParticle = () => {
                    particle.position.add(particle.userData.velocity);
                    particle.userData.velocity.y -= 0.05;
                    opacity -= 0.02;
                    material.opacity = opacity;
                    
                    if (opacity > 0) {
                        requestAnimationFrame(animateParticle);
                    } else {
                        this.scene.remove(particle);
                    }
                };
                animateParticle();
            }, i * 10);
        }
    }

    updateAI(delta) {
        this.players.forEach(player => {
            if (!player.userData.isUserControlled && player.userData.team !== this.selectedTeam) {
                // IA simple: seguir la pelota
                const ballDirection = new THREE.Vector3()
                    .subVectors(this.ball.position, player.position)
                    .normalize();
                
                // Si está cerca de la pelota, intentar robarla
                if (player.position.distanceTo(this.ball.position) < 2 && 
                    !this.ball.userData.owner && 
                    this.ball.userData.inPlay) {
                    
                    player.position.add(ballDirection.multiplyScalar(player.userData.speed * delta * 60));
                    
                    // Si toca la pelota, tomarla
                    if (player.position.distanceTo(this.ball.position) < 1) {
                        this.ball.userData.owner = player;
                        player.userData.hasBall = true;
                        this.ball.position.copy(player.position);
                        this.ball.position.y = 0.3;
                        this.ball.position.z += 0.8;
                    }
                }
                
                // Limitar al campo
                this.limitToField(player);
            }
        });
    }

    checkPlayerCollisions() {
        if (!this.ball.userData.inPlay || this.ball.userData.owner) return;
        
        this.players.forEach(player => {
            if (player.position.distanceTo(this.ball.position) < 1.5) {
                // El jugador toma la pelota
                this.ball.userData.owner = player;
                player.userData.hasBall = true;
                this.ball.position.copy(player.position);
                this.ball.position.y = 0.3;
                this.ball.position.z += 0.8;
                this.ball.userData.velocity.set(0, 0, 0);
            }
        });
    }

    checkGoals() {
        const ball = this.ball.position;
        
        // Portería Nankatsu (lado izquierdo)
        if (ball.x < -57 && ball.x > -59 && 
            ball.z > -3.5 && ball.z < 3.5 && 
            ball.y < 2.5) {
            this.scoreGoal('toho');
        }
        
        // Portería Toho (lado derecho)
        if (ball.x > 57 && ball.x < 59 && 
            ball.z > -3.5 && ball.z < 3.5 && 
            ball.y < 2.5) {
            this.scoreGoal('nankatsu');
        }
    }

    scoreGoal(team) {
        this.score[team]++;
        this.updateScoreboard();
        
        // Efecto de gol
        this.createGoalEffect();
        
        // Resetear pelota
        this.resetBall();
        
        // Mostrar mensaje
        this.showGoalMessage(team);
    }

    createGoalEffect() {
        // Explosión de partículas
        for (let i = 0; i < 50; i++) {
            const geometry = new THREE.SphereGeometry(0.2, 4, 4);
            const material = new THREE.MeshBasicMaterial({
                color: 0xFFFF00,
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(this.ball.position);
            
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                Math.random() * 5,
                (Math.random() - 0.5) * 5
            );
            
            this.scene.add(particle);
            
            // Animación
            setTimeout(() => {
                let opacity = 0.8;
                const animateParticle = () => {
                    particle.position.add(particle.userData.velocity);
                    particle.userData.velocity.y -= 0.1;
                    opacity -= 0.02;
                    material.opacity = opacity;
                    
                    if (opacity > 0) {
                        requestAnimationFrame(animateParticle);
                    } else {
                        this.scene.remove(particle);
                    }
                };
                animateParticle();
            }, i * 10);
        }
    }

    resetBall() {
        this.ball.position.set(0, 0.3, 0);
        this.ball.userData.velocity.set(0, 0, 0);
        this.ball.userData.owner = null;
        this.ball.userData.inPlay = true;
        
        // Quitar la pelota de todos los jugadores
        this.players.forEach(player => {
            player.userData.hasBall = false;
        });
    }

    limitToField(player) {
        // Limites del campo
        player.position.x = THREE.MathUtils.clamp(player.position.x, -40, 40);
        player.position.z = THREE.MathUtils.clamp(player.position.z, -58, 58);
    }

    limitBallToField() {
        // Limites horizontales
        if (this.ball.position.x < -40 || this.ball.position.x > 40) {
            this.ball.userData.velocity.x *= -0.8;
            this.ball.position.x = THREE.MathUtils.clamp(this.ball.position.x, -40, 40);
        }
        
        // Limites verticales
        if (this.ball.position.z < -58 || this.ball.position.z > 58) {
            this.ball.userData.velocity.z *= -0.8;
            this.ball.position.z = THREE.MathUtils.clamp(this.ball.position.z, -58, 58);
        }
    }

    updateScoreboard() {
        document.getElementById('nankatsu').textContent = `Nankatsu ${this.score.nankatsu}`;
        document.getElementById('toho').textContent = `Toho ${this.score.toho}`;
    }

    updateGameTime() {
        const minutes = Math.floor(this.time / 60);
        const seconds = Math.floor(this.time % 60);
        document.getElementById('time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Fin del partido
        if (minutes >= 90) {
            this.endGame();
        }
    }

    showGoalMessage(team) {
        const message = document.createElement('div');
        message.style.position = 'absolute';
        message.style.top = '40%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.color = team === 'nankatsu' ? '#FF6B6B' : '#4ECDC4';
        message.style.fontSize = '60px';
        message.style.fontWeight = 'bold';
        message.style.textShadow = '3px 3px 0 #000';
        message.style.zIndex = '1000';
        message.textContent = '⚽ GOOOOOOL ⚽';
        
        document.getElementById('game-container').appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 2000);
    }

    startGame() {
        this.gameStarted = true;
        document.getElementById('menu').style.display = 'none';
        
        // Configurar jugador controlado por usuario
        this.players.forEach(player => {
            player.userData.isUserControlled = 
                (player.userData.team === this.selectedTeam && player.userData.name === 'Tsubasa') ||
                (player.userData.team === this.selectedTeam && player.userData.name === 'Hyuga');
        });
    }

    selectTeam(team) {
        this.selectedTeam = team;
        const buttons = document.querySelectorAll('#team-selection button');
        buttons.forEach(btn => {
            if (btn.onclick.toString().includes(team)) {
                btn.style.background = 'linear-gradient(45deg, #FF9800, #FF5722)';
            } else {
                btn.style.background = 'linear-gradient(45deg, #2196F3, #21CBF3)';
            }
        });
    }

    endGame() {
        this.gameStarted = false;
        
        const winner = this.score.nankatsu > this.score.toho ? 'Nankatsu' : 
                      this.score.toho > this.score.nankatsu ? 'Toho' : 'Empate';
        
        const message = document.createElement('div');
        message.style.position = 'absolute';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.background = 'rgba(0, 0, 0, 0.9)';
        message.style.color = 'white';
        message.style.padding = '40px';
        message.style.borderRadius = '15px';
        message.style.textAlign = 'center';
        message.style.zIndex = '1000';
        message.style.border = '3px solid gold';
        message.innerHTML = `
            <h1>FIN DEL PARTIDO</h1>
            <h2>${winner} ${winner !== 'Empate' ? 'GANA!' : ''}</h2>
            <h3>Nankatsu ${this.score.nankatsu} - ${this.score.toho} Toho</h3>
            <button onclick="location.reload()" style="margin-top: 20px;">
                Jugar de Nuevo
            </button>
        `;
        
        document.getElementById('game-container').appendChild(message);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.update();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Inicializar el juego cuando se cargue la página
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
    game.init();
    
    // Exponer funciones globales
    window.selectTeam = (team) => game.selectTeam(team);
    window.startGame = () => game.startGame();
});
