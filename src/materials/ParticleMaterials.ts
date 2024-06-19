import {
    MeshPhysicalMaterial,
    MeshStandardMaterial,
    MeshStandardMaterialParameters,
    WebGLProgramParametersWithUniforms,
    WebGLRenderer,
} from 'three';
import local_particle_physics_vert from '../shaders/local_particle_physics_vert.glsl';
import particle_physics_frag from '../shaders/particle_physics_frag.glsl';

export class ParticleMeshStandardMaterial extends MeshStandardMaterial {
    constructor(parameters: MeshStandardMaterialParameters) {
        super(parameters);
    }

    onBeforeCompile(parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) {
        super.onBeforeCompile(parameters, renderer);
        parameters.vertexShader = local_particle_physics_vert;
        parameters.fragmentShader = particle_physics_frag;
    }
}

export class ParticleMeshPhysicsMaterial extends MeshPhysicalMaterial {
    constructor(parameters: MeshStandardMaterialParameters) {
        super(parameters);
    }

    onBeforeCompile(parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) {
        super.onBeforeCompile(parameters, renderer);
        parameters.vertexShader = local_particle_physics_vert;
        parameters.fragmentShader = particle_physics_frag;
    }
}
