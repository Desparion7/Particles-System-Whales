document.addEventListener('DOMContentLoaded', function () {
	const canvas = document.getElementById('canvas1');
	const ctx = canvas.getContext('2d');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
	gradient.addColorStop(0, 'white');
	gradient.addColorStop(1, 'gold');
	ctx.fillStyle = gradient;
	ctx.strokeStyle = gradient;

	class Particle {
		constructor(effect) {
			this.effect = effect;
			this.radius = Math.floor(Math.random() * 6 + 1);
			this.imageSize = this.radius * 8;
			this.halfImageSize = this.imageSize * 0.5;
			this.x =
				this.imageSize +
				Math.random() *
					(this.effect.width + this.effect.maxDistance * 4);
			this.y =
				this.imageSize +
				Math.random() * (this.effect.height - this.imageSize * 2);
			this.vx = -1;
			this.pushX = 0;
			this.pushY = 0;
			this.friction = 0.8;
			this.image = document.getElementById('star');
		}
		draw(context) {
			context.drawImage(
				this.image,
				this.x - this.halfImageSize,
				this.y - this.halfImageSize,
				this.imageSize,
				this.imageSize
			);
		}
		update() {
			if (this.effect.mouse.pressed) {
				const dx = this.x - this.effect.mouse.x;
				const dy = this.y - this.effect.mouse.y;
				const distance = Math.hypot(dx, dy);
				const force = this.effect.mouse.radius / distance;
				if (distance < this.effect.mouse.radius) {
					const angle = Math.atan2(dy, dx);
					this.pushX += Math.cos(angle) * force;
					this.pushY += Math.sin(angle) * force;
				}
			}
			this.x += (this.pushX *= this.friction) + this.vx;
			this.y += this.pushY *= this.friction;

			if (this.x < -this.imageSize - this.effect.maxDistance) {
				this.x =
					this.effect.width +
					this.imageSize +
					this.effect.maxDistance;
				this.y =
					this.imageSize +
					Math.random() * (this.effect.height - this.imageSize * 2);
			}
		}
		reset() {
			this.x =
				this.imageSize +
				Math.random() *
					(this.effect.width + this.effect.maxDistance * 4);
			this.y =
				this.imageSize +
				Math.random() * (this.effect.height - this.imageSize * 2);
		}
	}

	class Whale {
		constructor(effect) {
			this.effect = effect;
			this.x = this.effect.width * 0.4;
			this.y = this.effect.height * 0.5;
			this.image = document.getElementById('whale1');
		}
		draw(context) {
			context.drawImage(
				this.image,
				this.x - this.image.width * 0.5,
				this.y - this.image.height * 0.5
			);
		}
	}
	class Effect {
		constructor(canvas, context) {
			this.canvas = canvas;
			this.context = context;
			this.width = this.canvas.width;
			this.height = this.canvas.height;
			this.particles = [];
			this.numberOfParticles = 500;
			this.maxDistance = 110;
			this.createParticles();
			this.whale = new Whale(this);
			this.mouse = {
				x: this.width * 0.5,
				y: this.height * 0.5,
				pressed: false,
				radius: 120,
			};

			window.addEventListener('resize', (e) => {
				this.resize(e.target.innerWidth, e.target.innerHeight, context);
			});
			window.addEventListener('mousemove', (e) => {
				if (this.mouse.pressed) {
					this.mouse.x = e.x;
					this.mouse.y = e.y;
				}
			});
			window.addEventListener('mousedown', (e) => {
				this.mouse.pressed = true;
				this.mouse.x = e.x;
				this.mouse.y = e.y;
			});
			window.addEventListener('mouseup', (e) => {
				this.mouse.pressed = false;
			});
		}
		createParticles() {
			for (let i = 0; i < this.numberOfParticles; i++) {
				this.particles.push(new Particle(this));
			}
		}
		handleParticles(context) {
			this.connectParticles(context);
			this.particles.forEach((partice) => {
				partice.draw(context);
				partice.update();
			});
			this.whale.draw(context);
		}
		connectParticles(context) {
			for (let a = 0; a < this.particles.length; a++) {
				for (let b = a; b < this.particles.length; b++) {
					const dx = this.particles[a].x - this.particles[b].x;
					const dy = this.particles[a].y - this.particles[b].y;
					const distance = Math.hypot(dx, dy);
					if (distance < this.maxDistance) {
						context.save();
						const opacity = 1 - distance / this.maxDistance;
						context.globalAlpha = opacity;
						context.beginPath();
						context.moveTo(
							this.particles[a].x,
							this.particles[a].y
						);
						context.lineTo(
							this.particles[b].x,
							this.particles[b].y
						);
						context.stroke();
						context.restore();
					}
				}
			}
		}
		resize(width, height) {
			this.canvas.width = width;
			this.canvas.height = height;
			this.width = width;
			this.height = height;
			this.whale.x = this.width * 0.4;
			this.whale.y = this.height * 0.5;
			const gradient = this.context.createLinearGradient(
				0,
				0,
				width,
				height
			);
			gradient.addColorStop(0, 'white');
			gradient.addColorStop(0.5, 'gold');
			gradient.addColorStop(1, 'orangered');
			this.context.fillStyle = gradient;
			this.context.strokeStyle = gradient;
			this.particles.forEach((particle) => {
				particle.reset();
			});
		}
	}

	const effect = new Effect(canvas, ctx);

	function animate() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		effect.handleParticles(ctx);
		requestAnimationFrame(animate);
	}
	animate();
});