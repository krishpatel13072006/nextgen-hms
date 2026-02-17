import { Canvas } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, OrbitControls } from '@react-three/drei';

export default function Hero3D() {
  return (
    <div className="h-[500px] w-full cursor-grab">
      <Canvas>
        <ambientLight intensity={1} />
        <directionalLight position={[2, 5, 2]} />
        <Sphere args={[1, 100, 200]} scale={2.4}>
          <MeshDistortMaterial
            color="#3b82f6"
            attach="material"
            distort={0.5}
            speed={2}
            roughness={0}
          />
        </Sphere>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
