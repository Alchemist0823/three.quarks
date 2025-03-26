export const MESH_SURFACE_GEOMETRY ={
  "metadata": {
    "version": 4.5,
    "type": "Object",
    "generator": "Object3D.toJSON"
  },
  "geometries": [
    {
      "uuid": "c4e56c65-fdbd-4c94-b975-030db5a07ac3",
      "type": "BufferGeometry",
      "data": {
        "attributes": {
          "position": {
            "itemSize": 3,
            "type": "Float32Array",
            "array": [
              5, 1, -1, 5, 1, -1, 5, 1, -1, 5, -1, -1, 5, -1, -1, 5, -1, -1, 5, 1, 1, 5, 1, 1, 5, 1, 1, 5, -1, 1, 5, -1,
              1, 5, -1, 1, -5, 1, -1, -5, 1, -1, -5, 1, -1, -5, -1, -1, -5, -1, -1, -5, -1, -1, -5, 1, 1, -5, 1, 1, -5,
              1, 1, -5, -1, 1, -5, -1, 1, -5, -1, 1
            ],
            "normalized": false
          },
          "normal": {
            "itemSize": 3,
            "type": "Float32Array",
            "array": [
              0, 0, -1, 0, 1, 0, 1, 0, 0, 0, -1, 0, 0, 0, -1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, -1, 0, 0, 0, 1, 1,
              0, 0, -1, 0, 0, 0, 0, -1, 0, 1, 0, -1, 0, 0, 0, -1, 0, 0, 0, -1, -1, 0, 0, 0, 0, 1, 0, 1, 0, -1, 0, 0, 0,
              -1, 0, 0, 0, 1
            ],
            "normalized": false
          },
          "uv": {
            "itemSize": 2,
            "type": "Float32Array",
            "array": [
              0.625, 0.5, 0.625, 0.5, 0.625, 0.5, 0.375, 0.5, 0.375, 0.5, 0.375, 0.5, 0.625, 0.25, 0.625, 0.25, 0.625,
              0.25, 0.375, 0.25, 0.375, 0.25, 0.375, 0.25, 0.625, 0.75, 0.625, 0.75, 0.875, 0.5, 0.375, 0.75, 0.125,
              0.5, 0.375, 0.75, 0.625, 1, 0.625, 0, 0.875, 0.25, 0.375, 1, 0.125, 0.25, 0.375, 0
            ],
            "normalized": false
          }
        },
        "index": {
          "type": "Uint16Array",
          "array": [
            1, 14, 20, 1, 20, 7, 10, 6, 19, 10, 19, 23, 21, 18, 12, 21, 12, 15, 16, 3, 9, 16, 9, 22, 5, 2, 8, 5, 8, 11,
            17, 13, 0, 17, 0, 4
          ]
        },
        "boundingSphere": {
          "center": [0, 0, 0],
          "radius": 5.196152422706632
        }
      }
    }, {
      "uuid": "249719e4-53d5-4493-a646-6704afc19240",
      "type": "PlaneGeometry",
      "width": 1,
      "height": 1,
      "widthSegments": 1,
      "heightSegments": 1
    }
  ],
  "materials": [
    {
      "uuid": "ec504cbf-c29a-43e7-8b33-aede78103505",
      "type": "MeshStandardMaterial",
      "name": "Material",
      "color": 13421772,
      "roughness": 0.4000000059604645,
      "metalness": 0,
      "emissive": 0,
      "envMapIntensity": 1,
      "side": 2,
      "depthFunc": 3,
      "depthTest": true,
      "depthWrite": true,
      "colorWrite": true,
      "stencilWrite": false,
      "stencilWriteMask": 255,
      "stencilFunc": 519,
      "stencilRef": 0,
      "stencilFuncMask": 255,
      "stencilFail": 7680,
      "stencilZFail": 7680,
      "stencilZPass": 7680
    }
  ],
  "textures": [
    {
      "uuid": "7d9396fb-8329-4479-9705-4029bfa2b00f",
      "name": "./textures/texture1.png",
      "image": "ad2a8b8a-4f6a-4273-bc60-e1c72a3f6421",
      "mapping": 300,
      "repeat": [1, 1],
      "offset": [0, 0],
      "center": [0, 0],
      "rotation": 0,
      "wrap": [1001, 1001],
      "format": 1023,
      "type": 1009,
      "encoding": 3000,
      "minFilter": 1008,
      "magFilter": 1006,
      "anisotropy": 1,
      "flipY": true,
      "premultiplyAlpha": false,
      "unpackAlignment": 4
    }
  ],
  "images": [
    {
      "uuid": "ad2a8b8a-4f6a-4273-bc60-e1c72a3f6421",
      "url": ""
    }
  ],
  "object": {
    "uuid": "166b0d03-c092-43f2-b0f0-f289ebc0c40e",
    "type": "Group",
    "name": "Scene",
    "layers": 1,
    "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    "children": [
      {
        "uuid": "033201fa-746f-4b36-a01e-2bdcac900dbc",
        "type": "Mesh",
        "name": "Cube",
        "userData": {
          "name": "Cube",
          "triangleIndexToArea": [0, 10, 20, 30, 40, 42, 44, 54, 64, 66, 68, 78, 88]
        },
        "layers": 1,
        "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        "geometry": "c4e56c65-fdbd-4c94-b975-030db5a07ac3",
        "material": "ec504cbf-c29a-43e7-8b33-aede78103505"
      }, {
        "uuid": "a1fe1cfc-01d3-446b-9ca5-bf7947caa731",
        "type": "ParticleEmitter",
        "layers": 1,
        "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        "ps": {
          "autoDestroy": false,
          "looping": true,
          "duration": 1,
          "shape": {
            "type": "mesh_surface",
            "geometry": "c4e56c65-fdbd-4c94-b975-030db5a07ac3"
          },
          "startLife": {
            "type": "ConstantValue",
            "value": 5
          },
          "startSpeed": {
            "type": "ConstantValue",
            "value": 10
          },
          "startRotation": {
            "type": "ConstantValue",
            "value": 0
          },
          "startSize": {
            "type": "ConstantValue",
            "value": 1
          },
          "startColor": {
            "type": "ConstantColor",
            "color": {
              "r": 1,
              "g": 1,
              "b": 1,
              "a": 1
            }
          },
          "emissionOverTime": {
            "type": "ConstantValue",
            "value": 10
          },
          "emissionOverDistance": {
            "type": "ConstantValue",
            "value": 0
          },
          "emissionBursts": [],
          "onlyUsedByOther": false,
          "instancingGeometry": "249719e4-53d5-4493-a646-6704afc19240",
          "renderOrder": 0,
          "renderMode": 0,
          "rendererEmitterSettings": {},
          "speedFactor": 0,
          "texture": "7d9396fb-8329-4479-9705-4029bfa2b00f",
          "startTileIndex": {
            "type": "ConstantValue",
            "value": 0
          },
          "uTileCount": 10,
          "vTileCount": 10,
          "blending": 2,
          "behaviors": [],
          "worldSpace": true
        },
        "children": []
      }
    ]
  }
};


