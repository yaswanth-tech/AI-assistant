import React, { useState } from 'react';
import { Database, Search, X, FileText } from 'lucide-react';

export default function RAGExplorerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [query, setQuery] = useState('Computer Science course and tuition fees');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/rag/query?q=${encodeURIComponent(query)}&k=4`);
      const data = await res.json();
      setResults(data.contexts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        maxWidth: '850px',
        maxHeight: '90vh',
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
              background: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c084fc'
            }}>
              <Database size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '700' }}>
                RAG Knowledge Retrieval & Vector Pipeline Explorer
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Real-Time Semantic Vector Search & Context Inspection
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-input)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Type query to test semantic chunk retrieval..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--accent-gradient)',
                color: 'white',
                fontWeight: '600',
                fontSize: '12.5px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Retrieving...' : 'Run Vector Search'}
            </button>
          </form>
        </div>

        {/* Results Stream */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <FileText size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <div style={{ fontSize: '13px' }}>Click "Run Vector Search" to inspect top-K retrieved context chunks.</div>
            </div>
          ) : (
            results.map((chunk, idx) => (
              <div
                key={chunk.id || idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10.5px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                      Rank #{idx + 1}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {chunk.title}
                    </span>
                  </div>

                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '600', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                    Score: {(chunk.score || 0.85).toFixed(3)}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Category: {chunk.category} • Chunk ID: <code>{chunk.id}</code>
                </div>

                <div style={{
                  fontSize: '12.5px',
                  lineHeight: '1.6',
                  background: 'var(--bg-input)',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  whiteSpace: 'pre-line',
                  color: 'var(--text-primary)'
                }}>
                  {chunk.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
