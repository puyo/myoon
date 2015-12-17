import THREE from 'three';
import threeOrbitControls from 'three-orbit-controls';

const OrbitControls = threeOrbitControls(THREE);

let app = app || {};

app.textureLoader = new THREE.TextureLoader();

app.heightMapPath = "earthcloudmaptrans.jpg";
//app.heightMapPath = "taytay-bump.jpg";
//app.mapPath = "taytay.jpg";
//app.specularMapPath = "earthspec1k.jpg";
//
app.mapPath = app.mapPath || app.heightMapPath;

app.init = function () {
  app.ready = false;
  // Store the Size of the window.
  app.width = window.innerWidth;
  app.height = window.innerHeight;

  // Set the Camera up. ( Field of View, Ratio, Near, Far )
  app.camera = new THREE.PerspectiveCamera( 45, app.width / app.height, 1, 1000 );
  app.camera.position.set(0, 0, 255);
  app.camera.lookAt(new THREE.Vector3(0, 0, 0));

  // Set the Scene up. Then add the camera onto the page.
  app.scene = new THREE.Scene();
  app.scene.add( app.camera );

  // Create the Renderer.
  app.renderer = new THREE.WebGLRenderer();
  // Set the Size of the Renderer.
  app.renderer.setSize( app.width, app.height );
  // Set the Background Color, and it's opacity.
  app.renderer.setClearColor( 0x020202, 1 );

  // Place the renderer onto the page.
  document.body.appendChild( app.renderer.domElement );

  // Use an additional library to be able to control the camera.
  app.controls = new OrbitControls( app.camera, app.renderer.domElement );

  var light = new THREE.AmbientLight( 0xf0f0f0 ); // soft white light
  app.scene.add( light );

  var light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set( 0, 20, 150 );
  app.scene.add(light);

  app.addSphere();
  app.morphSphere();

  app.renderer.render( app.scene, app.camera );
};

app.morphSphere = function() {
  app.textureLoader.load(app.heightMapPath, function(texture) {
    var img = texture.image;
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, img.width, img.height);
    var imgd = context.getImageData(0, 0, img.width, img.height);
    var pix = imgd.data;

    function getColor(x, y, data) {
      var base = (y * img.width + x) * 4;
      var value = data[base + 0] +
        data[base + 1] +
        data[base + 2];
      value = value / 3;
      return value;
    }

    function addHeight(v, height) {
      v.setLength(v.length() + height);
    }

    var geom = app.sphere.geometry;
    var vertices = geom.vertices;
    var n = new THREE.Vector3();
    var x, y, h, u, v, scalar;
    var vertex;
    for (let vertexI = 0; vertexI < vertices.length; vertexI++) {
      vertex = vertices[vertexI];
      n.copy(vertex);
      n.normalize();
      // atan2 range is -PI to +PI
      // atan2 / 2PI range is -0.5 to +0.5
      // u range is 0 to 1
      u = 0.5 + (Math.atan2(n.z, n.x) / (2*Math.PI));
      u = 0.5 - u;
      if (u < 0.5) {
        u += 1.0;
      }

      // asin range is -PI/2 to +PI/2
      // asin / PI range is -0.5 to +0.5
      // v range is 0 to 1
      v = 0.5 - (Math.asin(n.y) / Math.PI);
      scalar = 3;
      h = scalar * getColor(
          Math.floor(u * img.width),
          Math.floor(v * img.height),
          pix) / 256;
      addHeight(vertex, h - 1); // account for water
    }
    geom.verticesNeedUpdate = true;

    app.ready = true;
  });
};

app.addSphere = function() {
  var radius = 75;
  var detail = 7;
  var sphereGeom = THREE.IcosahedronGeometry;
  var geometry = new sphereGeom(radius, detail);

  var material = new THREE.MeshPhongMaterial({
    color: 0x804020,
    shininess: 30,
    //emissive: 0x202020,
    map: app.textureLoader.load(app.mapPath),
  });
  if (app.specularMapPath) {
    material.specularMap = app.textureLoader.load(app.specularMapPath);
    material.specular = new THREE.Color('grey')
  }
  app.sphere = new THREE.Mesh(geometry, material);

  var waterGeom = new sphereGeom(radius, detail);
  var waterTex = new THREE.ImageUtils.loadTexture('water512.jpg');
  waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
  waterTex.repeat.set(5,5);
  var waterMat = new THREE.MeshBasicMaterial( {
    map: waterTex,
    transparent: true,
    opacity: 0.80
  } );
  app.water = new THREE.Mesh(waterGeom, waterMat);
  app.sphere.add(app.water);

  app.scene.add(app.sphere);
};

window.addEventListener("resize", function () {
  // Store the new width and height.
  app.width = window.innerWidth;
  app.height = window.innerHeight;

  // Change the camera's aspect ratio
  app.camera.aspect = app.width / app.height;
  // Update the way that it is representing things in the scene.
  app.camera.updateProjectionMatrix();

  // Set it's new size.
  app.renderer.setSize( app.width, app.height );

  // Rerender the size.
  app.renderer.render( app.scene, app.camera );
});

app.animate = function () {
  if (app.ready) {
    app.sphere.rotation.y += 0.001;
  }
  app.renderer.render( app.scene, app.camera );
  requestAnimationFrame( app.animate );
};
requestAnimationFrame( app.animate );

window.app = app;
window.onload = app.init;
