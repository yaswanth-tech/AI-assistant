import React, { useState } from 'react';
import { MapPin, Navigation, X, ExternalLink, Compass } from 'lucide-react';

export default function CampusMapModal({ isOpen, onClose, selectedLocation, allLocations = [] }) {
  if (!isOpen) return null;

  const [activeLoc, setActiveLoc] = useState(selectedLocation || allLocations[0] || {
    LocationName: 'Campus Library',
    Coordinates: { lat: -20.280528, lng: 57.394936 }
  });

  const [directionsActive, setDirectionsActive] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '900px',
        height: '620px',
        background: '#0f172a',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.9)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={18} color="#818cf8" />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>
                Campus Navigation & Geospatial Coordinates
              </h2>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                Middlesex University Mauritius • Cascavelle Campus
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Location List Sidebar */}
          <div style={{
            width: '280px',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px',
            overflowY: 'auto',
            background: 'rgba(15, 23, 42, 0.5)'
          }}>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '10px' }}>
              Campus Facilities & Landmarks
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                      borderColor: isSelected ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.04)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(30, 41, 59, 0.3)',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: isSelected ? '700' : '500', color: isSelected ? '#a5b4fc' : '#e2e8f0' }}>
                      {loc.LocationName}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px', fontFamily: 'monospace' }}>
                      {loc.Coordinates?.lat?.toFixed(5)}, {loc.Coordinates?.lng?.toFixed(5)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Display & Route Pane */}
          <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Visual Simulated Interactive Campus Radar / Map View */}
            <div style={{
              flex: 1,
              background: '#090d16',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}>
              {/* Campus Grid Outline */}
              <div style={{
                position: 'absolute',
                inset: '20px',
                border: '1px dashed rgba(99, 102, 241, 0.25)',
                borderRadius: '8px',
                pointerEvents: 'none'
              }}></div>

              {/* Pin Icons */}
              {allLocations.map((loc, idx) => {
                const isSelected = activeLoc?.LocationName === loc.LocationName;
                // Distribute pins across layout
                const positions = [
                  { top: '30%', left: '25%' },
                  { top: '25%', left: '48%' },
                  { top: '65%', left: '30%' },
                  { top: '45%', left: '70%' },
                  { top: '55%', left: '75%' },
                  { top: '35%', left: '80%' },
                  { top: '70%', left: '60%' }
                ];
                const pos = positions[idx % positions.length];

                return (
                  <div
                    key={idx}
                    onClick={() => setActiveLoc(loc)}
                    style={{
                      position: 'absolute',
                      top: pos.top,
                      left: pos.left,
                      transform: 'translate(-50%, -50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      zIndex: isSelected ? 20 : 10,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: isSelected ? '36px' : '26px',
                      height: isSelected ? '36px' : '26px',
                      borderRadius: '50%',
                      background: isSelected ? '#4f46e5' : 'rgba(30, 41, 59, 0.9)',
                      border: isSelected ? '2px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isSelected ? '0 0 16px rgba(99, 102, 241, 0.8)' : 'none'
                    }}>
                      <MapPin size={isSelected ? 18 : 14} color={isSelected ? '#ffffff' : '#94a3b8'} />
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: isSelected ? '700' : '500',
                      color: isSelected ? '#c7d2fe' : '#94a3b8',
                      background: 'rgba(15, 23, 42, 0.85)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginTop: '4px',
                      whiteSpace: 'nowrap',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      {loc.LocationName}
                    </span>
                  </div>
                );
              })}

              {/* Active Directions Simulated Path */}
              {directionsActive && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#34d399',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  <Navigation size={14} className="animate-spin" />
                  Route calculated: Estimated walk time ~ 2 mins from Campus Entrance.
                </div>
              )}
            </div>

            {/* Selected Landmark Details Footer */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>
                  Target: {activeLoc?.LocationName}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  Latitude: <code style={{ color: '#818cf8' }}>{activeLoc?.Coordinates?.lat}</code> • Longitude: <code style={{ color: '#818cf8' }}>{activeLoc?.Coordinates?.lng}</code>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setDirectionsActive(true)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#4f46e5',
                    border: 'none',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Navigation size={14} /> Calculate Route
                </button>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${activeLoc?.Coordinates?.lat},${activeLoc?.Coordinates?.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                    fontSize: '12px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Google Maps <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
