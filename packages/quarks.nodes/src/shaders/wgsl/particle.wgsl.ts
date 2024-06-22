export default `
////////////////////////////////////////////////////////////////////////////////
// Vertex shader
////////////////////////////////////////////////////////////////////////////////
struct RenderParams {
  modelViewProjectionMatrix : mat4x4f,
  right : vec3<f32>,
  up : vec3<f32>
}

struct Particle {
    color: vec4<f32>,
    position: vec3<f32>,
    velocity: vec3<f32>,
    life: f32,
    age: f32,
}

@group(0) @binding(0) var<uniform> render_params : RenderParams;
@group(0) @binding(1) var<storage, read> particles: array<Particle>;
@group(0) @binding(2) var<storage, read> particleIndices: array<u32>;

struct VertexInput {
  /*@location(0) position : vec3f,
  @location(1) color : vec4f,*/
  @location(0) quad_pos : vec2f, // -1..+1
  @builtin(instance_index) instanceIndex: u32,
}

struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) color : vec4f,
  @location(1) quad_pos : vec2f, // -1..+1
}

@vertex
fn vs_main(in : VertexInput) -> VertexOutput {
  var quad_pos = mat2x3f(render_params.right, render_params.up) * in.quad_pos;
  
  var particle = particles[particleIndices[in.instanceIndex]];
  var position = particle.position + quad_pos * 0.01;
  var out : VertexOutput;
  out.position = render_params.modelViewProjectionMatrix * vec4f(position, 1.0);
  out.color = particle.color;
  out.quad_pos = in.quad_pos;
  return out;
}

////////////////////////////////////////////////////////////////////////////////
// Fragment shader
////////////////////////////////////////////////////////////////////////////////
@fragment
fn fs_main(in : VertexOutput) -> @location(0) vec4f {
  var color = vec4<f32>(1.0, 0.0, 0.0, 1.0); //in.color;
  // Apply a circular particle alpha mask
  color.a = color.a * max(1.0 - length(in.quad_pos), 0.0);
  return color;
}

`;