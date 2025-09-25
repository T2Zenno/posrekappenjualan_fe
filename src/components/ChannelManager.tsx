import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useData, type Channel } from '@/hooks/useData';
import { toast } from "sonner";
import { Save, RotateCcw, Edit, Trash2, ExternalLink, Plus, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

const ChannelManager: React.FC = () => {
  const { channels, addChannel, updateChannel, deleteChannel, refetchChannels } = useData();

  const [searchTerm, setSearchTerm] = React.useState('');
  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      const searchLower = searchTerm.toLowerCase();
      return (
        channel.name.toLowerCase().includes(searchLower) ||
        (channel.desc && channel.desc.toLowerCase().includes(searchLower)) ||
        (channel.url && channel.url.toLowerCase().includes(searchLower))
      );
    })
  }, [channels, searchTerm]);

  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    url: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      updateChannel({ id: editingChannel.id, channel: channelData });
      toast.success('Channel berhasil diperbarui');
    } else {
      addChannel(channelData);
      toast.success('Channel berhasil ditambahkan');
    }

    closeModal();
  };

  const resetForm = () => {
    setFormData({ name: '', desc: '', url: '' });
    setEditingChannel(null);
  };

  const openModalForAdd = () => {
    setEditingChannel(null);
    setFormData({ name: '', desc: '', url: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (channel: Channel) => {
    setFormData({
      name: channel.name,
      desc: channel.desc,
      url: channel.url
    });
    setEditingChannel(channel);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingChannel(null);
    setFormData({ name: '', desc: '', url: '' });
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

  const handleRefresh = () => {
    refetchChannels();
    toast.success('Data channel diperbarui');
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in px-4 md:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gradient">Channel Pembelian</h1>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={openModalForAdd} className="bg-gradient-primary w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-full max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">{editingChannel ? 'Edit Channel' : 'Tambah Channel'}</DialogTitle>
            <DialogDescription>
              {editingChannel ? 'Perbarui data channel' : 'Masukkan data channel baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modal-name">Nama Channel *</Label>
              <Input
                id="modal-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="WhatsApp / TikTok / IG / Website…"
                className="glass"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-desc">Deskripsi (opsional)</Label>
              <Input
                id="modal-desc"
                value={formData.desc}
                onChange={(e) => setFormData(prev => ({ ...prev, desc: e.target.value }))}
                placeholder="Keterangan"
                className="glass"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-url">URL Default (opsional)</Label>
              <Input
                id="modal-url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://…"
                className="glass"
              />
            </div>

            <div className="md:col-span-3 flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="bg-gradient-primary w-full sm:w-auto">
                <Save className="h-4 w-4" />
                {editingChannel ? 'Perbarui' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={closeModal} className="w-full sm:w-auto">
                <RotateCcw className="h-4 w-4" />
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Channel List */}
      <Card className="glass">
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <h3 className="text-base md:text-lg font-semibold flex-1">Daftar Channel</h3>
            <div className="relative w-56">
              <Input
                placeholder="Cari channel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass pl-10"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">Nama</th>
                  <th className="text-left py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">Deskripsi</th>
                  <th className="text-left py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">URL Default</th>
                  <th className="text-center py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground no-print">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredChannels.map((channel) => (
                  <tr key={channel.id} className="border-b border-border/30 hover:bg-accent/20">
                    <td className="py-2 md:py-3 text-xs md:text-sm font-medium">{channel.name}</td>
                    <td className="py-2 md:py-3 text-xs md:text-sm text-muted-foreground">{channel.desc || '-'}</td>
                    <td className="py-2 md:py-3 text-xs md:text-sm">
                      {channel.url ? (
                        <a
                          href={channel.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <span className="truncate max-w-32 md:max-w-48">{channel.url}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-2 md:py-3 text-center no-print">
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModalForEdit(channel)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(channel.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredChannels.length === 0 && (
              <div className="text-center py-6 md:py-8 text-muted-foreground text-sm md:text-base">
                {searchTerm ? 'Tidak ada channel yang cocok dengan pencarian' : 'Belum ada data channel'}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChannelManager;
