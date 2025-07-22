import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  commission?: number;
  notes?: string;
  tags?: string;
}

interface TradeDetailsModalProps {
  trade: Trade;
  onClose: () => void;
  onUpdate: () => void;
}

const TradeDetailsModal: React.FC<TradeDetailsModalProps> = ({ trade, onClose, onUpdate }) => {
  const [notes, setNotes] = useState(trade.notes || '');
  const [tags, setTags] = useState(trade.tags || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveNotes = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`http://localhost:8002/api/v1/trades/${trade.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ notes, tags })
      });
      
      if (response.ok) {
        toast.success('Trade updated successfully');
        onUpdate();
      } else {
        toast.error('Failed to update trade');
      }
    } catch (error) {
      toast.error('Failed to update trade');
    } finally {
      setIsUpdating(false);
    }
  };

  const totalValue = Number(trade.price) * Number(trade.quantity);
  const netAmount = trade.side === 'BUY' ? -totalValue - Number(trade.commission || 0) : totalValue - Number(trade.commission || 0);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: 0 }}>
            Trade Details - {trade.symbol}
          </h3>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#9ca3af' }}>Symbol</span>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: '4px 0' }}>{trade.symbol}</p>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#9ca3af' }}>Side</span>
              <p style={{ fontSize: '16px', color: trade.side === 'BUY' ? '#10b981' : '#ef4444', margin: '4px 0' }}>{trade.side}</p>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#9ca3af' }}>Quantity</span>
              <p style={{ fontSize: '16px', color: 'white', margin: '4px 0' }}>{trade.quantity}</p>
            </div>
          </div>
          <div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#9ca3af' }}>Price</span>
              <p style={{ fontSize: '16px', color: 'white', margin: '4px 0' }}>${Number(trade.price).toFixed(2)}</p>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#9ca3af' }}>Total Value</span>
              <p style={{ fontSize: '16px', color: 'white', margin: '4px 0' }}>${totalValue.toFixed(2)}</p>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#9ca3af' }}>Net Amount</span>
              <p style={{ fontSize: '16px', color: netAmount >= 0 ? '#10b981' : '#ef4444', margin: '4px 0' }}>
                ${netAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: '#d1d5db', marginBottom: '8px' }}>
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="swing trade, earnings, breakout"
            disabled={isUpdating}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: '#d1d5db', marginBottom: '8px' }}>
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your trade notes, strategy, observations..."
            disabled={isUpdating}
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: 'white',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #4b5563' }}>
          <button
            onClick={onClose}
            disabled={isUpdating}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#4b5563',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              opacity: isUpdating ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveNotes}
            disabled={isUpdating}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: isUpdating ? '#6b7280' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              opacity: isUpdating ? 0.6 : 1
            }}
          >
            {isUpdating ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeDetailsModal;