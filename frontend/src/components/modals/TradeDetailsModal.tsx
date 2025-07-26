import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import { 
  Form, 
  FormField, 
  FormLabel 
} from '../ui/Form';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Badge } from '../ui/Badge';
import { InlineSpinner } from '../ui/LoadingSpinner';
import { cn } from '../../lib/utils';

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
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title={`Trade Details - ${trade.symbol}`}
      size="large"
    >
      <div className="space-y-6">

        {/* Trade Information Grid */}
        <div className="grid grid-cols-2 gap-6 p-4 bg-slate-800/30 rounded-lg">
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-400">Symbol</span>
              <p className="text-lg font-bold text-white mt-1">{trade.symbol}</p>
            </div>
            <div>
              <span className="text-sm text-gray-400">Side</span>
              <div className="mt-1">
                <Badge 
                  variant={trade.side === 'BUY' ? 'success' : 'error'} 
                  size="lg"
                >
                  {trade.side}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-400">Quantity</span>
              <p className="text-base text-white mt-1">{trade.quantity}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-400">Price</span>
              <p className="text-base text-white mt-1">${Number(trade.price).toFixed(2)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-400">Total Value</span>
              <p className="text-base text-white mt-1">${totalValue.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-400">Net Amount</span>
              <p className={cn(
                "text-base font-medium mt-1",
                netAmount >= 0 ? "text-profit-400" : "text-loss-400"
              )}>
                ${Math.abs(netAmount).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Form for Notes and Tags */}
        <Form onSubmit={(e) => { e.preventDefault(); handleSaveNotes(); }}>
          <FormField>
            <FormLabel>Tags (comma-separated)</FormLabel>
            <Input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="swing trade, earnings, breakout"
              disabled={isUpdating}
            />
          </FormField>

          <FormField>
            <FormLabel>Notes</FormLabel>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your trade notes, strategy, observations..."
              disabled={isUpdating}
              rows={4}
              className={cn(
                "w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white",
                "placeholder-gray-500 resize-vertical",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50",
                "transition-all duration-200",
                "hover:border-slate-600/50",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
          </FormField>

          <div className="flex gap-3 pt-6 border-t border-slate-700/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? (
                <span className="flex items-center justify-center gap-2">
                  <InlineSpinner />
                  Saving...
                </span>
              ) : (
                'Save Notes'
              )}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default TradeDetailsModal;