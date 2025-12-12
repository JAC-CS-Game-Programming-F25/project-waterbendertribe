// import Sprite from "../../lib/Sprite.js";
// import Vector from "../../lib/Vector.js";
// import { images, input, CANVAS_WIDTH, CANVAS_HEIGHT, matter, world } from "../globals.js";
// import ImageName from "../enums/ImageName.js";

// const { Bodies, Constraint, Composite, Body } = matter;

// export default class PlinkoSquishyCat{
// 	static WIDTH = 32;
// 	static HEIGHT = 32;
// 	static MOVE_SPEED = 340; //how fast to move cat
// 	static SPAWN_Y = 10; //start at top of screen
// 	static PARTICLES = 4; //number of particles to make up the soft body
// 	static PARTICLE_RADIUS = 6;
// 	static CONSTRAINT_STIFFNESS = 0.95;

// 	constructor(map) {
// 		this.map = map;
// 		this.centerX = CANVAS_WIDTH / 2;
// 		this.centerY = PlinkoSquishyCat.SPAWN_Y;

// 		this.sprites = Sprite.generateSpritesFromSpriteSheet(
// 			images.get(ImageName.PlinkoBall),
// 			32,
// 			32
// 		);

// 		this.currentFrame = 0;
// 		this.hasDropped = false;
// 		this.dimensions = new Vector(PlinkoSquishyCat.WIDTH, PlinkoSquishyCat.HEIGHT);
// 		this.rotation = 0;

// 		//create soft body using particles connected with constraints
// 		this.particles = [];
// 		this.constraints = [];
// 		this.composite = Composite.create();

// 		this.createSoftBody();
// 		Composite.add(world, this.composite);
// 	}

// 	createSoftBody() {
// 		const particleRadius = PlinkoSquishyCat.PARTICLE_RADIUS;
// 		const spacing = 16;

// 		//to form body
// 		const positions = [
// 			{ x: this.centerX - spacing/2, y: this.centerY - spacing/2 },
// 			{ x: this.centerX + spacing/2, y: this.centerY - spacing/2 },
// 			{ x: this.centerX - spacing/2, y: this.centerY + spacing/2 },
// 			{ x: this.centerX + spacing/2, y: this.centerY + spacing/2 }
// 		];

// 		//create particle bodies as static so they won't fall until told otherwise
// 		this.particles = positions.map(pos => {

// 			const particle = Bodies.circle(pos.x, pos.y, particleRadius, {

// 				restitution: 0.95,
// 				friction: 0.5,
// 				isStatic: true,
// 				label: 'squishyCatParticle'
// 			});

// 			Composite.add(this.composite, particle);

// 			return particle;
// 		});

// 		//connect particles with constraints to create soft body effect
// 		const constraintLength = spacing;

// 		for (let i = 0; i < this.particles.length - 1; i++) {

// 			for (let j = i + 1; j < this.particles.length; j++) {

// 				const constraint = Constraint.create({

// 					bodyA: this.particles[i],
// 					bodyB: this.particles[j],
// 					length: constraintLength,
// 					stiffness: PlinkoSquishyCat.CONSTRAINT_STIFFNESS,
// 					label: 'squishyCatConstraint'
// 				});

// 				Composite.add(this.composite, constraint);
// 				this.constraints.push(constraint);
// 			}
// 		}
// 	}

// 	update(dt) {

// 		if (!this.hasDropped) {
// 			if (input.isKeyPressed('a')) {
// 				this.centerX -= PlinkoSquishyCat.MOVE_SPEED * dt;
// 			}
// 			if (input.isKeyPressed('d')) {
// 				this.centerX += PlinkoSquishyCat.MOVE_SPEED * dt;
// 			}

// 			//move all particles
// 			this.centerX = Math.max(PlinkoSquishyCat.WIDTH / 2, Math.min(this.centerX, CANVAS_WIDTH - PlinkoSquishyCat.WIDTH / 2));

// 			const offsetX = this.centerX - (this.particles[0].position.x + this.particles[1].position.x) / 2;
// 			this.particles.forEach(particle => {
// 				Body.setPosition(particle, { x: particle.position.x + offsetX, y: particle.position.y });
// 			});
// 		}

// 		if (input.isKeyPressed('Enter') && !this.hasDropped) {
// 			this.hasDropped = true;

// 			this.particles.forEach(particle => {
// 				Body.setStatic(particle, false);
// 				Body.setVelocity(particle, { x: 0, y: 5 });
// 			});
// 		}

// 		//fallen off bottom of screen
// 		const avgY = this.particles.reduce((sum, p) => sum + p.position.y, 0) / this.particles.length;
// 		if (avgY > CANVAS_HEIGHT + 50) {
// 			this.resetCat();
// 		}

// 		//update center position from particles
// 		this.centerX = this.particles.reduce((sum, p) => sum + p.position.x, 0) / this.particles.length;
// 		this.centerY = this.particles.reduce((sum, p) => sum + p.position.y, 0) / this.particles.length;

// 		if (this.hasDropped) {
// 			const avgVelocityY = this.particles.reduce((sum, p) => sum + p.velocity.y, 0) / this.particles.length;
// 			this.rotation += (avgVelocityY * 0.01);
// 		}
// 	}

// 	render(context) {
// 		if (this.sprites.length > 0) {
// 			context.save();

// 			context.translate(this.centerX, this.centerY);
// 			context.rotate(this.rotation);
// 			context.translate(-this.centerX, -this.centerY);

// 			//sprite at center
// 			this.sprites[this.currentFrame].render(
// 				Math.floor(this.centerX - PlinkoSquishyCat.WIDTH / 2),
// 				Math.floor(this.centerY - PlinkoSquishyCat.HEIGHT / 2)
// 			);

// 			if (!this.hasDropped) {
// 				context.fillStyle = 'white';
// 				context.font = '12px Arial';
// 				context.fillText('A/D to move, ENTER to drop', 50, 20);
// 			}
// 			context.restore();
// 		}
// 	}

// 	resetCat() {

// 		Composite.remove(world, this.composite);

// 		//reset center position
// 		this.centerX = CANVAS_WIDTH / 2;
// 		this.centerY = PlinkoSquishyCat.SPAWN_Y;
// 		this.hasDropped = false;
// 		this.rotation = 0;

// 		this.particles = [];
// 		this.constraints = [];
// 		this.composite = Composite.create();
// 		this.createSoftBody();
// 		Composite.add(world, this.composite);
// 	}
// }
