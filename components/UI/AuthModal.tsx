import React, { useState } from 'react';
import { authService } from '../../services/auth';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await authService.signIn(email, password);
            } else {
                await authService.signUp(email, password);
                alert('Inscription réussie ! Vérifiez votre boîte mail si nécessaire.');
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white neo-border w-full max-w-md animate-in">
                <header className="bg-black text-white p-4 flex justify-between items-center">
                    <h2 className="font-syne font-black text-xl uppercase tracking-tighter">
                        {isLogin ? 'Connexion Studio' : 'Créer un compte'}
                    </h2>
                    <button onClick={onClose} className="hover:text-[#A3FF00] transition-colors font-black">X</button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-100 border-2 border-red-600 p-2 text-xs font-bold text-red-600 uppercase">
                            ⚠️ {error}
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-black uppercase mb-1 block">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full neo-border-fine p-2 font-roboto-condensed"
                            placeholder="votre@email.com"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase mb-1 block">Mot de passe</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full neo-border-fine p-2 font-roboto-condensed"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#A3FF00] text-black neo-border-fine neo-shadow-sm neo-active font-syne font-black py-3 uppercase hover:bg-[#8ee000] transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Traitement...' : isLogin ? 'Se connecter' : "S'inscrire"}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[10px] font-black uppercase underline hover:text-[#D20A33]"
                        >
                            {isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;
