import L from 'leaflet';

/**
 * Global Leaflet Safety Patch to prevent React StrictMode & teardown race conditions:
 * 1. "TypeError: Cannot read properties of undefined (reading '_leaflet_pos')"
 *    Occurs in DomUtil.getPosition when element or _mapPane is null/undefined during unmount.
 * 2. "TypeError: Cannot read properties of undefined (reading '_moveEnd')"
 *    Occurs when _move does not return `this` due to improper chaining.
 */
let isPatched = false;

export function applyLeafletSafetyPatch(): void {
  if (isPatched || typeof window === 'undefined') return;
  isPatched = true;

  try {
    const fallbackPoint = () => (L.point ? L.point(0, 0) : new (L.Point as any)(0, 0));

    // 1. Safeguard L.DomUtil.getPosition
    if (L.DomUtil && typeof L.DomUtil.getPosition === 'function') {
      const origGetPosition = L.DomUtil.getPosition;
      L.DomUtil.getPosition = function (el: any) {
        if (!el) {
          return fallbackPoint();
        }
        try {
          const pos = origGetPosition.call(this, el);
          return pos || fallbackPoint();
        } catch {
          return fallbackPoint();
        }
      };
    }

    // 2. Safeguard Map prototype methods
    if (L.Map && L.Map.prototype) {
      const proto = L.Map.prototype as any;

      if (typeof proto._getMapPanePos === 'function') {
        const origGetMapPanePos = proto._getMapPanePos;
        proto._getMapPanePos = function () {
          if (!this._mapPane) {
            return fallbackPoint();
          }
          try {
            return origGetMapPanePos.call(this) || fallbackPoint();
          } catch {
            return fallbackPoint();
          }
        };
      }

      if (typeof proto._onZoomTransitionEnd === 'function') {
        const origOnZoomTransitionEnd = proto._onZoomTransitionEnd;
        proto._onZoomTransitionEnd = function () {
          if (!this._mapPane || !this._container) return;
          try {
            origOnZoomTransitionEnd.call(this);
          } catch {
            // Guard against unmount race condition
          }
        };
      }

      if (typeof proto._move === 'function') {
        const origMove = proto._move;
        proto._move = function (center: any, zoom: any, data: any, flags: any) {
          if (!this._mapPane || !this._container) {
            return this;
          }
          try {
            const res = origMove.call(this, center, zoom, data, flags);
            return res !== undefined ? res : this;
          } catch {
            return this;
          }
        };
      }
    }
  } catch (err) {
    console.warn('[Leaflet Patch] Failed to apply safety patch:', err);
  }
}

// Auto-execute on module import
applyLeafletSafetyPatch();
