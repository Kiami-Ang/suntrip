'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { getUploadUrl } from '@/lib/api';

export default function OnlineUsers({ initial = [] }) {
  const [online, setOnline] = useState(initial);

  useEffect(() => {
    const token = localStorage.getItem('suntrip_token');
    if (!token) return;
    const socket = getSocket(token);
    if (!socket) return;
    socket.on('online:update', setOnline);
    const interval = setInterval(() => socket.emit('heartbeat'), 30000);
    return () => {
      socket.off('online:update', setOnline);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Utilizadores online</h3>
        <span className="flex items-center gap-1 text-sm text-suntrip-green">
          <span className="h-2 w-2 animate-pulse rounded-full bg-suntrip-green" />
          {online.length}
        </span>
      </div>
      {online.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum utilizador online</p>
      ) : (
        <ul className="space-y-3 max-h-48 overflow-y-auto">
          {online.map((u) => (
            <li key={u.id} className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-suntrip-gray-light text-sm font-medium text-suntrip-gold">
                {u.avatar ? (
                  <img src={getUploadUrl(u.avatar)} alt="" className="h-full w-full object-cover" />
                ) : (
                  u.name?.charAt(0)?.toUpperCase() || '?'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{u.name}</p>
                <p className="truncate text-xs text-gray-500">{u.email}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <Users size={14} />
        Atualização em tempo real
      </div>
    </div>
  );
}
