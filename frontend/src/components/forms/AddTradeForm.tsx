import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Form, 
  FormField, 
  FormLabel, 
  FormError, 
  FormSelect 
} from '../ui/Form';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { SimpleDateInput } from '../ui/DatePicker';
import { InlineSpinner } from '../ui/LoadingSpinner';

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
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
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormField error={!!errors.symbol}>
        <FormLabel required>Symbol</FormLabel>
        <Input
          type="text"
          value={formData.symbol}
          onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
          placeholder="e.g., AAPL"
          disabled={isSubmitting}
          error={errors.symbol}
        />
        {errors.symbol && <FormError>{errors.symbol}</FormError>}
      </FormField>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField>
          <FormLabel required>Side</FormLabel>
          <FormSelect
            value={formData.side}
            onChange={(e) => handleInputChange('side', e.target.value)}
            disabled={isSubmitting}
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </FormSelect>
        </FormField>
        
        <FormField error={!!errors.quantity}>
          <FormLabel required>Quantity</FormLabel>
          <Input
            type="number"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            placeholder="100"
            min="1"
            step="1"
            disabled={isSubmitting}
            error={errors.quantity}
          />
          {errors.quantity && <FormError>{errors.quantity}</FormError>}
        </FormField>
      </div>
      
      <FormField error={!!errors.price}>
        <FormLabel required>Price</FormLabel>
        <Input
          type="number"
          value={formData.price}
          onChange={(e) => handleInputChange('price', e.target.value)}
          placeholder="150.50"
          min="0.01"
          step="0.01"
          disabled={isSubmitting}
          error={errors.price}
        />
        {errors.price && <FormError>{errors.price}</FormError>}
      </FormField>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField>
          <FormLabel>Trade Date</FormLabel>
          <SimpleDateInput
            value={formData.trade_date}
            onChange={(date) => handleInputChange('trade_date', date)}
            disabled={isSubmitting}
          />
        </FormField>
        
        <FormField>
          <FormLabel>Trade Time</FormLabel>
          <Input
            type="time"
            value={formData.trade_time}
            onChange={(e) => handleInputChange('trade_time', e.target.value)}
            disabled={isSubmitting}
          />
        </FormField>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField>
          <FormLabel>Commission</FormLabel>
          <Input
            type="number"
            value={formData.commission}
            onChange={(e) => handleInputChange('commission', e.target.value)}
            placeholder="1.00"
            min="0"
            step="0.01"
            disabled={isSubmitting}
          />
        </FormField>
        
        <FormField>
          <FormLabel>Currency</FormLabel>
          <FormSelect
            value={formData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            disabled={isSubmitting}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </FormSelect>
        </FormField>
      </div>
      
      <div className="flex gap-3 pt-6 border-t border-slate-700/50">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <InlineSpinner />
              Adding Trade...
            </span>
          ) : (
            'Add Trade'
          )}
        </Button>
      </div>
    </Form>
  );
};

export default AddTradeForm;