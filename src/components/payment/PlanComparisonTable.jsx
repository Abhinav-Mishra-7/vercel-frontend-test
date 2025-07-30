import {Check, X } from 'lucide-react';

const PlanComparisonTable = ({ plans }) => {
  const allFeatures = [
    { title: 'Standard Questions', values: ['5', 'All', 'All', 'All'] },
    { title: 'AI Chat Prompts', values: ['10 / trial', 'Limited', 'Unlimited', 'Unlimited'] },
    { title: 'Problem Solutions', values: [false, true, true, true] },
    { title: 'Company Specific Problems', values: [false, false, true, true] },
    { title: 'Access to All Courses', values: [false, false, true, true] },
    { title: 'Priority Support', values: [false, false, true, true] },
    { title: 'Access to Future Content', values: [false, false, false, true] },
  ];

  const getBgColor = (theme) => {
    return `bg-gradient-to-b ${theme.gradientFrom} ${theme.gradientTo}`;
  };

  const renderValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? 
        <div className="bg-emerald-900/50 p-1.5 rounded-full">
          <Check className="mx-auto text-emerald-400" size={18} />
        </div> : 
        <div className="bg-rose-900/50 p-1.5 rounded-full">
          <X className="mx-auto text-rose-400" size={18} />
        </div>;
    }
    return <span className="text-slate-300 font-medium">{value}</span>;
  };

  return (
    <div className="mt-8 p-4 sm:p-6 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 w-full max-w-7xl mx-auto animate-fade-in overflow-x-auto">
      <h3 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
        Feature Comparison
      </h3>
      
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-slate-600">
              <th className="pb-4 px-4 font-semibold text-slate-300 w-[28%] bg-slate-900/80 backdrop-blur-sm">Features</th>
              {plans.map((plan) => (
                <th 
                  key={plan.id} 
                  className={`text-center pb-4 px-4 font-bold text-lg ${plan.theme.textColor} ${getBgColor(plan.theme)} py-3`}
                >
                  {plan.name}
                  {plan.highlight && (
                    <span className="block text-xs font-normal mt-1 text-white/90">
                      {plan.highlight}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allFeatures.map((feature, featureIndex) => (
              <tr 
                key={featureIndex} 
                className={`
                  border-b border-slate-700 transition-colors duration-200
                  ${featureIndex % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-900/30'}
                  hover:bg-slate-700/50
                `}
              >
                <td className="py-4 px-4 font-semibold text-slate-200">
                  {feature.title}
                </td>
                {feature.values.map((value, valueIndex) => (
                    <td key={valueIndex} className="text-center py-4 px-4">
                      <div className="flex items-center justify-center">
                        {renderValue(value)}
                      </div>
                    </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="block lg:hidden space-y-8">
        {plans.map((plan, planIndex) => (
          <div 
            key={plan.id} 
            className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900/50"
          >
            <div className={`${getBgColor(plan.theme)} p-4`}>
              <h4 className={`text-xl font-bold text-center text-white`}>
                {plan.name}
              </h4>
              {plan.highlight && (
                <p className="text-center text-sm mt-1 text-white/90">
                  {plan.highlight}
                </p>
              )}
            </div>
            <ul className="space-y-3 p-4">
                {allFeatures.map((feature, featureIndex) => (
                    <li 
                      key={featureIndex} 
                      className="flex justify-between items-center bg-slate-800/40 p-3 rounded-lg"
                    >
                        <span className="font-medium text-slate-300">
                          {feature.title}
                        </span>
                        <div className="font-semibold">
                            {renderValue(feature.values[planIndex])}
                        </div>
                    </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanComparisonTable;






// import { Check, X } from 'lucide-react';

// // Feature definitions
// const allFeatures = [
//     { title: 'Standard Questions', values: ['5', 'All', 'All', 'All'] },
//     { title: 'AI Chat Prompts', values: ['10 / trial', 'Limited', 'Unlimited', 'Unlimited'] },
//     { title: 'Problem Solutions', values: [false, true, true, true] },
//     { title: 'Company Specific Problems', values: [false, false, true, true] },
//     { title: 'Access to All Courses', values: [false, false, true, true] },
//     { title: 'Priority Support', values: [false, false, true, true] },
//     { title: 'Access to Future Content', values: [false, false, false, true] },
// ];

// const PlanComparisonTable = ({ plans }) => {
//   const getBgColor = (theme) => {
//     return `bg-gradient-to-b ${theme.gradientFrom} ${theme.gradientTo}`;
//   };

//   const renderValue = (value) => {
//     if (typeof value === 'boolean') {
//       return value ? 
//         <div className="bg-emerald-900/50 p-1.5 rounded-full">
//           <Check className="mx-auto text-emerald-400" size={18} />
//         </div> : 
//         <div className="bg-rose-900/50 p-1.5 rounded-full">
//           <X className="mx-auto text-rose-400" size={18} />
//         </div>;
//     }
//     return <span className="text-slate-300 font-medium">{value}</span>;
//   };

//   return (
//     <div className="mt-8 p-4 sm:p-6 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 w-full max-w-7xl mx-auto animate-fade-in overflow-x-auto">
//       <h3 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
//         Feature Comparison
//       </h3>
      
//       {/* Desktop Table */}
//       <div className="hidden lg:block">
//         <table className="w-full text-left text-sm min-w-[800px]">
//           <thead className="sticky top-0 z-10">
//             <tr className="border-b border-slate-600">
//               <th className="pb-4 px-4 font-semibold text-slate-300 w-[28%] bg-slate-900/80 backdrop-blur-sm">Features</th>
//               {plans.map((plan) => (
//                 <th 
//                   key={plan.id} 
//                   className={`text-center pb-4 px-4 font-bold text-lg ${plan.theme.textColor} ${getBgColor(plan.theme)} py-3`}
//                 >
//                   {plan.name}
//                   {plan.highlight && (
//                     <span className="block text-xs font-normal mt-1 text-white/90">
//                       {plan.highlight}
//                     </span>
//                   )}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {allFeatures.map((feature, featureIndex) => (
//               <tr 
//                 key={featureIndex} 
//                 className={`
//                   border-b border-slate-700 transition-colors duration-200
//                   ${featureIndex % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-900/30'}
//                   hover:bg-slate-700/50
//                 `}
//               >
//                 <td className="py-4 px-4 font-semibold text-slate-200">
//                   {feature.title}
//                 </td>
//                 {feature.values.map((value, valueIndex) => (
//                     <td key={valueIndex} className="text-center py-4 px-4">
//                       <div className="flex items-center justify-center">
//                         {renderValue(value)}
//                       </div>
//                     </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Mobile View */}
//       <div className="block lg:hidden space-y-8">
//         {plans.map((plan, planIndex) => (
//           <div 
//             key={plan.id} 
//             className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900/50"
//           >
//             <div className={`${getBgColor(plan.theme)} p-4`}>
//               <h4 className={`text-xl font-bold text-center text-white`}>
//                 {plan.name}
//               </h4>
//               {plan.highlight && (
//                 <p className="text-center text-sm mt-1 text-white/90">
//                   {plan.highlight}
//                 </p>
//               )}
//             </div>
//             <ul className="space-y-3 p-4">
//                 {allFeatures.map((feature, featureIndex) => (
//                     <li 
//                       key={featureIndex} 
//                       className="flex justify-between items-center bg-slate-800/40 p-3 rounded-lg"
//                     >
//                         <span className="font-medium text-slate-300">
//                           {feature.title}
//                         </span>
//                         <div className="font-semibold">
//                             {renderValue(feature.values[planIndex])}
//                         </div>
//                     </li>
//                 ))}
//             </ul>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default PlanComparisonTable;