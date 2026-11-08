import React from 'react';

/**
 * Round what's loaded apart from the page: if it can't load or can't start (a
 * dropped connection, a screen with no WebGL), it's left out, and the rest of
 * the page stays up, where otherwise the whole page would go blank.
 */
class LoadGuard extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default LoadGuard;