export const SUB_PS_GEOMETRY = {
  "metadata": {
    "version": 4.5,
    "type": "Object",
    "generator": "Object3D.toJSON"
  },
  "geometries": [
    {
      "uuid": "966d7158-443f-46b8-bb30-adde64da2254",
      "type": "PlaneGeometry",
      "width": 1,
      "height": 1,
      "widthSegments": 1,
      "heightSegments": 1
    }
  ],
  "textures": [
    {
      "uuid": "1d125184-50c1-4b78-b84e-cea04418a1fa",
      "name": "./textures/texture1.png",
      "image": "ad2a8b8a-4f6a-4273-bc60-e1c72a3f6421",
      "mapping": 300,
      "repeat": [1, 1],
      "offset": [0, 0],
      "center": [0, 0],
      "rotation": 0,
      "wrap": [1001, 1001],
      "format": 1023,
      "type": 1009,
      "encoding": 3000,
      "minFilter": 1008,
      "magFilter": 1006,
      "anisotropy": 1,
      "flipY": true,
      "premultiplyAlpha": false,
      "unpackAlignment": 4
    }
  ],
  "images": [
    {
      "uuid": "ad2a8b8a-4f6a-4273-bc60-e1c72a3f6421",
      "url": ""
    }
  ],
  "object": {
    "uuid": "e5ad792b-a005-42ce-88cb-8901f65485b4",
    "type": "Group",
    "layers": 1,
    "matrix": [1, 0, 0, 0, 0, 2.220446049250313e-16, -1, 0, 0, 1, 2.220446049250313e-16, 0, 10, 10, 0, 1],
    "children": [
      {
        "uuid": "c7654a65-6a5a-4238-9360-f9148512ce6f",
        "type": "ParticleEmitter",
        "name": "p",
        "layers": 1,
        "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        "ps": {
          "autoDestroy": false,
          "looping": true,
          "duration": 1,
          "maxParticle": 10000,
          "shape": {
            "type": "cone",
            "radius": 10,
            "arc": 6.283185307179586,
            "thickness": 1,
            "angle": 0.5235987755982988
          },
          "startLife": {
            "type": "ConstantValue",
            "value": 5
          },
          "startSpeed": {
            "type": "ConstantValue",
            "value": 10
          },
          "startRotation": {
            "type": "ConstantValue",
            "value": 0
          },
          "startSize": {
            "type": "ConstantValue",
            "value": 1
          },
          "startColor": {
            "type": "ConstantColor",
            "color": {
              "r": 1,
              "g": 1,
              "b": 1,
              "a": 1
            }
          },
          "emissionOverTime": {
            "type": "ConstantValue",
            "value": 1
          },
          "emissionOverDistance": {
            "type": "ConstantValue",
            "value": 0
          },
          "emissionBursts": [],
          "onlyUsedByOther": false,
          "instancingGeometry": "966d7158-443f-46b8-bb30-adde64da2254",
          "renderOrder": 0,
          "renderMode": 0,
          "rendererEmitterSettings": {},
          "speedFactor": 0,
          "texture": "1d125184-50c1-4b78-b84e-cea04418a1fa",
          "startTileIndex": {
            "type": "ConstantValue",
            "value": 0
          },
          "uTileCount": 10,
          "vTileCount": 10,
          "blending": 2,
          "behaviors": [
            {
              "type": "EmitSubParticleSystem",
              "subParticleSystem": "ff01f1fb-d9d4-4a6d-8407-fe14ae770eae",
              "useVelocityAsBasis": true
            }
          ],
          "worldSpace": true
        },
        "children": []
      }, {
        "uuid": "ff01f1fb-d9d4-4a6d-8407-fe14ae770eae",
        "type": "ParticleEmitter",
        "name": "c",
        "layers": 1,
        "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        "ps": {
          "autoDestroy": false,
          "looping": true,
          "duration": 1,
          "maxParticle": 10000,
          "shape": {
            "type": "cone",
            "radius": 1,
            "arc": 6.283185307179586,
            "thickness": 1,
            "angle": 0.5235987755982988
          },
          "startLife": {
            "type": "ConstantValue",
            "value": 5
          },
          "startSpeed": {
            "type": "ConstantValue",
            "value": 1
          },
          "startRotation": {
            "type": "ConstantValue",
            "value": 0
          },
          "startSize": {
            "type": "ConstantValue",
            "value": 0.2
          },
          "startColor": {
            "type": "ConstantColor",
            "color": {
              "r": 0.9058823529411765,
              "g": 0.12156862745098039,
              "b": 0.12156862745098039,
              "a": 1
            }
          },
          "emissionOverTime": {
            "type": "ConstantValue",
            "value": 10
          },
          "emissionOverDistance": {
            "type": "ConstantValue",
            "value": 0
          },
          "emissionBursts": [],
          "onlyUsedByOther": true,
          "instancingGeometry": "966d7158-443f-46b8-bb30-adde64da2254",
          "renderOrder": 0,
          "renderMode": 0,
          "rendererEmitterSettings": {},
          "speedFactor": 0,
          "texture": "1d125184-50c1-4b78-b84e-cea04418a1fa",
          "startTileIndex": {
            "type": "ConstantValue",
            "value": 0
          },
          "uTileCount": 10,
          "vTileCount": 10,
          "blending": 2,
          "behaviors": [],
          "worldSpace": false
        },
        "children": []
      }
    ]
  }
};

