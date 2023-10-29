export default class PlayerCamera {
  constructor(scene, player, uiLayer) {
    this.scene = scene;
    this.player = player;
    this.uiLayer = uiLayer;
    this.cameras = scene.cameras;
  }

  setupCamera() {
    this.cameras.main.startFollow(this.player);

    this.cameras.main.setZoom(4);

    // Set up a zoom event so the UI layer isn't affected by the camera's zoom
    this.cameras.main.on("zoom", (camera, zoom) => {
      this.uiLayer.setScale(1 / zoom);
    });

    // setup the camera bounds based on the map size
    this.cameras.main.setBounds(-64, -64, 1024 + 128, 1024 + 128);
  }
}
