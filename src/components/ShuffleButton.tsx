import { Loader2 } from "lucide-react";

interface ShuffleButtonProps {
  onClick: () => void;
  disabled: boolean;
  isShuffling: boolean;
}

const ShuffleButton = ({ onClick, disabled, isShuffling }: ShuffleButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isShuffling}
      className="btn-main text-xl sm:text-2xl flex items-center justify-center gap-3 mx-auto"
    >
      {isShuffling ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Shuffling...
        </>
      ) : (
        "Make My Schedule Interesting."
      )}
    </button>
  );
};

export default ShuffleButton;
