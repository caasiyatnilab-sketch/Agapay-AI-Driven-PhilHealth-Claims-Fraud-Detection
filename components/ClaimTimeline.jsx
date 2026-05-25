import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function ClaimTimeline({ claimId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     axios.get(`/api/claims/${claimId}/timeline`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
     }).then(res => {
        setHistory(res.data.history);
        setLoading(false);
     });
  }, [claimId]);

  if (loading) return <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-ph-blue" /></div>;

  return (
    <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 py-2">
      {history.map((h, i) => (
         <div key={h.id} className="relative pl-6">
            <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-1.5 ${i === history.length - 1 ? 'bg-ph-blue ring-4 ring-blue-50' : 'bg-slate-300'}`}></div>
            <div className="text-sm font-bold text-slate-800">
               {h.toStatus.replace('_', ' ')}
            </div>
            <div className="text-xs text-slate-500 mt-1">
               {format(new Date(h.createdAt), 'MMM dd, yyyy HH:mm a')} • {h.actor?.name} ({h.actor?.role})
            </div>
            {h.notes && <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic">"{h.notes}"</div>}
         </div>
      ))}
    </div>
  );
}
