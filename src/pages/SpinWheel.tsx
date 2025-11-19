import { useState } from 'react';
import { SpinningWheel } from '@/components/SpinningWheel';
import { PhantomWallet } from '@/components/PhantomWallet';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';

export default function SpinWheel() {
  const [walletPublicKey, setWalletPublicKey] = useState<PublicKey | null>(null);
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="absolute top-4 left-4">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Game
        </Button>
      </div>

      <div className="absolute top-4 right-4">
        <PhantomWallet onWalletChange={setWalletPublicKey} />
      </div>

      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold text-foreground">Lucky Spin Wheel</h1>
        <SpinningWheel walletPublicKey={walletPublicKey} />
      </div>
    </div>
  );
}
