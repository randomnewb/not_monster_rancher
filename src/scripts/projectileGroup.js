class ProjectileGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);

    this.createMultiple({
      classType: Projectile,
      frameQuantity: 200,
      active: false,
      visible: false,
      key: "projectiles",
    });
  }

  fireProjectile(x, y, direction) {
    // Get the first available sprite in the group
    const projectile = this.getFirstDead(false);
    if (projectile) {
      projectile.fire(x, y, direction);
    }
  }
}

class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "projectiles", 1);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    const camera = this.scene.cameras.main;

    // Check if the projectile is within the camera's world view
    if (!camera.worldView.contains(this.x, this.y)) {
      this.setActive(false);
      this.setVisible(false);

      // Stop the timer if it's still running
      if (this.lifespan) {
        this.lifespan.remove(false);
      }
    }
  }

  fire(x, y, direction) {
    this.body.reset(x, y);

    this.body.setSize(15, 15);

    this.setActive(true);
    this.setVisible(true);

    const speed = 200;
    this.setVelocityX(direction.x * speed);
    this.setVelocityY(direction.y * speed);

    // Calculate the angle between the player and the entity
    const angle = Phaser.Math.RadToDeg(
      Phaser.Math.Angle.BetweenPoints({ x: 0, y: 0 }, direction)
    );

    const OFFSET = 45.0;

    // Adjust the angle
    const adjustedAngle = angle + OFFSET;

    // Set the rotation of the projectile sprite
    this.setAngle(adjustedAngle);

    this.lifespan = this.scene.time.addEvent({
      delay: 350, // milliseconds
      callback: () => {
        // When the timer completes, deactivate and hide the projectile
        this.setActive(false);
        this.setVisible(false);
      },
      loop: false, // Do not repeat the timer when it completes
    });
  }

  disable() {
    this.setActive(false);
  }
}

export { ProjectileGroup, Projectile };
