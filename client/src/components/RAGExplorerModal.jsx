import React, { useState } from 'react';
import { Database, Search, Sparkles, X, CheckCircle, FileText } from 'lucide-react';

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
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '85vh',
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
              background: 'rgba(168, 85, 247, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={18} color="#c084fc" />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>
                RAG Knowledge Retrieval & Vector Pipeline Explorer
              </h2>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                Real-time Semantic TF-IDF Vector Search and Context Injection
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

        {/* Search Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(30, 41, 59, 0.3)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Type query to test semantic chunk retrieval..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(15, 23, 42, 0.7)',
                  color: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #9333ea, #6366f1)',
                color: 'white',
                fontWeight: '600',
                fontSize: '13px',
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
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <FileText size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <div style={{ fontSize: '13px', fontWeight: '500' }}>Click "Run Vector Search" to inspect top-K retrieved context chunks.</div>
            </div>
          ) : (
            results.map((chunk, idx) => (
              <div
                key={chunk.id || idx}
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '14px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(147, 51, 234, 0.2)', color: '#c084fc', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                      Rank #{idx + 1}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9' }}>
                      {chunk.title}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#34d399', fontWeight: '600', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                    Relevance Score: {(chunk.score || 0.85).toFixed(3)}
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#818cf8', marginBottom: '6px' }}>
                  Category: {chunk.category} • Chunk ID: <code>{chunk.id}</code>
                </div>

                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '6px', whiteSpace: 'pre-line', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
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
