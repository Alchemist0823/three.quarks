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
  color.a = color.a * max(1.0 - length(in.quad_pos), 0.0);
  return color;
}
