import React from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import ParticipantGridView from './ParticipantGridView';
import ControlBar from './ControlBar';
import ChatPanel from './ChatPanel';

export default function FullscreenRoomLayout({
  token,
  serverUrl,
  roomInstanceKey,
  effectiveVideoOption,
  effectiveAudioOption,
  sessionElapsed,
  micEnabled,
  camEnabled,
  toggleMic,
  toggleCam,
  onEndCall,
  screenSharing,
  toggleScreenShare,
  onOpenOverlay,
  chatChannel,
  displayName,
  messages,
  onMessagesUpdate,
  activeOverlay,
}: any) {
  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen items-stretch bg-[#04070f] text-white">
      <LiveKitRoom
        key={roomInstanceKey}
        token={token}
        serverUrl={serverUrl}
        connect
        video={effectiveVideoOption}
        audio={effectiveAudioOption}
        options={{ adaptiveStream: true, dynacast: true }}
        className="h-full w-full"
        data-lk-theme="default"
      >
        <div className="mx-auto flex h-full w-full max-w-[1280px] items-stretch gap-6 p-4 md:p-6">
          <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
            <div className="relative flex-1 overflow-hidden">
              <ParticipantGridView />
              <div className="absolute left-4 bottom-4 z-30 w-auto md:left-6 md:bottom-6">
                <ControlBar
                  micEnabled={micEnabled}
                  camEnabled={camEnabled}
                  screenSharing={screenSharing}
                  toggleMic={toggleMic}
                  toggleCam={toggleCam}
                  toggleScreenShare={toggleScreenShare}
                  onOpenOverlay={onOpenOverlay}
                  onEndCall={onEndCall}
                  sessionElapsed={sessionElapsed}
                />
              </div>
            </div>
          </div>
        </div>

        {activeOverlay === 'chat' ? (
          <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm md:items-center md:p-6">
            <button type="button" aria-label="Close chat" onClick={() => onOpenOverlay(null)} className="absolute inset-0 cursor-default" />
            <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <p className="text-sm font-semibold">Session Chat</p>
                <button type="button" onClick={() => onOpenOverlay(null)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 hover:bg-white/5">Close</button>
              </div>
              <div className="max-h-[78vh] overflow-y-auto p-4">
                <ChatPanel chatChannel={chatChannel} displayName={displayName} messages={messages} onMessagesUpdate={onMessagesUpdate} />
              </div>
            </div>
          </div>
        ) : null}
      </LiveKitRoom>
    </div>
  );
}
