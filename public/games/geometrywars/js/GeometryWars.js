GeometryWars = (function() {

  const Constants = {
    RenderLayers: {
      STANDARD: 1,
      BLOOM: 2
    },
    Camera: {
      fov: 60,
      renderDistance: {
        near: 0.01,
        far: 1000
      },
      rotation: {
        horizontal: {
          default: 0
        },
        vertical: {
          minimum: Math.PI / 2 * 0.30,
          maximum: Math.PI / 2 * 0.90,
          default: Math.PI / 2 * 0.70
        }
      },
      defaultHeight: 30,
      movementOffset: 2,
      offsetDampening: 20
    }
  };
  let GUIController = {
    enableBloomRendering: true
  };
  let CameraState = {
    fov: 60,
    position: { x: 0, y: 0, z: Constants.Camera.defaultHeight },
    target: { x: 0, y: 0, z: 1 }
  };
  let ControlState = {
    verticalInputChanged: false,
    horizontalInputChanged: false,
    current: {
      movingLeft: false, movingRight: false, movingUp: false, movingDown: false
    },
    previous: {
      movingLeft: false, movingRight: false, movingUp: false, movingDown: false
    }
  };

  let gui;
  let canvas, scene, camera, mouse, renderer, renderCall, raycaster, lights;
  let bloomLayer, bloomMaskMaterial, bloomMaterialStore, bloomPass, bloomComposer, finalPass, finalComposer, fxaaPass;
  let mainCharacter;
  let characters = new Set();
  let food = new Set();

  function init() {
    THREE.Cache.enabled = true;
    canvas = document.getElementById('canvas');
    scene = new THREE.Scene();
    setListeners();
    initCamera();
    initScene();
    initLighting();
    initGUI();
    setTimeout(function() {
      titleSequence();
      renderScene();
    }, 10);
  }
  function setListeners() {
    window.addEventListener('resize', clientResize, false);
  }
  function initGUI() {
    gui = new dat.GUI();
    gui.close();
    gui.folders = {};
    gui.folders.rendering = gui.addFolder('Rendering');
    gui.add(GUIController, 'enableBloomRendering').listen().name('Enable Bloom');
    gui.folders.bloom = gui.addFolder('Bloom Parameters');
    gui.add(bloomPass, 'exposure').listen().name('Exposure');
    gui.add(bloomPass, 'threshold').listen().name('Threshold');
    gui.add(bloomPass, 'strength').listen().name('Strength');
    gui.add(bloomPass, 'radius').listen().name('Radius');
    gui.folders.ambientLight = gui.addFolder('Ambient Light');
    gui.add(lights['ambient'], 'visible').listen().name('Active');
    gui.add(lights['ambient'], 'intensity', 0, 1, 0.01).listen().name('Intensity');
    gui.folders.hemisphereLight = gui.addFolder('Hemisphere Light');
    gui.add(lights['hemisphere'], 'visible').listen().name('Active');
    gui.add(lights['hemisphere'], 'intensity', 0, 1, 0.01).listen().name('Intensity');
    gui.folders.functions = gui.addFolder('Functions');
    gui.add({ printCharacters: function() { console.log(characters); } }, 'printCharacters').name('printCharacters()');
    gui.add({ printCharacterIDs: function() { [...characters].map(character => console.log(character.userData.characterID)); } }, 'printCharacterIDs').name('printCharacterIDs()');
  }
  function initCamera() {
    camera = new THREE.PerspectiveCamera(
      Constants.Camera.fov,
      window.innerWidth / window.innerHeight,
      Constants.Camera.renderDistance.near,
      Constants.Camera.renderDistance.far
    );
  }
  function initScene() {
    scene.background = new THREE.Color('rgb(2, 2, 2)');
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvas
    });
    renderer.toneMapping = THREE.CineonToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomLayer = new THREE.Layers();
    bloomLayer.set(Constants.RenderLayers.BLOOM);
    bloomMaskMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
    bloomMaterialStore = {};
    renderCall = new THREE.RenderPass(scene, camera);
    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.exposure = 1.00;
    bloomPass.threshold = 0.00;
    bloomPass.strength = 0.96;
    bloomPass.radius = 3.00;
    // TODO: replace FXAA with SMAA
    fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
    fxaaPass.uniforms['resolution'].value.set((1 / window.innerWidth), (1 / window.innerHeight));
    fxaaPass.renderToScreen = true;
    bloomComposer = new THREE.EffectComposer(renderer);
    bloomComposer.addPass(renderCall);
    bloomComposer.addPass(bloomPass);
    bloomComposer.addPass(fxaaPass);
    finalPass = new THREE.ShaderPass(
      new THREE.ShaderMaterial( {
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture }
        },
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,
        defines: {}
      } ), "baseTexture"
    );
    finalPass.needsSwap = true;
    finalComposer = new THREE.EffectComposer(renderer);
    finalComposer.addPass(renderCall);
    finalComposer.addPass(finalPass);
    finalComposer.addPass(fxaaPass);
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
  }
  let gridHelper;
  function initLighting() {
    lights = {};
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    lights['ambient'] = ambientLight;
    scene.add(ambientLight);
    let hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.8);
    lights['hemisphere'] = hemisphereLight;
    scene.add(hemisphereLight);
    var size = 10000;
    var divisions = 10000;
    gridHelper = new THREE.GridHelper( size, divisions );
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = -2;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    scene.add(gridHelper);
  }
  function titleSequence() {
    setTimeout(function() {
      let title = [...'Geometry Wars'];
      let count = 0;
      let lastText = '';
      while (title.length) {
        count++;
        let newText = lastText + title.shift();
        lastText = newText;
        setTimeout(function() {
          $('span.title').text(newText);
        }, (count * 100));
      }
    }, 3000);
    setTimeout(populateTitleScreen, 4000);
    setTimeout(function() {
      $('#canvas').css('opacity', '1');
    }, 1000);
  }

  function startAnimationSequence() {
    let animationInterval = 4000;
    setInterval(function() {
      // return;
      scene.traverse(child => {
        if (child.type !== 'Object3D') return;
        let desiredScale = 1 + ((Math.random() * 0.4) - 0.2);
        let scaleReference = {
          x: child.scale.x,
          y: child.scale.y,
          z: child.scale.z
        };
        let scalingTween = new TWEEN.Tween(scaleReference)
          .to({
            x: desiredScale * ((child.userData && child.userData.scaleFactor) ? child.userData.scaleFactor : 1.0),
            y: desiredScale * ((child.userData && child.userData.scaleFactor) ? child.userData.scaleFactor : 1.0),
            z: desiredScale * ((child.userData && child.userData.scaleFactor) ? child.userData.scaleFactor : 1.0)
          }, animationInterval)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(() => {
            child.scale.set(scaleReference.x, scaleReference.y, scaleReference.z);
          })
          .start();
        let rotationReference = {
          x: child.rotation.x,
          y: child.rotation.y,
          z: child.rotation.z
        };
        let rotationTween = new TWEEN.Tween(rotationReference)
          .to({
            x: Math.random() * Math.PI,
            y: Math.random() * Math.PI,
            z: Math.random() * Math.PI
          }, animationInterval)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(() => {
            child.rotation.set(rotationReference.x, rotationReference.y, rotationReference.z);
          })
          .start();
        let positionReference = {
          x: child.position.x,
          y: child.position.y,
          z: child.position.z
        };
        let positionTween = new TWEEN.Tween(positionReference)
          .to({
            x: child.position.x + (Math.random() * 10) - 5,
            y: child.position.y + (Math.random() * 10) - 5,
            z: child.position.z
          }, animationInterval)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(() => {
            child.position.set(positionReference.x, positionReference.y, positionReference.z);
          })
          .start();
      });
    }, animationInterval);
  }

  function updateRotationDampening(object) {
    if (object.userData && object.userData.desiredRotation) {
      object.rotation.set(
        GeometryWars.Tools.dampenVectorChange(object.rotation.x, object.userData.desiredRotation.x, 1),
        GeometryWars.Tools.dampenVectorChange(object.rotation.x, object.userData.desiredRotation.x, 1),
        GeometryWars.Tools.dampenVectorChange(object.rotation.x, object.userData.desiredRotation.x, 1)
      );
    }
  }

  function updateCollisions() {
    food.forEach(foodItem => {
      let distance = mainCharacter.position.distanceTo(foodItem.position);
      if (distance < 2) {
        consumeFood(foodItem);
      }
    });
    characters.forEach(character => {
      if (character === mainCharacter) return;
      let distance = mainCharacter.position.distanceTo(character.position);
      if (distance < 2) {
        if (character.userData.shapeSides < mainCharacter.userData.shapeSides) {
          consumeCharacter(character);
        } else {
          alert('You were eaten by another shape!  Better luck next time.');
          window.location.reload(false);
        }
      }
    })
  }

  function consumeFood(foodItem) {
    food.delete(foodItem);
    let tween = new TWEEN.Tween(foodItem.userData.tweenTarget)
      .to({ opacity: 0.0 }, 250)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => { foodItem.children[0].material.opacity = foodItem.userData.tweenTarget.opacity; })
      .onComplete(() => {
        scene.remove(foodItem);
        increaseMainCharacterStrength();
      })
      .start();
  }

  function consumeCharacter(character) {
    characters.delete(character);
    let tween = new TWEEN.Tween(character.userData.tweenTarget)
      .to({ opacity: 0.0 }, 250)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => { character.children[0].material.opacity = character.userData.tweenTarget.opacity; })
      .onComplete(() => {
        scene.remove(character);
        increaseMainCharacterStrength(4);
      })
      .start();
  }

  function increaseMainCharacterStrength(amount) {
    let shapesArray = [
      GeometryWars.Shapes.Tetrahedron,
      GeometryWars.Shapes.Cube,
      GeometryWars.Shapes.Octahedron,
      GeometryWars.Shapes.Dodecahedron,
      GeometryWars.Shapes.Icosahedron
    ];
    mainCharacter.userData.strength += (amount || 1);
    let strengthLevel = mainCharacter.userData.strength;
    for (let i = shapesArray.length - 1; i >= 0; i--) {
      let newShape = shapesArray[i];
      let sides = newShape.sideCount;
      let threshold = sides * 2;
      if (mainCharacter.userData.strength >= threshold) {
        if (mainCharacter.userData.shapeName !== newShape.name) {
          scene.remove(mainCharacter);
          characters.delete(mainCharacter);
          newShape.create(mainCharacter.position.clone(), true, new THREE.Color('white')).then(shape => {
            mainCharacter = shape;
            mainCharacter.userData.scaleFactor = 1.5;
            mainCharacter.userData.strength = strengthLevel;
            characters.add(mainCharacter);
            scene.add(mainCharacter);
            let tween = new TWEEN.Tween(mainCharacter.userData.tweenTarget.scale)
              .to({ x: 1, y: 1, z: 1 }, 2000)
              .easing(TWEEN.Easing.Cubic.Out)
              .onUpdate(() => { mainCharacter.scale.set(mainCharacter.userData.tweenTarget.scale.x, mainCharacter.userData.tweenTarget.scale.y, mainCharacter.userData.tweenTarget.scale.z); })
              .start();
          });
        }
        break;
      }
    }
    // if ((strengthLevel > 10) && (mainCharacter.userData.shapeName !== 'Icosahedron')) {
    //   // remove mainchar from scene, then:
    //   scene.remove(mainCharacter);
    //   characters.delete(mainCharacter);
    //   GeometryWars.Shapes.Icosahedron.create(mainCharacter.position.clone(), true, new THREE.Color('white')).then(icosa => {
    //     mainCharacter = icosa;
    //     mainCharacter.userData.scaleFactor = 1.5;
    //     mainCharacter.userData.strength = strengthLevel;
    //     scene.add(mainCharacter);
    //     let tween = new TWEEN.Tween(mainCharacter.userData.tweenTarget.scale)
    //       .to({ x: 1, y: 1, z: 1 }, 2000)
    //       .easing(TWEEN.Easing.Cubic.Out)
    //       .onUpdate(() => { mainCharacter.scale.set(mainCharacter.userData.tweenTarget.scale.x, mainCharacter.userData.tweenTarget.scale.y, mainCharacter.userData.tweenTarget.scale.z); })
    //       .start();
    //     characters.add(mainCharacter);
    //   });
    // }
  }

  function testFunction() {
    console.log('eaten');
  }

  function renderScene(time) {
    // Update our control input registers and animation handlers
    kd.tick();
    TWEEN.update(time);
    applyControlInputs();
    // If the player's character has been added to the scene, update it and check for collisions
    if (mainCharacter) {
      mainCharacter.position.set(CameraState.target.x, CameraState.target.y, CameraState.target.z);
      updateCollisions();
    }
    // Update the camera and transitions, render the scene, and request the next frame
    updateCamera();
    scene.traverse(updateRotationDampening);
    GUIController.enableBloomRendering ? renderEffectPasses() : renderer.render(scene, camera);
    requestAnimationFrame(renderScene);
  }
  function renderEffectPasses() {
    scene.traverse(darkenNonBloomed);
    bloomComposer.render();
    scene.traverse(restoreMaterial);
    finalComposer.render();
  }
  function updateCamera() {
    camera.position.set(
      GeometryWars.Tools.dampenVectorChange(camera.position.x, CameraState.position.x, Constants.Camera.offsetDampening),
      GeometryWars.Tools.dampenVectorChange(camera.position.y, CameraState.position.y, Constants.Camera.offsetDampening),
      GeometryWars.Tools.dampenVectorChange(camera.position.z, CameraState.position.z, Constants.Camera.offsetDampening)
    );
    camera.lookAt(
      GeometryWars.Tools.dampenVectorChange(CameraState.target.x, CameraState.target.x, Constants.Camera.offsetDampening),
      GeometryWars.Tools.dampenVectorChange(CameraState.target.y, CameraState.target.y, Constants.Camera.offsetDampening),
      GeometryWars.Tools.dampenVectorChange(CameraState.target.z, CameraState.target.z, Constants.Camera.offsetDampening)
    );
    camera.updateProjectionMatrix();
  }

  function applyControlInputs() {
    // ControlState.horizontalInputChanged = (ControlState.current.movingLeft !== ControlState.previous.movingLeft) || (ControlState.current.movingRight !== ControlState.previous.movingRight);
    // ControlState.verticalInputChanged = (ControlState.current.movingLeft !== ControlState.previous.movingLeft) || (ControlState.current.movingRight !== ControlState.previous.movingRight);
    if (ControlState.current.movingLeft && !ControlState.current.movingRight) {
      CameraState.position.x = CameraState.target.x + Constants.Camera.movementOffset;
      CameraState.target.x -= 0.1;
    } else if (ControlState.current.movingRight) {
      CameraState.position.x = CameraState.target.x - Constants.Camera.movementOffset;
      CameraState.target.x += 0.1;
    } else {
      CameraState.position.x = CameraState.target.x;
    }
    if (ControlState.current.movingUp && !ControlState.current.movingDown) {
      CameraState.position.y = CameraState.target.y - Constants.Camera.movementOffset;
      CameraState.target.y += 0.1;
    } else if (ControlState.current.movingDown) {
      CameraState.position.y = CameraState.target.y + Constants.Camera.movementOffset;
      CameraState.target.y -= 0.1;
    } else {
      CameraState.position.y = CameraState.target.y;
    }
    ControlState.previous.movingLeft = ControlState.current.movingLeft;
    ControlState.previous.movingRight = ControlState.current.movingRight;
    ControlState.previous.movingUp = ControlState.current.movingUp;
    ControlState.previous.movingDown = ControlState.current.movingDown;
  }

  kd.A.down(() => { ControlState.current.movingLeft = true; });
  kd.A.up(() => { ControlState.current.movingLeft = false; });
  kd.D.down(() => { ControlState.current.movingRight = true; });
  kd.D.up(() => { ControlState.current.movingRight = false; });
  kd.W.down(() => { ControlState.current.movingUp = true; });
  kd.W.up(() => { ControlState.current.movingUp = false; });
  kd.S.down(() => { ControlState.current.movingDown = true; });
  kd.S.up(() => { ControlState.current.movingDown = false; });

  function darkenNonBloomed(obj) {
    if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
      bloomMaterialStore[obj.uuid] = obj.material;
      obj.material = bloomMaskMaterial;
    }
  }
  function restoreMaterial(obj) {
    if (bloomMaterialStore[obj.uuid]) {
      obj.material = bloomMaterialStore[obj.uuid];
      delete bloomMaterialStore[obj.uuid];
    }
  }

  function getCharacterObjectById(id) {
    // return [...characters].filter(character => character.userData.characterID === id);
    let result;
    characters.forEach(function(character) {
      if (!result && character.userData.characterID === id) result = character;
    });
    return result;
  }

  function clientResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  init();

  function populateTitleScreen() {
    startAnimationSequence()
    let shapesArray = [
      GeometryWars.Shapes.Tetrahedron,
      GeometryWars.Shapes.Cube,
      GeometryWars.Shapes.Octahedron,
      GeometryWars.Shapes.Dodecahedron,
      GeometryWars.Shapes.Icosahedron
    ];
    let introDuration = 4 * 1000;
    let introEasing = TWEEN.Easing.Cubic.Out;
    GeometryWars.Shapes.Tetrahedron.create(new THREE.Vector3(0, 0, 0), true, new THREE.Color('white')).then(tetra => {
      mainCharacter = tetra;
      mainCharacter.userData.scaleFactor = 1.5;
      mainCharacter.userData.strength = 1;
      scene.add(mainCharacter);
      let tween = new TWEEN.Tween(mainCharacter.userData.tweenTarget.scale)
        .to({ x: 1, y: 1, z: 1 }, introDuration)
        .easing(introEasing)
        .onUpdate(() => { mainCharacter.scale.set(mainCharacter.userData.tweenTarget.scale.x, mainCharacter.userData.tweenTarget.scale.y, mainCharacter.userData.tweenTarget.scale.z); })
        .start();
      characters.add(mainCharacter);
    });
    for (let i = 0; i < 125; i++) {
      let randomShape = shapesArray[Math.floor(Math.random() * shapesArray.length)];
      setTimeout(function() {
        let randomPosition = new THREE.Vector3((Math.random() * 100) - 50, (Math.random() * 100) - 50, 0);
        randomShape.create(randomPosition, true, false, 0.8).then(shapeObject => {
          scene.add(shapeObject);
          let tween = new TWEEN.Tween(shapeObject.userData.tweenTarget.scale)
            .to({ x: 1, y: 1, z: 1 }, introDuration)
            .easing(TWEEN.Easing.Back.Out)
            .onUpdate(() => { shapeObject.scale.set(shapeObject.userData.tweenTarget.scale.x, shapeObject.userData.tweenTarget.scale.y, shapeObject.userData.tweenTarget.scale.z); })
            .start();
          characters.add(shapeObject);
        });
      }, Math.random() * 6000);
    }
    for (let i = 0; i < 500; i++) {
      let sphere = GeometryWars.Shapes.Sphere;
      setTimeout(function() {
        let randomPosition = new THREE.Vector3((Math.random() * 100) - 50, (Math.random() * 100) - 50, 0);
        sphere.create(randomPosition, false, new THREE.Color('white'), 0.6).then(shapeObject => {
          scene.add(shapeObject);
          let tween = new TWEEN.Tween(shapeObject.userData.tweenTarget.scale)
            .to({ x: 1, y: 1, z: 1 }, introDuration)
            .easing(introEasing)
            .onUpdate(() => { shapeObject.scale.set(shapeObject.userData.tweenTarget.scale.x, shapeObject.userData.tweenTarget.scale.y, shapeObject.userData.tweenTarget.scale.z); })
            .start();
          food.add(shapeObject);
        });
      }, Math.random() * 4000);
    }
  }

  return {};

})();
