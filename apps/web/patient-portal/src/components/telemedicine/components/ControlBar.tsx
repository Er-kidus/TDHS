import React from 'react';
import { ArrowLeft, Mic, MicOff, PhoneOff, Sparkles, Video, VideoOff, MessageSquare } from 'lucide-react';

export default function ControlBar({
  micEnabled,
  camEnabled,
  screenSharing,
  toggleMic,
  toggleCam,
  toggleScreenShare,
  onOpenOverlay,
  onEndCall,
  sessionElapsed,
}: {
  micEnabled: boolean;
  camEnabled: boolean;
  screenSharing: boolean;
  toggleMic: () => void;
  toggleCam: () => void;
  toggleScreenShare: () => void;
  onOpenOverlay: (tab: 'chat' | 'scribe' | 'details') => void;
  onEndCall: () => void;
  sessionElapsed: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/85 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur">
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-200">
        {sessionElapsed}
      </span>
      <button onClick={toggleMic} className={`rounded-full p-2 transition ${micEnabled ? 'bg-slate-800 hover:bg-slate-700' : 'bg-rose-600/80 hover:bg-rose-600'}`} title={micEnabled ? 'Mute' : 'Unmute'}>
        {micEnabled ? <Mic className="h-4 w-4 text-white" /> : <MicOff className="h-4 w-4 text-white" />}
      </button>
      <button onClick={toggleCam} className={`rounded-full p-2 transition ${camEnabled ? 'bg-slate-800 hover:bg-slate-700' : 'bg-rose-600/80 hover:bg-rose-600'}`} title={camEnabled ? 'Turn off camera' : 'Turn on camera'}>
        {camEnabled ? <Video className="h-4 w-4 text-white" /> : <VideoOff className="h-4 w-4 text-white" />}
      </button>
      <button onClick={toggleScreenShare} className={`rounded-full p-2 transition ${screenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 hover:bg-slate-700'}`} title="Toggle screen share">
        <ArrowLeft className="h-4 w-4 rotate-90 text-white" />
      </button>
      <div className="h-6 w-px bg-white/10" />
      <button onClick={() => onOpenOverlay('chat')} className="rounded-full bg-slate-800 p-2 hover:bg-slate-700" title="Open chat">
        <MessageSquare className="h-4 w-4 text-white" />
      </button>
      <button onClick={() => onOpenOverlay('scribe')} className="rounded-full bg-slate-800 p-2 hover:bg-slate-700" title="Open AI scribe">
        <Sparkles className="h-4 w-4 text-white" />
      </button>
      <div className="h-6 w-px bg-white/10" />
      <button onClick={onEndCall} className="rounded-full bg-rose-600 p-2 transition hover:bg-rose-700" title="End call">
        <PhoneOff className="h-4 w-4 text-white" />
      </button>
    </div>
  );
}
