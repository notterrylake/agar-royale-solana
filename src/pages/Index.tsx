import { GameCanvas } from '@/components/GameCanvas';
import { PhantomWallet } from '@/components/PhantomWallet';

const Index = () => {
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-20">
        <PhantomWallet />
      </div>
      <GameCanvas />
    </div>
  );
};

export default Index;
