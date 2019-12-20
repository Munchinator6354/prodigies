GeometryWars.Tools = (function() {

  function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  function getPixelPosition(object) {
    let boundingBox = new THREE.Box3().setFromObject(object);
    let vector = new THREE.Vector3(
      object.position.x,
      object.position.y + boundingBox.getSize(new THREE.Vector3(0, 0, 0)).y,
      object.position.z
    );
    vector.project(camera);
    let widthHalf = 0.5 * renderer.context.canvas.width;
    let heightHalf = 0.5 * renderer.context.canvas.height;
    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;
    return {
      x: vector.x,
      y: vector.y
    };
  }

  function dampenVectorChange(start, end, dampeningFactor) {
    return (((start * dampeningFactor) + end) / (dampeningFactor + 1));
  }

  function dampenVector3Change(origin, destination, dampeningFactor) {
    return new THREE.Vector3(
      (origin.x * dampeningFactor + destination.x) / (dampeningFactor + 1),
      (origin.y * dampeningFactor + destination.y) / (dampeningFactor + 1),
      (origin.z * dampeningFactor + destination.z) / (dampeningFactor + 1)
    );
  }

  return {
    uuidv4: uuidv4,
    getPixelPosition: getPixelPosition,
    dampenVectorChange: dampenVectorChange,
    dampenVector3Change: dampenVector3Change
  }

})();
