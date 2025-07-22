import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface AddTradeFormProps {
  onClose: () => void;
  onTradeAdded: () => void;
}

const AddTradeForm: React.FC<AddTradeFormProps> = ({ onClose, onTradeAdded }) => {
  const [formData, setFormData] = useState({
    symbol: '',
    side: 'BUY',
    quantity: '',
    price: '',
    trade_date: new Date().toISOString().split('T')[0],
    trade_time: new Date().toTimeString().split(' ')[0].slice(0, 5),
    commission: '1.00',
    currency: 'USD'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = () => {
    return formData.symbol.trim() && 
           formData.quantity && Number(formData.quantity) > 0 &&
           formData.price && Number(formData.price) > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tradeDateTime = `${formData.trade_date}T${formData.trade_time}:00`;
      
      const tradeData = {
        symbol: formData.symbol.toUpperCase().trim(),
        side: formData.side,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        trade_date: tradeDateTime,
        commission: Number(formData.commission),
        currency: formData.currency,
        account_id: '138d99da-91c5-4b61-9ae9-8a4d5a906b9b',
        exchange: '',
        order_type: 'MKT'
      };
      
      const response = await fetch('http://localhost:8002/api/v1/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(tradeData)
      });
      
      if (response.ok) {
        toast.success(`Successfully added ${formData.side} ${formData.quantity} ${formData.symbol}!`);
        onClose();
        onTradeAdded();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to add trade');
      }
    } catch (error) {
      toast.error('Failed to add trade');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} style={{color: 'white'}}>
      <div style={{marginBottom: '16px'}}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          color: '#d1d5db',
          marginBottom: '8px'
        }}>Symbol *</label>
        <input
          type="text"
          value={formData.symbol}
          onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
          placeholder="e.g., AAPL"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '6px',
            color: 'white',
            fontSize: '16px'
          }}
        />
      </div>
      
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'}}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            color: '#d1d5db',
            marginBottom: '8px'
          }}>Side *</label>
          <select 
            value={formData.side}
            onChange={(e) => handleInputChange('side', e.target.value)}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: 'white',
              fontSize: '16px'
            }}>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>
        
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            color: '#d1d5db',
            marginBottom: '8px'
          }}>Quantity *</label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            placeholder="100"
            min="1"
            step="1"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: 'white',
              fontSize: '16px'
            }}
          />
        </div>
      </div>
      
      <div style={{marginBottom: '20px'}}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          color: '#d1d5db',
          marginBottom: '8px'
        }}>Price *</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => handleInputChange('price', e.target.value)}
          placeholder="150.50"
          min="0.01"
          step="0.01"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '6px',
            color: 'white',
            fontSize: '16px'
          }}
        />
      </div>
      
      <div style={{display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #4b5563'}}>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#4b5563',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.6 : 1
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !isFormValid()}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: isSubmitting || !isFormValid() ? '#6b7280' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: isSubmitting || !isFormValid() ? 'not-allowed' : 'pointer',
            opacity: isSubmitting || !isFormValid() ? 0.6 : 1
          }}
        >
          {isSubmitting ? 'Adding Trade...' : 'Add Trade'}
        </button>
      </div>
    </form>
  );
};

export default AddTradeForm;