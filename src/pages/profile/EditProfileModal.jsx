import { useState, useEffect } from 'react';
import { X, User, Image as ImageIcon } from 'lucide-react';

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState({ name: '', profilePictureUrl: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name || '', profilePictureUrl: user.profilePictureUrl || '' });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => setFormData(prev => ({ ...prev, [name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error("Failed to save profile:", error);
            // Optionally show an error message to the user in the modal itself
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border/50 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
                        <button type="button" onClick={onClose} className="p-1 rounded-full text-muted-foreground hover:bg-white/10 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full bg-input-background border border-border rounded-md pl-10 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Your Name" required />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="profilePictureUrl" className="block text-sm font-medium text-muted-foreground mb-2">Profile Picture URL</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input type="url" id="profilePictureUrl" name="profilePictureUrl" value={formData.profilePictureUrl} onChange={handleChange} className="w-full bg-input-background border border-border rounded-md pl-10 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://example.com/image.png" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-4 p-4 bg-input-background/50 border-t border-border rounded-b-xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md border border-border text-foreground hover:bg-white/5 transition-colors" disabled={isSaving}>Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold rounded-md bg-primary-to text-primary-foreground hover:bg-primary-to/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;