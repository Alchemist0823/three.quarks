import particleWGSL from './shaders/wgsl/particle.wgsl';
import {Matrix4} from 'quarks.core';

interface WebGPUDeviceContext {
    adapter: GPUAdapter;
    device: GPUDevice;
}

export async function initWebGPU(): Promise<WebGPUDeviceContext> {
    const adapter = await navigator.gpu?.requestAdapter();
    if (!adapter) {
        throw 'need a browser that supports WebGPU';
    }
    const device = await adapter?.requestDevice();
    if (!device) {
        throw 'need a browser that supports WebGPU';
    }
    return {
        adapter,
        device,
    };
}

export class WebGPURenderer {
    // simulation
    private numLiveParticles: number = 0;
    simulationUBOBuffer!: GPUBuffer;
    simulationParams!: {
        simulate: boolean;
        deltaTime: number;
    };
    private particlesBuffer!: GPUBuffer;
    private particleIndexBuffer!: GPUBuffer;
    private computeBindGroup!: GPUBindGroup;
    private computePipeline!: GPUComputePipeline;

    // rendering
    private context!: GPUCanvasContext;
    private mvp: Matrix4 = new Matrix4();
    private uniformBuffer!: GPUBuffer;
    private quadVertexBuffer!: GPUBuffer;
    private renderBindGroup!: GPUBindGroup;
    private renderPassDescriptor!: GPURenderPassDescriptor;
    private renderPipeline!: GPURenderPipeline;

    // cpu staging buffer
    public cpuReadableBuffer!: GPUBuffer;

    constructor(
        public deviceContext: WebGPUDeviceContext,
        public canvas: HTMLCanvasElement,
        public numParticles: number,
        public particleInstanceByteSize: number,
        code: string,
        public debug: boolean = false,
        public renderCode: string = ''
    ) {
        this.initBuffers();
        this.initRenderPipeline();
        this.initSimulationPipeline(code);
    }

    initBuffers() {
        this.numLiveParticles = this.numParticles;
        this.particlesBuffer = this.deviceContext.device.createBuffer({
            size: this.numParticles * this.particleInstanceByteSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        });

        this.particleIndexBuffer = this.deviceContext.device.createBuffer({
            size: this.numParticles * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        if (this.debug) {
            this.cpuReadableBuffer = this.deviceContext.device.createBuffer({
                size: this.numParticles * this.particleInstanceByteSize,
                usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
            });
        }

        const particleIndexArr = new Uint32Array(this.numParticles);
        for (let i = 0; i < this.numParticles; i++) {
            particleIndexArr[i] = i;
        }
        if (this.debug) {
            console.log(particleIndexArr);
        }
        this.deviceContext.device.queue.writeBuffer(this.particleIndexBuffer, 0, particleIndexArr);
    }

    initRenderPipeline() {
        const particlePositionOffset = 0;
        const particleColorOffset = 4 * 4;
        const devicePixelRatio = window.devicePixelRatio;
        this.canvas.width = this.canvas.clientWidth * devicePixelRatio;
        this.canvas.height = this.canvas.clientHeight * devicePixelRatio;
        this.context = this.canvas.getContext('webgpu') as GPUCanvasContext;
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        this.context.configure({
            device: this.deviceContext.device,
            format: presentationFormat,
            alphaMode: 'premultiplied',
        });
        const shaderModule = this.deviceContext.device.createShaderModule({
            code: this.renderCode === '' ? particleWGSL : this.renderCode,
        });
        this.renderPipeline = this.deviceContext.device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: shaderModule,
                entryPoint: 'vs_main',
                buffers: [
                    /*{
                        // instanced particles buffer
                        arrayStride: this.particleInstanceByteSize,
                        stepMode: 'instance',
                        attributes: [
                            {
                                // position
                                shaderLocation: 0,
                                offset: particlePositionOffset,
                                format: 'float32x3',
                            },
                            {
                                // color
                                shaderLocation: 1,
                                offset: particleColorOffset,
                                format: 'float32x4',
                            },
                        ],
                    },*/
                    {
                        // quad vertex buffer
                        arrayStride: 2 * 4, // vec2f
                        stepMode: 'vertex',
                        attributes: [
                            {
                                // vertex positions
                                shaderLocation: 0,
                                offset: 0,
                                format: 'float32x2',
                            },
                        ],
                    },
                ],
            },
            fragment: {
                module: shaderModule,
                entryPoint: 'fs_main',
                targets: [
                    {
                        format: presentationFormat,
                        blend: {
                            color: {
                                srcFactor: 'src-alpha',
                                dstFactor: 'one',
                                operation: 'add',
                            },
                            alpha: {
                                srcFactor: 'zero',
                                dstFactor: 'one',
                                operation: 'add',
                            },
                        },
                    },
                ],
            },
            primitive: {
                topology: 'triangle-list',
            },

            depthStencil: {
                depthWriteEnabled: false,
                depthCompare: 'less',
                format: 'depth24plus',
            },
        });

