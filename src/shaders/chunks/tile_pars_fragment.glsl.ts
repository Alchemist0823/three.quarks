export default /* glsl */ `
#if defined( USE_UV ) || defined( USE_ANISOTROPY )

\tvarying vec2 vUv;
#ifdef TILE_BLEND
    varying vec2 vUvNext;
    varying float vUvBlend;
#endif

#endif
#ifdef USE_MAP

\tuniform mat3 mapTransform;
\tvarying vec2 vMapUv;
#ifdef TILE_BLEND
    varying vec2 vMapUvNext;
#endif

#endif
#ifdef USE_ALPHAMAP

\tuniform mat3 alphaMapTransform;
\tvarying vec2 vAlphaMapUv;

#endif
#ifdef USE_LIGHTMAP

\tuniform mat3 lightMapTransform;
\tvarying vec2 vLightMapUv;

#endif
#ifdef USE_AOMAP

\tuniform mat3 aoMapTransform;
\tvarying vec2 vAoMapUv;

#endif
#ifdef USE_BUMPMAP

\tuniform mat3 bumpMapTransform;
\tvarying vec2 vBumpMapUv;

#endif
#ifdef USE_NORMALMAP

\tuniform mat3 normalMapTransform;
\tvarying vec2 vNormalMapUv;

#endif
#ifdef USE_DISPLACEMENTMAP

\tuniform mat3 displacementMapTransform;
\tvarying vec2 vDisplacementMapUv;

#endif
#ifdef USE_EMISSIVEMAP

\tuniform mat3 emissiveMapTransform;
\tvarying vec2 vEmissiveMapUv;

#endif
#ifdef USE_METALNESSMAP

\tuniform mat3 metalnessMapTransform;
\tvarying vec2 vMetalnessMapUv;

#endif
#ifdef USE_ROUGHNESSMAP

\tuniform mat3 roughnessMapTransform;
\tvarying vec2 vRoughnessMapUv;

#endif
#ifdef USE_ANISOTROPYMAP

\tuniform mat3 anisotropyMapTransform;
\tvarying vec2 vAnisotropyMapUv;

#endif
#ifdef USE_CLEARCOATMAP

\tuniform mat3 clearcoatMapTransform;
\tvarying vec2 vClearcoatMapUv;

#endif
#ifdef USE_CLEARCOAT_NORMALMAP

\tuniform mat3 clearcoatNormalMapTransform;
\tvarying vec2 vClearcoatNormalMapUv;

#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP

\tuniform mat3 clearcoatRoughnessMapTransform;
\tvarying vec2 vClearcoatRoughnessMapUv;

#endif
#ifdef USE_SHEEN_COLORMAP

\tuniform mat3 sheenColorMapTransform;
\tvarying vec2 vSheenColorMapUv;

#endif
#ifdef USE_SHEEN_ROUGHNESSMAP

\tuniform mat3 sheenRoughnessMapTransform;
\tvarying vec2 vSheenRoughnessMapUv;

#endif
#ifdef USE_IRIDESCENCEMAP

\tuniform mat3 iridescenceMapTransform;
\tvarying vec2 vIridescenceMapUv;

#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP

\tuniform mat3 iridescenceThicknessMapTransform;
\tvarying vec2 vIridescenceThicknessMapUv;

#endif
#ifdef USE_SPECULARMAP

\tuniform mat3 specularMapTransform;
\tvarying vec2 vSpecularMapUv;

#endif
#ifdef USE_SPECULAR_COLORMAP

\tuniform mat3 specularColorMapTransform;
\tvarying vec2 vSpecularColorMapUv;

#endif
#ifdef USE_SPECULAR_INTENSITYMAP

\tuniform mat3 specularIntensityMapTransform;
\tvarying vec2 vSpecularIntensityMapUv;

#endif
#ifdef USE_TRANSMISSIONMAP

\tuniform mat3 transmissionMapTransform;
\tvarying vec2 vTransmissionMapUv;

#endif
#ifdef USE_THICKNESSMAP

\tuniform mat3 thicknessMapTransform;
\tvarying vec2 vThicknessMapUv;

#endif
`