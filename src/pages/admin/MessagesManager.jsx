import React, { useState } from 'react';
import { Mail, Trash2, ExternalLink } from 'lucide-react';

export default function MessagesManager() {
  const [messages, setMessages] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', subject: 'Project Inquiry', date: '2023-10-25', read: false },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', subject: 'Collaboration', date: '2023-10-24', read: true },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-200">Messages</h2>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="p-4 text-slate-400 font-medium text-sm">Sender</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Subject</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Date</th>
                <th className="p-4 text-slate-400 font-medium text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id} className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${!msg.read ? 'bg-slate-800/20' : ''}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${!msg.read ? 'bg-primary' : 'bg-transparent'}`}></div>
                      <div>
                        <p className={`font-medium ${!msg.read ? 'text-slate-200' : 'text-slate-400'}`}>{msg.name}</p>
                        <p className="text-xs text-slate-500">{msg.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`p-4 ${!msg.read ? 'text-slate-200 font-medium' : 'text-slate-400 text-sm'}`}>{msg.subject}</td>
                  <td className="p-4 text-slate-400 text-sm">{msg.date}</td>
                  <td className="p-4 flex justify-end gap-3">
                    <button className="text-slate-400 hover:text-primary transition-colors">
                      <ExternalLink size={18} />
                    </button>
                    <button className="text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