        const depthTexture = this.deviceContext.device.createTexture({
            size: [this.canvas.width, this.canvas.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        const uniformBufferSize =
            4 * 4 * 4 + // modelViewMatrix : mat4x4f
            4 * 4 * 4; // ProjectionMatrix : mat4x4f;
        this.uniformBuffer = this.deviceContext.device.createBuffer({
            size: uniformBufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.renderBindGroup = this.deviceContext.device.createBindGroup({
            layout: this.renderPipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer,
                    },
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.particlesBuffer,
                    },
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this.particleIndexBuffer,
                    },
                },
            ],
        });

        this.renderPassDescriptor = {
            colorAttachments: [
                {
                    view: undefined as any, // Assigned later
                    clearValue: [0, 0, 0, 1],
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
            depthStencilAttachment: {
                view: depthTexture.createView(),

                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            },
        };

        //////////////////////////////////////////////////////////////////////////////
        // Quad vertex buffer
        //////////////////////////////////////////////////////////////////////////////
        this.quadVertexBuffer = this.deviceContext.device.createBuffer({
            size: 6 * 2 * 4, // 6x vec2f
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        // prettier-ignore
        const vertexData = [
            -1.0, -1.0, +1.0, -1.0, -1.0, +1.0, -1.0, +1.0, +1.0, -1.0, +1.0, +1.0,
        ];
        new Float32Array(this.quadVertexBuffer.getMappedRange()).set(vertexData);
        this.quadVertexBuffer.unmap();

        //////////////////////////////////////////////////////////////////////////////
        // Texture
        //////////////////////////////////////////////////////////////////////////////
        /*let texture: GPUTexture;
        let textureWidth = 1;
        let textureHeight = 1;
        let numMipLevels = 1;
        {
            const response = await fetch('../../assets/img/webgpu.png');
            const imageBitmap = await createImageBitmap(await response.blob());

            // Calculate number of mip levels required to generate the probability map
            while (
                textureWidth < imageBitmap.width ||
                textureHeight < imageBitmap.height
                ) {
                textureWidth *= 2;
                textureHeight *= 2;
                numMipLevels++;
            }
            texture = this.deviceContext.device.createTexture({
                size: [imageBitmap.width, imageBitmap.height, 1],
                mipLevelCount: numMipLevels,
                format: 'rgba8unorm',
                usage:
                    GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.STORAGE_BINDING |
                    GPUTextureUsage.COPY_DST |
                    GPUTextureUsage.RENDER_ATTACHMENT,
            });
            this.deviceContext.device.queue.copyExternalImageToTexture(
                {source: imageBitmap},
                {texture: texture},
                [imageBitmap.width, imageBitmap.height]
            );
        }*/
    }

    private initSimulationPipeline(code: string) {
        const simulationUBOBufferSize =
            4 + // deltaTime
            3 * 4 + // padding
            4 * 4;
        this.simulationUBOBuffer = this.deviceContext.device.createBuffer({
            size: simulationUBOBufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.simulationParams = {
            simulate: true,
            deltaTime: 0.01,
        };
        this.computePipeline = this.deviceContext.device.createComputePipeline({
            layout: 'auto',
            compute: {
                module: this.deviceContext.device.createShaderModule({
                    code: code,
                }),
                entryPoint: 'simulate',
            },
        });
        this.computeBindGroup = this.deviceContext.device.createBindGroup({
            layout: this.computePipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.simulationUBOBuffer,
                    },
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.particlesBuffer,
                        offset: 0,
                        size: this.numParticles * this.particleInstanceByteSize,
                    },
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this.particleIndexBuffer,
                        offset: 0,
                        size: this.numParticles * 4,
                    },
                },
                /*{
                    binding: 2,
                    resource: texture.createView(),
                },*/
            ],
        });
    }

