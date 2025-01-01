import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App.tsx'
import { polyfill } from "mobile-drag-drop"

import './pointer-events';

if (!globalThis.PointerEvent) {

  class PointerEventImpl extends MouseEvent {
    readonly altitudeAngle: number = 0;
    readonly azimuthAngle: number = 0;
    readonly height: number = 0;
    readonly isPrimary: boolean = true;
    readonly pointerId: number = 0;
    readonly pointerType: string = "";
    readonly pressure: number = 0;
    readonly tangentialPressure: number = 0;
    readonly tiltX: number = 0;
    readonly tiltY: number = 0;
    readonly twist: number = 0;
    readonly width: number = 0;

    getCoalescedEvents(): PointerEvent[] {
      console.assert(false);
      return [];
    }
    getPredictedEvents(): PointerEvent[] {
      console.assert(false);
      return [];
    }
  };

  globalThis.PointerEvent = PointerEventImpl;
}

// options are optional ;)
polyfill({
  forceApply: true
});

import './global.sass';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
