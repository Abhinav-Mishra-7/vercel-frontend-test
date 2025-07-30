// import { useEffect, useState } from 'react';
// import { Plus, Edit, Video } from 'lucide-react';

// const RecentActivity = () => {
//   const [activities, setActivities] = useState([]);
  
//   useEffect(() => {
//     // Connect to WebSocket server
//     const ws = new WebSocket('wss://your-websocket-server.com/activity-feed');
    
//     ws.onopen = () => {
//       console.log('Connected to activity feed');
//     };
    
//     ws.onmessage = (event) => {
//       const newActivity = JSON.parse(event.data);
//       setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only last 10 items
//     };
    
//     ws.onerror = (error) => {
//       console.error('WebSocket error:', error);
//     };
    
//     return () => ws.close();
//   }, []);

//   // Function to format relative time (e.g., "2 hours ago")
//   const formatTime = (timestamp) => {
//     const now = new Date();
//     const date = new Date(timestamp);
//     const seconds = Math.floor((now - date) / 1000);
    
//     if (seconds < 60) return 'Just now';
//     if (seconds < 3600) return `${Math.floor(seconds/60)} minutes ago`;
//     if (seconds < 86400) return `${Math.floor(seconds/3600)} hours ago`;
//     if (seconds < 172800) return 'Yesterday';
    
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   return (
//     <div className="mt-16 bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 shadow-sm">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-[var(--card-foreground)]">
//           <span className="bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] text-transparent bg-clip-text">
//             Recent Activity
//           </span>
//         </h2>
//         <button className="text-sm text-[var(--placeholder-text)] hover:text-[var(--card-foreground)] transition-colors">
//           View All
//         </button>
//       </div>
      
//       <div className="space-y-4">
//         {activities.length === 0 ? (
//           <p className="text-[var(--placeholder-text)] py-4 text-center">
//             No recent activity
//           </p>
//         ) : (
//           activities.map((activity) => (
//             <ActivityItem 
//               key={activity.id}
//               activity={activity}
//               formatTime={formatTime}
//             />
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// // Sub-component for individual activity items
// const ActivityItem = ({ activity, formatTime }) => {
//   const { type, title, timestamp } = activity;
  
//   const iconConfig = {
//     added: { 
//       icon: Plus, 
//       bg: 'bg-green-500/10', 
//       color: 'text-green-400' 
//     },
//     updated: { 
//       icon: Edit, 
//       bg: 'bg-amber-500/10', 
//       color: 'text-amber-400' 
//     },
//     video: { 
//       icon: Video, 
//       bg: 'bg-blue-500/10', 
//       color: 'text-blue-400' 
//     }
//   };
  
//   const { icon: Icon, bg, color } = iconConfig[type] || iconConfig.added;
  
//   const actionText = {
//     added: 'Added new problem:',
//     updated: 'Updated problem:',
//     video: 'Added video solution:'
//   }[type];
  
//   return (
//     <div className="flex items-start">
//       <div className={`p-2 ${bg} rounded-lg mr-4`}>
//         <Icon className={color} size={18} />
//       </div>
//       <div>
//         <p className="text-[var(--card-foreground)]">
//           {actionText} <span className="font-medium">{title}</span>
//         </p>
//         <p className="text-xs text-[var(--placeholder-text)] mt-1">
//           {formatTime(timestamp)}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default RecentActivity;