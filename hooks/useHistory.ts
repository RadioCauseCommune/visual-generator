
import { useState, useCallback, useRef } from 'react';
import { Layer, AssetType } from '../types';

export interface ProjectState {
    layers: Layer[];
    meta: any;
    assetType: AssetType;
}

const MAX_HISTORY = 50;

export const useHistory = (initialState: ProjectState) => {
    const [past, setPast] = useState<ProjectState[]>([]);
    const [future, setFuture] = useState<ProjectState[]>([]);
    const currentStateRef = useRef<ProjectState>(initialState);

    const undo = useCallback(() => {
        if (past.length === 0) return null;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setFuture(prev => [currentStateRef.current, ...prev]);
        setPast(newPast);
        currentStateRef.current = previous;

        return previous;
    }, [past]);

    const redo = useCallback(() => {
        if (future.length === 0) return null;

        const next = future[0];
        const newFuture = future.slice(1);

        setPast(prev => [...prev, currentStateRef.current]);
        setFuture(newFuture);
        currentStateRef.current = next;

        return next;
    }, [future]);

    const recordChange = useCallback((newState: ProjectState) => {
        // Ne pas enregistrer si l'état est identique au présent
        if (JSON.stringify(newState) === JSON.stringify(currentStateRef.current)) {
            return;
        }

        setPast(prev => {
            const newPast = [...prev, currentStateRef.current];
            if (newPast.length > MAX_HISTORY) {
                return newPast.slice(1);
            }
            return newPast;
        });
        setFuture([]);
        currentStateRef.current = newState;
    }, []);

    // Helper pour mettre à jour l'état actuel sans enregistrer dans l'historique
    // Utile pour l'initialisation ou les mises à jour en cours (pendant le drag par ex)
    const setPresentQuietly = useCallback((state: ProjectState) => {
        currentStateRef.current = state;
    }, []);

    return {
        undo,
        redo,
        recordChange,
        setPresentQuietly,
        canUndo: past.length > 0,
        canRedo: future.length > 0
    };
};
