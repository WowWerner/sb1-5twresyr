import React, { useState } from 'react';
import { X, Upload, User } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { PaymentNotification } from '../../../types';

interface PaymentModalProps {
  payment: PaymentNotification;
  onClose: () => void;
  onComplete: () => void;
}

export function PaymentModal({ payment, onClose, onComplete }: PaymentModalProps) {
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
      // Upload POP to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${payment.id}_${Date.now()}.${fileExt}`;
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
          notification_id: payment.id,
          file_url: publicUrl,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (proofError) throw proofError;

      // Update payment notification status
      const { error: updateError } = await supabase
        .from('payment_notifications')
        .update({ status: 'processed' })
        .eq('id', payment.id);

      if (updateError) throw updateError;

      // Update withdrawal request status and account balance
      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .update({ status: 'processed' })
        .eq('id', payment.withdrawal_request?.id);

      if (withdrawalError) throw withdrawalError;

      // Update investor account balance
      const { error: accountError } = await supabase
        .from('investor_accounts')
        .update({
          current_balance: supabase.rpc('decrement', {
            x: payment.withdrawal_request?.amount || 0
          }),
          total_withdrawn: supabase.rpc('increment', {
            x: payment.withdrawal_request?.amount || 0
          })
        })
        .eq('id', payment.withdrawal_request?.account_id);

      if (accountError) throw accountError;

      onComplete();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-8 max-w-md bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Process Withdrawal</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <User className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {payment.withdrawal_request?.investor_profile.full_name}
              </p>
              <p className="text-sm text-gray-500">
                Withdrawal ID: {payment.withdrawal_request?.withdrawal_id}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Amount to Transfer:</p>
            <p className="text-xl font-bold text-gray-900">
              N$ {payment.withdrawal_request?.amount.toLocaleString()}
            </p>
          </div>
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