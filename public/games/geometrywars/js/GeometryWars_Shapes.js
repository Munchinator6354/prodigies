GeometryWars.Shapes = (function() {

  const Constants = {
    RenderLayers: {
      STANDARD: 1,
      BLOOM: 2
    }
  }

  let colors = [
    'red', 'deeppink', 'orange', 'yellow', 'indigo', 'fuchsia', 'green', 'lime', 'aqua', 'blue', 'goldenrod'
  ];

  function createMesh(objectDefinition, startPosition, includeEdges, overrideColor, overrideOpacity) {
    return new Promise(function(resolve, reject) {
      let geometry = objectDefinition.createGeometry();
      let material = new THREE.MeshPhongMaterial({
        color: overrideColor || new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
        transparent: true,
        opacity: overrideOpacity || 1.0
      });
      let obj = new THREE.Object3D();
      let mesh = new THREE.Mesh(geometry, material);
      mesh.layers.enable(Constants.RenderLayers.BLOOM);
      obj.add(mesh);
      if (includeEdges) {
        let edges = new THREE.EdgesGeometry(geometry);
        let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
          color: 0x000000,
          linewidth: 4
        }));
        obj.add(line);
      }
      obj.userData.tweenTarget = {
        position: { x: startPosition.x, y: startPosition.y, z: startPosition.z },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.01, y: 0.01, z: 0.01 },
        opacity: 1.0
      };
      obj.scale.set(0.01, 0.01, 0.01);
      obj.position.copy(startPosition);
      obj.userData.characterID = GeometryWars.Tools.uuidv4();
      resolve(obj);
    });
  }

  const Sphere = {
    name: 'Sphere',
    description: 'The three-dimensional version of a circle.',
    createGeometry: () => new THREE.SphereGeometry(0.1 + (Math.random() * 0.2), 8, 8),
    create: function(position, includeEdges, overrideColor, overrideOpacity) {
      return new Promise(resolve => {
        createMesh(this, position, includeEdges, overrideColor, overrideOpacity).then(mesh => {
          mesh.userData.shapeName = this.name;
          mesh.userData.shapeDescription = this.description;
          resolve(mesh);
        });
      });
    }
  };

  const Tetrahedron = {
    name: 'Tetrahedron',
    description: 'Also known as a triangular pyramid, this geometry consists of four congruent equilateral triangles.',
    sideCount: 4,
    createGeometry: () => new THREE.TetrahedronGeometry(1, 0),
    create: function(position, includeEdges, overrideColor, overrideOpacity) {
      return new Promise(resolve => {
        createMesh(this, position, includeEdges, overrideColor, overrideOpacity).then(mesh => {
          mesh.userData.shapeName = this.name;
          mesh.userData.shapeDescription = this.description;
          mesh.userData.shapeSides = this.sideCount;
          resolve(mesh);
        });
      });
    }
  };

  const Cube = {
    name: 'Cube',
    description: 'A geometry bounded by six equal square faces.',
    sideCount: 6,
    createGeometry: () => new THREE.BoxGeometry(1, 1, 1),
    create: function(position, includeEdges, overrideColor, overrideOpacity) {
      return new Promise(resolve => {
        createMesh(this, position, includeEdges, overrideColor, overrideOpacity).then(mesh => {
          mesh.userData.shapeName = this.name;
          mesh.userData.shapeDescription = this.description;
          mesh.userData.shapeSides = this.sideCount;
          resolve(mesh);
        });
      });
    }
  };

  const Octahedron = {
    name: 'Octahedron',
    description: 'A geometry bounded by eight equilateral triangles.',
    sideCount: 8,
    createGeometry: () => new THREE.OctahedronGeometry(1, 0),
    create: function(position, includeEdges, overrideColor, overrideOpacity) {
      return new Promise(resolve => {
        createMesh(this, position, includeEdges, overrideColor, overrideOpacity).then(mesh => {
          mesh.userData.shapeName = this.name;
          mesh.userData.shapeDescription = this.description;
          mesh.userData.shapeSides = this.sideCount;
          resolve(mesh);
        });
      });
    }
  };

  const Dodecahedron = {
    name: 'Dodecahedron',
    description: 'A geometry bounded by twelve equal faces.',
    sideCount: 12,
    createGeometry: () => new THREE.DodecahedronGeometry(1, 0),
    create: function(position, includeEdges, overrideColor, overrideOpacity) {
      return new Promise(resolve => {
        createMesh(this, position, includeEdges, overrideColor, overrideOpacity).then(mesh => {
          mesh.userData.shapeName = this.name;
          mesh.userData.shapeDescription = this.description;
          mesh.userData.shapeSides = this.sideCount;
          resolve(mesh);
        });
      });
    }
  };

  const Icosahedron = {
    name: 'Icosahedron',
    description: 'A geometry bounded by twenty equal faces.',
    sideCount: 20,
    createGeometry: () => new THREE.IcosahedronGeometry(1, 0),
    create: function(position, includeEdges, overrideColor, overrideOpacity) {
      return new Promise(resolve => {
        createMesh(this, position, includeEdges, overrideColor, overrideOpacity).then(mesh => {
          mesh.userData.shapeName = this.name;
          mesh.userData.shapeDescription = this.description;
          mesh.userData.shapeSides = this.sideCount;
          resolve(mesh);
        });
      });
    }
  };

  return {
    Sphere: Sphere,
    Tetrahedron: Tetrahedron,
    Cube: Cube,
    Octahedron: Octahedron,
    Dodecahedron: Dodecahedron,
    Icosahedron: Icosahedron
  }

})();
