import { Component } from 'react';

export class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="canvas-fallback" role="img" aria-label="3D-Szene nicht verfügbar">
          <p>3D-Erlebniswelt</p>
          <span>WebGL ist auf diesem Gerät nicht verfügbar — Steuerung und Produktinfo bleiben aktiv.</span>
        </div>
      );
    }
    return this.props.children;
  }
}
