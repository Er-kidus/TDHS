"use client";

type RoomControlsProps = {
  onReconnect: () => void;
  onSaveSummary: () => void;
  onEndRoom: () => void;
};

export function RoomControls({
  onReconnect,
  onSaveSummary,
  onEndRoom,
}: RoomControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onReconnect}
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white"
      >
        Refresh token
      </button>

      <button
        type="button"
        onClick={onSaveSummary}
        className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950"
      >
        Save summary
      </button>

      <button
        type="button"
        onClick={onEndRoom}
        className="rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-xs font-medium text-rose-100"
      >
        End
      </button>
    </div>
  );
}