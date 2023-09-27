export default class PlayerCamera {
  constructor(scene, player, uiLayer) {
    this.scene = scene;
    this.player = player;
    this.uiLayer = uiLayer;
    this.cameras = scene.cameras;
  }

  setupCamera() {
    // Set the camera to follow the player
    this.cameras.main.startFollow(this.player);

    // Zoom the camera
    this.cameras.main.setZoom(4); // 2 is the zoom level, increase to zoom in more

    // Set up a zoom event so the UI layer isn't affected by the camera's zoom
    this.cameras.main.on("zoom", (camera, zoom) => {
      this.uiLayer.setScale(1 / zoom);
    });

    // setup the camera bounds based on the map size
    this.cameras.main.setBounds(-64, -64, 1024 + 128, 1024 + 128);
  }

  zoomOnObject(object, zoomLevel) {
    // Stop following the player
    this.cameras.main.stopFollow();

    // Move the object to the center of the scene
    this.cameras.main.pan(object.x, object.y, 500);

    // Zoom in
    this.cameras.main.zoomTo(zoomLevel, 500);
  }
}
