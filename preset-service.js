import { supabase, authService } from './supabase-client.js';
import { TABLES } from './supabase-config.js';

// Preset service for database operations
export class PresetService {
    constructor() {
        this.userId = null;
        this.setupUserListener();
    }

    // Set up user change listener
    setupUserListener() {
        authService.onUserChange = (user) => {
            this.userId = user?.id || null;
        };
    }

    // Get all presets for current user
    async getUserPresets() {
        if (!this.userId) {
            console.warn('No user authenticated');
            return [];
        }

        try {
            const { data, error } = await supabase
                .from(TABLES.PRESETS)
                .select('*')
                .eq('user_id', this.userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Get user presets error:', error);
            return [];
        }
    }

    // Save preset to database
    async savePreset(presetData) {
        if (!this.userId) {
            console.warn('No user authenticated');
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const preset = {
                user_id: this.userId,
                name: presetData.name,
                data: presetData.data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from(TABLES.PRESETS)
                .insert(preset)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Save preset error:', error);
            return { success: false, error: error.message };
        }
    }

    // Update existing preset
    async updatePreset(presetId, presetData) {
        if (!this.userId) {
            console.warn('No user authenticated');
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const updates = {
                name: presetData.name,
                data: presetData.data,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from(TABLES.PRESETS)
                .update(updates)
                .eq('id', presetId)
                .eq('user_id', this.userId) // Ensure user owns the preset
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Update preset error:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete preset
    async deletePreset(presetId) {
        if (!this.userId) {
            console.warn('No user authenticated');
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const { error } = await supabase
                .from(TABLES.PRESETS)
                .delete()
                .eq('id', presetId)
                .eq('user_id', this.userId); // Ensure user owns the preset

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Delete preset error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get preset by ID
    async getPresetById(presetId) {
        if (!this.userId) {
            console.warn('No user authenticated');
            return null;
        }

        try {
            const { data, error } = await supabase
                .from(TABLES.PRESETS)
                .select('*')
                .eq('id', presetId)
                .eq('user_id', this.userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get preset by ID error:', error);
            return null;
        }
    }

    // Search presets by name
    async searchPresets(query) {
        if (!this.userId) {
            console.warn('No user authenticated');
            return [];
        }

        try {
            const { data, error } = await supabase
                .from(TABLES.PRESETS)
                .select('*')
                .eq('user_id', this.userId)
                .ilike('name', `%${query}%`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Search presets error:', error);
            return [];
        }
    }

    // Export preset data (for backup)
    async exportPreset(presetId) {
        const preset = await this.getPresetById(presetId);
        if (!preset) return null;

        return {
            name: preset.name,
            data: preset.data,
            exported_at: new Date().toISOString()
        };
    }

    // Import preset data
    async importPreset(presetData) {
        if (!this.userId) {
            console.warn('No user authenticated');
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const preset = {
                user_id: this.userId,
                name: presetData.name,
                data: presetData.data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from(TABLES.PRESETS)
                .insert(preset)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Import preset error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sync local presets with database
    async syncPresets(localPresets) {
        if (!this.userId) {
            console.warn('No user authenticated');
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const dbPresets = await this.getUserPresets();
            const localPresetMap = new Map(localPresets.map(p => [p.name, p]));
            const dbPresetMap = new Map(dbPresets.map(p => [p.name, p]));

            const toCreate = [];
            const toUpdate = [];

            // Find presets to create or update
            for (const [name, localPreset] of localPresetMap) {
                if (!dbPresetMap.has(name)) {
                    toCreate.push(localPreset);
                } else {
                    const dbPreset = dbPresetMap.get(name);
                    if (JSON.stringify(localPreset.data) !== JSON.stringify(dbPreset.data)) {
                        toUpdate.push({ ...localPreset, id: dbPreset.id });
                    }
                }
            }

            // Create new presets
            for (const preset of toCreate) {
                await this.savePreset(preset);
            }

            // Update existing presets
            for (const preset of toUpdate) {
                await this.updatePreset(preset.id, preset);
            }

            return { success: true, created: toCreate.length, updated: toUpdate.length };
        } catch (error) {
            console.error('Sync presets error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global preset service instance
export const presetService = new PresetService(); 