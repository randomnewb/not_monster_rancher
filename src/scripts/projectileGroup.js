class ProjectileGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);

    this.createMultiple({
      classType: Projectile,
      frameQuantity: 50,
      active: false,
      visible: false,
      key: "projectile",
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
    super(scene, x, y, "projectile", 0);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    const camera = this.scene.cameras.main;

    // Check if the projectile is within the camera's world view
    if (!camera.worldView.contains(this.x, this.y)) {
      console.log("projectile out of bounds");
      this.setActive(false);
      this.setVisible(false);
    }
  }

  fire(x, y, direction) {
    this.body.reset(x, y);

    this.setActive(true);
    this.setVisible(true);

    this.setVelocity();

    const speed = 900;
    this.setVelocityX(direction.x * speed);
    this.setVelocityY(direction.y * speed);
  }
}

export { ProjectileGroup, Projectile };
