import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { WithdrawalRequest } from '../../../types';

interface PaymentModalProps {
  withdrawal: WithdrawalRequest;
  onClose: () => void;
  onComplete: () => void;
}

export function PaymentModal({ withdrawal, onClose, onComplete }: PaymentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      // Create bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(b => b.name === 'payment_proofs')) {
        const { error: bucketError } = await supabase.storage.createBucket('payment_proofs', {
          public: true
        });
        if (bucketError) throw bucketError;
      }

      // Upload POP to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `withdrawal_${withdrawal.id}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('payment_proofs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment_proofs')
        .getPublicUrl(fileName);

      // Create payment proof record
      const { error: proofError } = await supabase
        .from('payment_proofs')
        .insert([{
          withdrawal_id: withdrawal.id,
          file_url: publicUrl,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (proofError) throw proofError;

      // Update withdrawal request status
      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .update({ 
          status: 'processed',
          updated_at: new Date().toISOString()
        })
        .eq('id', withdrawal.id);

      if (withdrawalError) throw withdrawalError;

      onComplete();
    } catch (error) {
      console.error('Error processing payment:', error);
      if (error.message?.includes('Bucket not found')) {
        alert('Storage system not properly configured. Please contact support.');
      } else {
        alert('Failed to process payment. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-8 max-w-md bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Process Withdrawal
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">Withdrawal Reference:</p>
          <p className="text-lg font-medium">{withdrawal.withdrawal_id}</p>
          <p className="text-sm text-gray-500 mt-1">Amount: N$ {withdrawal.amount.toLocaleString()}</p>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-indigo-600 hover:text-indigo-500">
                    Upload Proof of Payment
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {file && (
            <p className="text-sm text-gray-500">
              Selected file: {file.name}
            </p>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {uploading ? 'Processing...' : 'Complete Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}