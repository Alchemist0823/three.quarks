import { createParticleGraph1 } from "./GraphUtil";
import { Vector3 } from "three";
import {WebGPUCompiler} from '../../src/nodes';
import {Particle} from 'quarks.core';

describe('WebGPUCompiler', () => {
  test('Interpreter particle properties', () => {

    const graph = createParticleGraph1();
    const compiler = new WebGPUCompiler();
    const particle = {position: new Vector3(), velocity: new Vector3(), age: 10} as unknown as Particle;
    const context = { particle: particle };

    console.log(compiler.build(graph, context));

  });
});
