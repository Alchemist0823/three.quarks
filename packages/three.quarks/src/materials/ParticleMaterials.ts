import {
    MeshPhysicalMaterial,
    MeshStandardMaterial,
    MeshStandardMaterialParameters,
    WebGLProgramParametersWithUniforms,
    WebGLRenderer,
} from 'three';
import local_particle_physics_vert from '../shaders/local_particle_physics_vert.glsl';

export class ParticleMeshStandardMaterial extends MeshStandardMaterial {
    constructor(parameters: MeshStandardMaterialParameters) {
        super(parameters);
    }

    onBeforeCompile(parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) {
        super.onBeforeCompile(parameters, renderer);
        // only the vertex stage is particle specific (instancing transform + tile uvs). The fragment stage is
        // three.js' own `meshphysical` shader, so lighting stays in sync with the installed three.js version.
        parameters.vertexShader = local_particle_physics_vert;
    }
}

export class ParticleMeshPhysicsMaterial extends MeshPhysicalMaterial {
    constructor(parameters: MeshStandardMaterialParameters) {
        super(parameters);
    }

    onBeforeCompile(parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) {
        super.onBeforeCompile(parameters, renderer);
        // only the vertex stage is particle specific (instancing transform + tile uvs). The fragment stage is
        // three.js' own `meshphysical` shader, so lighting stays in sync with the installed three.js version.
        parameters.vertexShader = local_particle_physics_vert;
    }
}
