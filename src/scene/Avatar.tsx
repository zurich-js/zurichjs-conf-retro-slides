import type * as THREE from 'three'
import { SURFACES as S } from './venue'

/**
 * A standing volunteer, in the same simple avatar language as the booth
 * operators: capsules and spheres, no faces. Team shirt, lanyard and the
 * badge they would wear (texture from the badge painter). Local origin at the feet, facing +z.
 */
export function StandingAvatar(
  { x, y, z, yaw = 0, tee = S.teamShirt, badge }: { x: number; y: number; z: number; yaw?: number; tee?: string; badge?: THREE.Texture },
) {
  return (
    <group position={[x, y, z]} rotation-y={yaw}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.1, 0.44, 0]}>
          <capsuleGeometry args={[0.07, 0.74, 4, 10]} />
          <meshStandardMaterial color={S.avatarPants} roughness={0.9} />
        </mesh>
      ))}
      <mesh position-y={1.2}>
        <capsuleGeometry args={[0.18, 0.4, 6, 14]} />
        <meshStandardMaterial color={tee} roughness={0.9} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.25, 1.12, 0.02]} rotation-z={s * 0.08}>
          <capsuleGeometry args={[0.05, 0.5, 4, 10]} />
          <meshStandardMaterial color={tee} roughness={0.9} />
        </mesh>
      ))}
      <mesh position-y={1.6}>
        <sphereGeometry args={[0.11, 20, 14]} />
        <meshStandardMaterial color={S.avatarSkin} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.63, -0.015]} scale={[1.04, 0.85, 1.04]}>
        <sphereGeometry args={[0.112, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={S.avatarHair} roughness={0.9} />
      </mesh>
      {/* Lanyard and badge on the chest. */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.06, 1.3, 0.19]} rotation-z={s * 0.35}>
          <boxGeometry args={[0.02, 0.3, 0.004]} />
          <meshStandardMaterial color={S.paper} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 1.08, 0.2]}>
        <planeGeometry args={[0.1, 0.155]} />
        {badge ? <meshStandardMaterial map={badge} roughness={0.6} /> : <meshStandardMaterial color={S.badgeOrange} roughness={0.6} />}
      </mesh>
    </group>
  )
}
