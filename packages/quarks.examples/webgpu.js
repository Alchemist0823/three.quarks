import {WebGPURenderer, initWebGPU, NodeGraph, Node, NodeTypes, NodeValueType, Wire, WebGPUCompiler} from "quarks.nodes";
import {PerspectiveCamera, Vector3} from "three";


const renderCode = `
////////////////////////////////////////////////////////////////////////////////
// Vertex shader
////////////////////////////////////////////////////////////////////////////////
struct RenderParams {
  modelViewMatrix : mat4x4f,
  projectionMatrix : mat4x4f,
}

struct Particle {
    color: vec4<f32>,
    position: vec3<f32>,
    velocity: vec3<f32>,
    size: f32,
    rotation: f32,
    life: f32,
    age: f32,
}

@group(0) @binding(0) var<uniform> render_params : RenderParams;
@group(0) @binding(1) var<storage, read> particles: array<Particle>;
@group(0) @binding(2) var<storage, read> particleIndices: array<u32>;

struct VertexInput {
  /*@location(0) position : vec3f,
  @location(1) color : vec4f,*/
  @builtin(instance_index) instanceIndex: u32,
  @location(0) quad_pos : vec2f, // -1..+1
}

struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) color : vec4f,
  @location(1) quad_pos : vec2f, // -1..+1
}

@vertex
fn vs_main(in : VertexInput) -> VertexOutput {
  var particle = particles[particleIndices[in.instanceIndex]];
  var alignedPosition = ( in.quad_pos.xy ) * particle.size;
  var rotatedPosition = vec2f(
    cos( particle.rotation ) * alignedPosition.x - sin( particle.rotation ) * alignedPosition.y,
    sin( particle.rotation ) * alignedPosition.x + cos( particle.rotation ) * alignedPosition.y,
  );
  
  var mvPosition = render_params.modelViewMatrix * vec4f(particle.position, 1.0);
  
  var out : VertexOutput;
  out.position = render_params.projectionMatrix * vec4(mvPosition.xy + rotatedPosition, mvPosition.zw);
  out.color = particle.color;
  out.quad_pos = in.quad_pos;
  return out;
}

////////////////////////////////////////////////////////////////////////////////
// Fragment shader
////////////////////////////////////////////////////////////////////////////////
@fragment
fn fs_main(in : VertexOutput) -> @location(0) vec4f {
  var color = in.color;
  // Apply a circular particle alpha mask
  // color.a = color.a * max(1.0 - length(in.quad_pos), 0.0);
  return color;
}

`;
initWebGPU().then((context) => {
    const graph = new NodeGraph('test');

    const sizeVal = new Node(NodeTypes['number'], 0);
    const size = new Node(NodeTypes['particleProperty'], 0, {property: 'size', type: NodeValueType.Number});
    sizeVal.inputs[0] = {getValue: () => 1};
    graph.addNode(sizeVal);
    graph.addNode(size);
    graph.addWire(new Wire(sizeVal, 0, size, 0));

    const rotationValue = new Node(NodeTypes['number'], 0);
    const rotation = new Node(NodeTypes['particleProperty'], 0, {property: 'rotation', type: NodeValueType.Number});
    rotationValue.inputs[0] = {getValue: () => 1};
    graph.addNode(rotationValue);
    graph.addNode(rotation);
    graph.addWire(new Wire(rotationValue, 0, rotation, 0));

    const colorVec = new Node(NodeTypes['vec4'], 0);
    const color = new Node(NodeTypes['particleProperty'], 0, {property: 'color', type: NodeValueType.Vec4});
    colorVec.inputs[0] = {getValue: () => 1};
    colorVec.inputs[1] = {getValue: () => 1};
    colorVec.inputs[2] = {getValue: () => 1};
    colorVec.inputs[3] = {getValue: () => 0.5};
    graph.addNode(colorVec);
    graph.addNode(color);
    graph.addWire(new Wire(colorVec, 0, color, 0));

    const age = new Node(NodeTypes['particleProperty'], 0, {property: 'age', type: NodeValueType.Number});
    graph.addNode(age);
    const cos = new Node(NodeTypes['cos'], 0);
    graph.addNode(cos);
    const pos = new Node(NodeTypes['vec3'], 0);
    pos.inputs[0] = {getValue: () => 0};
    pos.inputs[1] = {getValue: () => 1};
    pos.inputs[2] = {getValue: () => 1};
    graph.addNode(pos);
    graph.addWire(new Wire(age, 0, cos, 0));
    graph.addWire(new Wire(cos, 0, pos, 0));

    const pos2 = new Node(NodeTypes['vec3'], 0);
    pos2.inputs[0] = {getValue: () => 1};
    pos2.inputs[1] = {getValue: () => 0.5};
    pos2.inputs[2] = {getValue: () => 0.5};
    graph.addNode(pos2);
    const add = new Node(NodeTypes['add'], 2);
    graph.addNode(add);
    graph.addWire(new Wire(pos, 0, add, 0));
    graph.addWire(new Wire(pos2, 0, add, 1));

    const ppos = new Node(NodeTypes['particleProperty'], 0, {property: 'position', type: NodeValueType.Vec3});
    graph.addNode(ppos);
    const pvel = new Node(NodeTypes['particleProperty'], 0, {property: 'velocity', type: NodeValueType.Vec3});
    graph.addNode(pvel);
    graph.addWire(new Wire(add, 0, ppos, 0));
    graph.addWire(new Wire(pos2, 0, pvel, 0));

    const compiler = new WebGPUCompiler();
    const particle = { position: new Vector3(), velocity: new Vector3(), age: 10 };
    const graphContext = { particle: particle };

    const code = compiler.build(graph, graphContext);
    console.log(code);
    console.log(compiler.particleInstanceByteSize);

    const debug = false;
    const count = 64;
    const canvas = document.getElementById('renderer-canvas');
    const renderer = new WebGPURenderer(
        context,
        canvas,
        count,
        compiler.particleInstanceByteSize,
        code,
        debug,
        renderCode
    );
    const camera = new PerspectiveCamera(
        (2 * Math.PI) / 5 * 180 / Math.PI,
        canvas.width / canvas.height,
        1,
        100.0
    );
    camera.position.z = 10;
    camera.rotateX(Math.PI * 0.05);
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();
    console.log(camera.matrixWorldInverse.elements);
    console.log(camera.projectionMatrix.elements);
    console.log(renderer.mvp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).elements);

    let frameCount = 0;
    function animate() {
        renderer.frame(camera);

        if (frameCount % 20 === 0 && debug) {
            renderer.cpuReadableBuffer.mapAsync(
                GPUMapMode.READ,
                0, // Offset
                count * compiler.particleInstanceByteSize, // Length
            ).then(() => {
                const copyArrayBuffer = renderer.cpuReadableBuffer.getMappedRange(0, count * compiler.particleInstanceByteSize);
                const data = copyArrayBuffer.slice(0);
                renderer.cpuReadableBuffer.unmap();
                console.log(new Float32Array(data))
            });
        }
        frameCount ++;
        requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    //document.body.appendChild(renderer.domElement);
});