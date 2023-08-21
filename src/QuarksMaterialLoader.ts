import {MaterialLoader} from 'three';
import {MeshBasicParticleMaterial} from './materials/MeshBasicParticleMaterial';

export default class QuarksMaterialLoader extends MaterialLoader {
    parse(json: any) {
        if (json.type === 'MeshBasicParticleMaterial') {
            json.type = 'MeshBasicMaterial';
            const material = super.parse(json);
            const particleMaterial = new MeshBasicParticleMaterial();

            particleMaterial.copy(particleMaterial);
            particleMaterial.fromJSON(json);
            return particleMaterial;
        }

        return super.parse(json);
    }
}
