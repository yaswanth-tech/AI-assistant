import React, { useState } from 'react';
import { MapPin, Navigation, X, ExternalLink, Compass } from 'lucide-react';

export default function CampusMapModal({ isOpen, onClose, selectedLocation, allLocations = [] }) {
  if (!isOpen) return null;

  const [activeLoc, setActiveLoc] = useState(selectedLocation || allLocations[0] || {
    LocationName: 'Vithal Gandhi Central Library',
    Coordinates: { lat: 17.6539, lng: 77.9221 }
  });

  const [directionsActive, setDirectionsActive] = useState(false);

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${activeLoc?.Coordinates?.lat || 17.6539},${activeLoc?.Coordinates?.lng || 77.9221}`;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '920px',
        height: '640px',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-subtle)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-header)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)'
            }}>
              <MapPin size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '700' }}>
                Campus Navigation & Google Maps GPS
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Woxsen University • Hyderabad Residential Campus
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Landmark List Sidebar */}
          <div style={{
            width: '280px',
            borderRight: '1px solid var(--border-subtle)',
            padding: '16px',
            overflowY: 'auto',
            background: 'var(--bg-sidebar)'
          }}>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Campus Facilities ({allLocations.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {allLocations.map((loc, idx) => {
                const isSelected = activeLoc?.LocationName === loc.LocationName;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveLoc(loc);
                      setDirectionsActive(false);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent)' : 'var(--border-subtle)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: isSelected ? '700' : '500', color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {loc.LocationName}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                      Lat: {loc.Coordinates?.lat?.toFixed(5)}, Lng: {loc.Coordinates?.lng?.toFixed(5)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Map Display & Route Pane */}
          <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Live OpenStreetMap Interactive Embed */}
            <div style={{
              flex: 1,
              background: '#090d16',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <iframe
                title="Campus OpenStreetMap"
                width="100%"
                height="100%"
                style={{ border: 'none', filter: 'contrast(1.05)' }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=77.910%2C17.640%2C77.935%2C17.665&layer=mapnik&marker=${activeLoc?.Coordinates?.lat || 17.6534}%2C${activeLoc?.Coordinates?.lng || 77.9224}`}
              />

              {directionsActive && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(16, 185, 129, 0.95)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}>
                  <Navigation size={14} /> Walking Route: ~2 - 4 minutes along campus central avenue
                </div>
              )}
            </div>

            {/* Target Details Footer */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Selected: {activeLoc?.LocationName}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  GPS: <code>{activeLoc?.Coordinates?.lat}, {activeLoc?.Coordinates?.lng}</code> • Woxsen Campus, Hyderabad
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setDirectionsActive(true)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--accent-gradient)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Navigation size={14} /> Calculate Walking Path
                </button>

                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ExternalLink size={14} /> Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