    frame = async (camera: any) => {
        this.deviceContext.device.queue.writeBuffer(
            this.simulationUBOBuffer,
            0,
            new Float32Array([
                this.simulationParams.simulate ? this.simulationParams.deltaTime : 0.0,
                0.0,
                0.0,
                0.0, // padding
                Math.random() * 100,
                Math.random() * 100, // seed.xy
                1 + Math.random(),
                1 + Math.random(), // seed.zw
            ])
        );

        this.mvp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        // prettier-ignore
        this.deviceContext.device.queue.writeBuffer(
            this.uniformBuffer,
            0,
            new Float32Array([
                // modelViewProjectionMatrix
                camera.matrixWorldInverse.elements[0], camera.matrixWorldInverse.elements[1], camera.matrixWorldInverse.elements[2], camera.matrixWorldInverse.elements[3],
                camera.matrixWorldInverse.elements[4], camera.matrixWorldInverse.elements[5], camera.matrixWorldInverse.elements[6], camera.matrixWorldInverse.elements[7],
                camera.matrixWorldInverse.elements[8], camera.matrixWorldInverse.elements[9], camera.matrixWorldInverse.elements[10], camera.matrixWorldInverse.elements[11],
                camera.matrixWorldInverse.elements[12], camera.matrixWorldInverse.elements[13], camera.matrixWorldInverse.elements[14], camera.matrixWorldInverse.elements[15],
                camera.projectionMatrix.elements[0], camera.projectionMatrix.elements[1], camera.projectionMatrix.elements[2], camera.projectionMatrix.elements[3],
                camera.projectionMatrix.elements[4], camera.projectionMatrix.elements[5], camera.projectionMatrix.elements[6], camera.projectionMatrix.elements[7],
                camera.projectionMatrix.elements[8], camera.projectionMatrix.elements[9], camera.projectionMatrix.elements[10], camera.projectionMatrix.elements[11],
                camera.projectionMatrix.elements[12], camera.projectionMatrix.elements[13], camera.projectionMatrix.elements[14], camera.projectionMatrix.elements[15],
            ])
        );

        const swapChainTexture = this.context.getCurrentTexture();
        // prettier-ignore
        (this.renderPassDescriptor.colorAttachments as GPURenderPassColorAttachment[])[0]!.view = swapChainTexture.createView();

        const commandEncoder = this.deviceContext.device.createCommandEncoder();
        {
            const passEncoder = commandEncoder.beginComputePass();
            passEncoder.setPipeline(this.computePipeline);
            passEncoder.setBindGroup(0, this.computeBindGroup);
            passEncoder.dispatchWorkgroups(Math.ceil(this.numParticles / 64));
            passEncoder.end();
        }
        {
            const passEncoder = commandEncoder.beginRenderPass(this.renderPassDescriptor);
            passEncoder.setPipeline(this.renderPipeline);
            passEncoder.setBindGroup(0, this.renderBindGroup);
            //passEncoder.set
            //passEncoder.setVertexBuffer(0, this.particlesBuffer);
            passEncoder.setVertexBuffer(0, this.quadVertexBuffer);
            passEncoder.draw(6, this.numLiveParticles, 0, 0);

            passEncoder.end();
        }
        if (this.debug) {
            commandEncoder.copyBufferToBuffer(
                this.particlesBuffer,
                0,
                this.cpuReadableBuffer,
                0,
                this.numParticles * this.particleInstanceByteSize
            );
        }

        this.deviceContext.device.queue.submit([commandEncoder.finish()]);
    };
}