export const QUARKS_PREFAB = {
  "metadata": {
    "version": 4.6,
    "type": "Object",
    "generator": "Object3D.toJSON"
  },
  "geometries": [
    {
      "uuid": "2e990b74-d4c9-457c-853a-466bd67eb97c",
      "type": "PlaneGeometry",
      "width": 1,
      "height": 1,
      "widthSegments": 1,
      "heightSegments": 1
    }
  ],
  "materials": [
    {
      "uuid": "90e10bd7-4289-4967-923e-fab92e1dfe49",
      "type": "MeshBasicMaterial",
      "color": 65280,
      "envMapRotation": [
        0,
        0,
        0,
        "XYZ"
      ],
      "reflectivity": 1,
      "refractionRatio": 0.98,
      "blendColor": 0
    }
  ],
  "animations": [
    {
      "name": "test",
      "duration": 1,
      "tracks": [
        {
          "name": ".position",
          "times": [
            0,
            1
          ],
          "values": [
            0,
            0,
            0,
            1,
            1,
            1
          ],
          "type": "number"
        }
      ],
      "uuid": "5696936e-2930-4e3b-b72e-8a0e48004911",
      "blendMode": 2500
    }
  ],
  "object": {
    "uuid": "0bb45b12-f9dc-4012-bf9e-6c8068f4fca6",
    "type": "QuarksPrefab",
    "layers": 1,
    "matrix": [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ],
    "up": [
      0,
      1,
      0
    ],
    "children": [
      {
        "uuid": "159858fb-01dc-47b3-9583-8ae3fa903a2d",
        "type": "ParticleEmitter",
        "layers": 1,
        "matrix": [
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          1
        ],
        "up": [
          0,
          1,
          0
        ],
        "ps": {
          "version": "3.0",
          "autoDestroy": false,
          "looping": true,
          "prewarm": false,
          "duration": 1,
          "shape": {
            "type": "sphere",
            "radius": 10,
            "arc": 6.283185307179586,
            "thickness": 1,
            "mode": 0,
            "spread": 0,
            "speed": {
              "type": "ConstantValue",
              "value": 1
            }
          },
          "startLife": {
            "type": "ConstantValue",
            "value": 5
          },
          "startSpeed": {
            "type": "ConstantValue",
            "value": 0
          },
          "startRotation": {
            "type": "ConstantValue",
            "value": 0
          },
          "startSize": {
            "type": "ConstantValue",
            "value": 1
          },
          "startColor": {
            "type": "ConstantColor",
            "color": {
              "r": 1,
              "g": 1,
              "b": 1,
              "a": 1
            }
          },
          "emissionOverTime": {
            "type": "ConstantValue",
            "value": 10
          },
          "emissionOverDistance": {
            "type": "ConstantValue",
            "value": 0
          },
          "emissionBursts": [],
          "onlyUsedByOther": false,
          "instancingGeometry": "2e990b74-d4c9-457c-853a-466bd67eb97c",
          "renderOrder": 0,
          "renderMode": 0,
          "rendererEmitterSettings": {},
          "material": "90e10bd7-4289-4967-923e-fab92e1dfe49",
          "layers": 1,
          "startTileIndex": {
            "type": "ConstantValue",
            "value": 0
          },
          "uTileCount": 1,
          "vTileCount": 1,
          "blendTiles": false,
          "softParticles": false,
          "softFarFade": 0,
          "softNearFade": 0,
          "behaviors": [],
          "worldSpace": false
        }
      },
      {
        "uuid": "ebad60d3-a9c3-42a0-ac16-9605c99d4040",
        "type": "Object3D",
        "layers": 1,
        "matrix": [
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          1
        ],
        "up": [
          0,
          1,
          0
        ],
        "animations": [
          "5696936e-2930-4e3b-b72e-8a0e48004911"
        ]
      }
    ],
    "animationData": [
      {
        "startTime": 0,
        "duration": 1,
        "type": "three",
        "targetUUID": "ebad60d3-a9c3-42a0-ac16-9605c99d4040",
        "clipUUID": "5696936e-2930-4e3b-b72e-8a0e48004911",
        "loop": false
      },
      {
        "startTime": 0,
        "duration": 2,
        "type": "ps",
        "targetUUID": "159858fb-01dc-47b3-9583-8ae3fa903a2d",
        "loop": false
      }
    ]
  }
}