// src/hooks/useRazorpay.js - NEW FILE

import { useEffect } from 'react';

const useRazorpay = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    document.body.appendChild(script);

    return () => {
      // Clean up the script when the component unmounts
      const allScripts = document.getElementsByTagName('script');
      for (let i = 0; i < allScripts.length; i++) {
        if (allScripts[i].src === script.src) {
          document.body.removeChild(allScripts[i]);
        }
      }
    };
  }, []);
};

export default useRazorpay;