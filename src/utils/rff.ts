import type { RFFApplication } from '../types';

export const transformRFFData = (formData: any): Partial<RFFApplication> => {
  const totalInterestRate = parseFloat(formData.interest_rate);
  const splitInterest = totalInterestRate / 2;

  // Transform form data to match database column names exactly
  return {
    client_name: formData.client_name,
    client_contact: formData.client_contact,
    loan_facility_number: formData.loan_facility_number,
    loan_amount: parseFloat(formData.loan_amount),
    interest_rate: totalInterestRate,
    bim_interest: splitInterest,
    bsf_interest: splitInterest,
    settlement_date: formData.settlement_date,
    off_taker: formData.off_taker,
    off_taker_sector: formData.off_taker_sector,
    priority: formData.priority,
    submitted_by: 'system@bellatrix.com'
  };
};