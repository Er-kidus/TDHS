"use client";

import { Component, ReactNode } from "react";

type VideoConferenceBoundaryProps = {
  children: ReactNode;
  onError: () => void;
};

type VideoConferenceBoundaryState = {
  hasError: boolean;
};

export class VideoConferenceBoundary extends Component<
  VideoConferenceBoundaryProps,
  VideoConferenceBoundaryState
> {
  constructor(props: VideoConferenceBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): VideoConferenceBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(): void {
    this.props.onError();
  }

  componentDidUpdate(
    prevProps: VideoConferenceBoundaryProps
  ): void {
    if (
      prevProps.children !== this.props.children &&
      this.state.hasError
    ) {
      this.setState({ hasError: false });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-200">
          <div className="space-y-2">
            <p className="font-medium">
              Video surface recovered.
            </p>
            <p className="text-slate-400">
              The call remains active.
              Reconnect to refresh participant
              tiles.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
