import { supabase } from './supabase';
import { ProjectExport, AssetType, Layer } from '../types';

export interface CloudProject {
    id: string;
    name: string;
    asset_type: AssetType;
    layers: Layer[];
    meta: any;
    thumbnail?: string;
    updated_at: string;
    is_public?: boolean;
}

export const cloudStorageService = {
    async listProjects(): Promise<CloudProject[]> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async saveProject(project: Omit<CloudProject, 'id' | 'updated_at' | 'user_id'>, id?: string): Promise<CloudProject> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Utilisateur non connecté");

        const projectData = {
            ...project,
            user_id: user.id,
            updated_at: new Date().toISOString(),
        };

        let result;
        if (id) {
            result = await supabase
                .from('projects')
                .update(projectData)
                .eq('id', id)
                .select()
                .single();
        } else {
            result = await supabase
                .from('projects')
                .insert(projectData)
                .select()
                .single();
        }

        if (result.error) throw result.error;
        return result.data;
    },

    async toggleProjectPublic(id: string, is_public: boolean): Promise<void> {
        const { error } = await supabase
            .from('projects')
            .update({ is_public })
            .eq('id', id);

        if (error) throw error;
    },

    async deleteProject(id: string): Promise<void> {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getProject(id: string): Promise<CloudProject> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }
};
