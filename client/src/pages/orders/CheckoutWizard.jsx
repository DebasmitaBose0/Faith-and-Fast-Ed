import React, { useState } from 'react';
import './CheckoutWizard.css';

export default function CheckoutWizard() {
  const [step, setStep] = useState(1);

  return (
    <div className="p-6 bg-white dark:bg-black rounded-lg shadow-md max-w-xl mx-auto">
      <div className="flex justify-between mb-4 border-b pb-2">
        <span className={step === 1 ? 'font-bold' : ''}>1. Shipping Info</span>
        <span className={step === 2 ? 'font-bold' : ''}>2. Dynamic Billing</span>
        <span className={step === 3 ? 'font-bold' : ''}>3. Review Order</span>
      </div>
      <div className="py-4">
        {step === 1 && <p>Enter your ZIP code to compute dynamic shipping rates.</p>}
        {step === 2 && <p>Select your preferred payment method.</p>}
        {step === 3 && <p>Review items and place order securely.</p>}
      </div>
      <div className="flex justify-between mt-4">
        {step > 1 && <button onClick={() => setStep(step - 1)} className="px-4 py-2 border rounded">Back</button>}
        {step < 3 && <button onClick={() => setStep(step + 1)} className="px-4 py-2 bg-yellow-400 rounded">Next</button>}
      </div>
    </div>
  );
}