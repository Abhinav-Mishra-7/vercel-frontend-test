import React from 'react';

const MissedOpportunityCard = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-2xl w-full shadow-xl backdrop-blur-sm">
        <div className="text-center">
          <p className="text-2xl font-medium text-muted-foreground mb-3">
            You have missed a golden opportunity this time,
          </p>
          <p className="text-4xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)]">
              But Ready for the next one.
            </span>
          </p>
          
          <div className="mt-8 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-[var(--primary-from)/50] to-[var(--primary-to)/50] blur-lg rounded-full"></div>
              {/* <button className="relative px-6 py-2.5 bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-button-text rounded-full font-medium hover:opacity-90 transition-opacity">
                Get Notified
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissedOpportunityCard;