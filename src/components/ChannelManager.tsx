import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useData, type Channel } from '@/hooks/useData';
import { toast } from "sonner";
import { Save, RotateCcw, Edit, Trash2, ExternalLink } from 'lucide-react';

const ChannelManager: React.FC = () => {
  const { channels, addChannel, updateChannel, deleteChannel } = useData();
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    url: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nama channel harus diisi');
      return;
    }

    const channelData = {
      name: formData.name.trim(),
      desc: formData.desc.trim(),
      url: formData.url.trim()
    };

    if (editingChannel) {
      updateChannel(editingChannel.id, channelData);
      toast.success('Channel berhasil diperbarui');
      setEditingChannel(null);
    } else {
      addChannel(channelData);
      toast.success('Channel berhasil ditambahkan');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', desc: '', url: '' });
    setEditingChannel(null);
  };

  const handleEdit = (channel: Channel) => {
    setFormData({
      name: channel.name,
      desc: channel.desc,
      url: channel.url
    });
    setEditingChannel(channel);
  };

  const handleDelete = (channelId: string) => {
    if (window.confirm('Hapus channel ini?')) {
      deleteChannel(channelId);
      toast.success('Channel berhasil dihapus');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gradient">Channel Pembelian</h1>
      </div>

      {/* Form */}
      <Card className="glass">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingChannel ? 'Edit Channel' : 'Tambah Channel'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Channel *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="WhatsApp / TikTok / IG / Website…"
                className="glass"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="desc">Deskripsi (opsional)</Label>
              <Input
                id="desc"
                value={formData.desc}
                onChange={(e) => setFormData(prev => ({ ...prev, desc: e.target.value }))}
                placeholder="Keterangan"
                className="glass"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">URL Default (opsional)</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://…"
                className="glass"
              />
            </div>
            
            <div className="md:col-span-3 flex gap-3">
              <Button type="submit" className="bg-gradient-primary">
                <Save className="h-4 w-4" />
                {editingChannel ? 'Perbarui' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Channel List */}
      <Card className="glass">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daftar Channel</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Nama</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Deskripsi</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">URL Default</th>
                  <th className="text-center py-3 text-sm font-medium text-muted-foreground no-print">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((channel) => (
                  <tr key={channel.id} className="border-b border-border/30 hover:bg-accent/20">
                    <td className="py-3 text-sm font-medium">{channel.name}</td>
                    <td className="py-3 text-sm text-muted-foreground">{channel.desc || '-'}</td>
                    <td className="py-3 text-sm">
                      {channel.url ? (
                        <a
                          href={channel.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <span className="truncate max-w-48">{channel.url}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 text-center no-print">
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(channel)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(channel.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {channels.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada data channel
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChannelManager;