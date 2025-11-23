
import React, { useEffect, useState } from 'react';
import { ArticleReport } from '../../types';
import { getReports, dismissReport, notifyAuthorOfReport } from '../../services/contentService';
import { useToast } from '../../context/ToastContext';

const ReportCenter: React.FC = () => {
  const [reports, setReports] = useState<ArticleReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);
  const [notifyMessage, setNotifyMessage] = useState('');
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    const data = await getReports();
    // Sort by status (open first) then date
    data.sort((a, b) => {
        if (a.status === 'open' && b.status !== 'open') return -1;
        if (a.status !== 'open' && b.status === 'open') return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDismiss = async (id: string) => {
      await dismissReport(id);
      addToast("Report dismissed.", 'info');
      load();
  };

  const initiateNotify = (report: ArticleReport) => {
      setNotifyingId(report.id);
      setNotifyMessage(`Notice: Your article "${report.articleTitle}" has been flagged for ${report.reason}. Please review our editorial guidelines.`);
  };

  const confirmNotify = async () => {
      if (!notifyingId) return;
      await notifyAuthorOfReport(notifyingId, notifyMessage);
      addToast("Author notified successfully.", 'success');
      setNotifyingId(null);
      load();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading reports...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center border-b-2 border-black dark:border-white pb-4">
         <h3 className="text-2xl font-serif font-black dark:text-white uppercase">Report Center</h3>
         <span className="bg-red-600 text-white font-bold px-3 py-1 rounded-full text-sm">{reports.filter(r => r.status === 'open').length} Open</span>
      </div>

      {reports.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 font-bold">No reports filed.</p>
          </div>
      ) : (
          <div className="space-y-4">
              {reports.map(report => (
                  <div key={report.id} className={`p-4 rounded-lg border-2 ${report.status === 'open' ? 'bg-white dark:bg-brand-dark border-red-500' : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-75'}`}>
                      <div className="flex justify-between items-start mb-2">
                          <div>
                             <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white ${report.status === 'open' ? 'bg-red-500' : 'bg-gray-500'}`}>{report.status}</span>
                             <h4 className="font-bold text-lg text-black dark:text-white mt-1">
                                 Reported Article: {report.articleTitle}
                             </h4>
                             <p className="text-xs text-gray-500">{new Date(report.timestamp).toLocaleString()}</p>
                          </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded mb-3">
                          <p className="text-sm font-bold text-black dark:text-white">Reason: <span className="text-red-600 dark:text-red-400">{report.reason}</span></p>
                          {report.details && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">"{report.details}"</p>}
                      </div>

                      {report.status === 'open' && (
                          <div className="flex justify-end gap-3 mt-4">
                              {notifyingId === report.id ? (
                                  <div className="w-full bg-gray-100 dark:bg-gray-800 p-3 rounded border border-gray-300">
                                      <label className="block text-xs font-bold uppercase mb-1 dark:text-gray-300">Message to Author</label>
                                      <textarea 
                                        className="w-full p-2 text-sm border rounded mb-2 dark:bg-black dark:text-white dark:border-gray-600"
                                        value={notifyMessage}
                                        onChange={e => setNotifyMessage(e.target.value)}
                                        rows={2}
                                      />
                                      <div className="flex justify-end gap-2">
                                          <button onClick={() => setNotifyingId(null)} className="text-xs font-bold uppercase text-gray-500 hover:text-black">Cancel</button>
                                          <button onClick={confirmNotify} className="text-xs font-bold uppercase bg-black text-white px-3 py-1 rounded">Send Notification</button>
                                      </div>
                                  </div>
                              ) : (
                                  <>
                                    <button onClick={() => handleDismiss(report.id)} className="px-3 py-1 text-sm font-bold border border-gray-400 text-gray-600 rounded hover:bg-gray-200">Dismiss</button>
                                    <button onClick={() => initiateNotify(report)} className="px-3 py-1 text-sm font-bold bg-brand-cyan text-white rounded hover:bg-cyan-600">Notify Author</button>
                                  </>
                              )}
                          </div>
                      )}
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default ReportCenter;
