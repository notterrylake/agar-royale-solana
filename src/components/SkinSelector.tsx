import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import pepeImg from '@/assets/skins/pepe.png';
import dogeImg from '@/assets/skins/doge.png';
import shibaImg from '@/assets/skins/shiba.png';
import animeImg from '@/assets/skins/anime.webp';

export type SkinType = 'pepe' | 'doge' | 'shiba' | 'anime';

interface SkinSelectorProps {
  selectedSkin: SkinType | null;
  onSelectSkin: (skin: SkinType) => void;
  onConfirm: () => void;
  onBack: () => void;
}

const SKINS = [
  { id: 'pepe' as SkinType, name: 'Pepe', image: pepeImg },
  { id: 'doge' as SkinType, name: 'Doge', image: dogeImg },
  { id: 'shiba' as SkinType, name: 'Shiba', image: shibaImg },
  { id: 'anime' as SkinType, name: 'Don\'t Tread', image: animeImg },
];

export const SkinSelector = ({ selectedSkin, onSelectSkin, onConfirm, onBack }: SkinSelectorProps) => {
  return (
    <Card className="p-10 space-y-6 bg-card/80 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/10 animate-scale-in">
      <h2 className="text-3xl font-extrabold text-center text-foreground uppercase tracking-tight">Choose Your Skin</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {SKINS.map((skin) => (
          <button
            key={skin.id}
            onClick={() => onSelectSkin(skin.id)}
            className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
              selectedSkin === skin.id
                ? 'border-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                : 'border-white/20 hover:border-white/40 bg-white/5'
            }`}
          >
            <img
              src={skin.image}
              alt={skin.name}
              className="w-full h-auto rounded-lg"
            />
            <p className="mt-2 text-sm font-bold text-white uppercase tracking-wide">{skin.name}</p>
          </button>
        ))}
      </div>

      <div className="space-y-3 pt-4">
        <Button
          onClick={onConfirm}
          disabled={!selectedSkin}
          className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold uppercase tracking-wide shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Skin
        </Button>
        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground hover:bg-white/5"
        >
          Back
        </Button>
      </div>
    </Card>
  );
};

export const getSkinImage = (skin: SkinType | null) => {
  switch (skin) {
    case 'pepe': return pepeImg;
    case 'doge': return dogeImg;
    case 'shiba': return shibaImg;
    case 'anime': return animeImg;
    default: return null;
  }
};
