import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface SpinningWheelProps {
  walletPublicKey: PublicKey | null;
}

export const SpinningWheel = ({ walletPublicKey }: SpinningWheelProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const SPIN_COST = 0.01; // SOL
  const SLICES = 20;
  const WINNING_SLICE = 10; // Position of the "Win" reward
  const SLICE_ANGLE = 360 / SLICES;

  const handleSpin = async () => {
    if (!walletPublicKey) {
      toast.error('Please connect your Phantom wallet first');
      return;
    }

    if (isSpinning) return;

    try {
      setIsSpinning(true);

      // Get Phantom provider
      const provider = (window as any).phantom?.solana;
      if (!provider) {
        toast.error('Phantom wallet not found');
        setIsSpinning(false);
        return;
      }

      // Create Solana connection (mainnet-beta for production, devnet for testing)
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

      // Treasury wallet address (replace with your actual wallet)
      const treasuryPublicKey = new PublicKey('11111111111111111111111111111111');

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: walletPublicKey,
          toPubkey: treasuryPublicKey,
          lamports: SPIN_COST * LAMPORTS_PER_SOL,
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPublicKey;

      // Sign and send transaction
      const signed = await provider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      toast.success('Payment successful! Spinning...');

      // Determine result (5% chance to win)
      const isWin = Math.random() < 0.05;
      const targetSlice = isWin ? WINNING_SLICE : Math.floor(Math.random() * (SLICES - 1)) + (WINNING_SLICE >= Math.floor(Math.random() * (SLICES - 1)) ? 1 : 0);
      
      // Calculate rotation
      const spins = 5 + Math.random() * 3; // 5-8 full spins
      const targetAngle = targetSlice * SLICE_ANGLE;
      const finalRotation = rotation + (360 * spins) + targetAngle;

      setRotation(finalRotation);

      // Wait for spin to complete
      setTimeout(() => {
        setIsSpinning(false);
        if (isWin) {
          toast.success('🎉 Congratulations! You won!');
        } else {
          toast.info('Better luck next time!');
        }
      }, 4000);

    } catch (error: any) {
      console.error('Spin error:', error);
      if (error.message?.includes('User rejected')) {
        toast.error('Transaction cancelled');
      } else {
        toast.error('Failed to process payment');
      }
      setIsSpinning(false);
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border shadow-lg">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-center text-foreground">Lucky Spin</h3>
        
        <div className="relative w-64 h-64 mx-auto">
          {/* Wheel container */}
          <div 
            ref={wheelRef}
            className="absolute inset-0 rounded-full border-4 border-primary shadow-xl overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            {/* Create 20 slices */}
            {Array.from({ length: SLICES }).map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-full origin-center"
                style={{
                  transform: `rotate(${i * SLICE_ANGLE}deg)`,
                }}
              >
                <div
                  className={`absolute w-0 h-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
                    i === WINNING_SLICE ? 'border-l-[128px] border-r-[128px] border-b-[128px]' : 'border-l-[128px] border-r-[128px] border-b-[128px]'
                  }`}
                  style={{
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderBottomColor: i === WINNING_SLICE ? 'hsl(var(--primary))' : i % 2 === 0 ? 'hsl(var(--muted))' : 'hsl(var(--muted-foreground) / 0.3)',
                    transform: 'rotate(180deg)',
                  }}
                />
                {i === WINNING_SLICE && (
                  <div
                    className="absolute text-[10px] font-bold text-primary-foreground whitespace-nowrap"
                    style={{
                      top: '60%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) rotate(90deg)',
                    }}
                  >
                    Win
                  </div>
                )}
              </div>
            ))}
            
            {/* Center circle */}
            <div className="absolute inset-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 bg-background rounded-full border-2 border-primary flex items-center justify-center">
              <div className="text-xs font-bold text-foreground">SPIN</div>
            </div>
          </div>

          {/* Pointer */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary z-10 drop-shadow-lg" />
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Cost: <span className="font-semibold text-foreground">{SPIN_COST} SOL</span>
          </p>
          <Button
            onClick={handleSpin}
            disabled={isSpinning || !walletPublicKey}
            className="w-full h-11 bg-primary hover:bg-primary/90 font-semibold"
          >
            {isSpinning ? 'Spinning...' : walletPublicKey ? 'Spin the Wheel' : 'Connect Wallet'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
