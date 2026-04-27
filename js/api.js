/**
 * AGOGE ELITE - API Service Module
 * Handles all communications with Supabase.
 */

const supabaseUrl = 'https://vekyfzeiijhgjazwkdlk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3lmemVpaWpoZ2phendrZGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MDgxMDQsImV4cCI6MjA4ODA4NDEwNH0.HiA8WOEAo6qx2HpnYpOWqea8-Sdxuew8gNFsuRTJ9cY';

let supabase = null;

export const initSupabase = () => {
    try {
        if (window.supabase) {
            supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
            console.log('Supabase client initialized successfully.');
            return supabase;
        } else {
            console.error('Supabase library not found!');
            return null;
        }
    } catch (e) {
        console.error('Error creating Supabase client:', e);
        return null;
    }
};

export const api = {
    async getProfile(userId) {
        const { data } = await supabase.from('users').select('*').eq('id', userId).single();
        return data || null;
    },
    async deletePhoto(id) {
        const { error } = await supabase.from('photos').delete().eq('id', id);
        return !error;
    },

    // --- SECRETARY ATTENDANCE LOGS ---
    async getAttendanceLogs() {
        const { data } = await supabase.from('attendance_logs').select('*').order('date', { ascending: false });
        return data || [];
    },
    async saveAttendanceLog(log) {
        const { error } = await supabase.from('attendance_logs').upsert(log);
        if (error) console.error('Supabase saveAttendanceLog Error:', error);
        return !error;
    },
    async deleteAttendanceLog(logId) {
        const { error } = await supabase.from('attendance_logs').delete().eq('id', logId);
        return !error;
    },
    // --- EXPENSES ---
    async getExpenseLogs() {
        const { data } = await supabase.from('expense_logs').select('*').order('date', { ascending: false });
        return data || [];
    },
    async saveExpenseLog(log) {
        const { error } = await supabase.from('expense_logs').upsert(log);
        if (error) console.error('Supabase saveExpenseLog Error:', error);
        return !error;
    },
    async deleteExpenseLog(logId) {
        const { error } = await supabase.from('expense_logs').delete().eq('id', logId);
        return !error;
    },
    // --- GROUP BONUSES ---
    async getGroupBonuses() {
        const { data } = await supabase.from('group_bonuses').select('*').order('created_at', { ascending: false });
        return data || [];
    },
    async saveGroupBonus(bonus) {
        const { error } = await supabase.from('group_bonuses').upsert(bonus);
        if (error) console.error('Supabase saveGroupBonus Error:', error);
        return !error;
    },
    async deleteGroupBonus(bonusId) {
        const { error } = await supabase.from('group_bonuses').delete().eq('id', bonusId);
        return !error;
    },
    async syncToSheets(record, type = 'attendance') {
        const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbzMVnIleBd4QxemWy8Qsrb7ZdqjPULzmzOQ2TLWrKxzWKtD1q2sOYuoEt3r1DsAKC8K/exec';
        const SHEETS_WEBAPP_URL = localStorage.getItem('sec_sheets_url') || DEFAULT_URL;
        if (!SHEETS_WEBAPP_URL) return { ok: false, msg: 'URL no configurada' };
        try {
            await fetch(SHEETS_WEBAPP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record)
            });
            return { ok: true };
        } catch (e) {
            return { ok: false, msg: e.message };
        }
    },
    async getUsers() {
        const { data } = await supabase.from('users').select('*');
        return data || [];
    },
    async saveProfile(profile) {
        const { error } = await supabase.from('users').upsert(profile);
        if (error) console.error('Supabase saveProfile Error:', error.message, error.details, error.hint);
        return !error;
    },
    async getEnrollments() {
        const { data } = await supabase.from('enrollments').select('*');
        const transformed = {};
        data?.forEach(e => {
            if (!transformed[e.sun_key]) transformed[e.sun_key] = [];
            transformed[e.sun_key].push(e);
        });
        return transformed;
    },
    async enroll(sunKey, userId, email, gear) {
        const { error } = await supabase.from('enrollments').insert({
            sun_key: sunKey,
            user_id: userId,
            user_email: email,
            gear: gear
        });
        if (error) console.error('Supabase enroll Error:', error.message, error.details, error.hint);
        return !error;
    },
    async enrollGuest(sunKey, name, email, gear) {
        const { error } = await supabase.from('enrollments').insert({
            sun_key: sunKey,
            is_guest: true,
            guest_name: name,
            user_email: email,
            gear: gear
        });
        if (error) console.error('Supabase enrollGuest Error:', error.message, error.details, error.hint);
        return !error;
    },
    async unenroll(enrollmentId) {
        const { error } = await supabase.from('enrollments').delete().eq('id', enrollmentId);
        if (error) console.error('Supabase unenroll Error:', error.message, error.details, error.hint);
        return !error;
    },
    async getClans() {
        const { data } = await supabase.from('clans').select('*');
        return data || [];
    },
    async createClan(name, leaderId, leaderEmail) {
        const { error } = await supabase.from('clans').insert({ name, leader_id: leaderId, leader_email: leaderEmail });
        return !error;
    },
    async getVotes(sunKey) {
        const { data } = await supabase.from('votes').select('*').eq('sun_key', sunKey);
        const votesObj = {};
        data?.forEach(v => votesObj[v.user_email] = v.mode);
        return votesObj;
    },
    async castVote(sunKey, userId, email, mode) {
        const { error } = await supabase.from('votes').upsert({ sun_key: sunKey, user_id: userId, user_email: email, mode });
        return !error;
    },
    async getMissionSettings(sunKey) {
        const { data } = await supabase.from('missions').select('*').eq('sun_key', sunKey).single();
        return data || null;
    },
    async saveMissionSettings(mission) {
        // Use service_role to bypass RLS. Specify onConflict to handle updates correctly.
        const adminKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3lmemVpaWpoZ2phendrZGxrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjUwODEwNCwiZXhwIjoyMDg4MDg0MTA0fQ.VQpeQjKc9NLT8n9zxqN_u2PZzAgU9jz6-85xIYMQ2dU';
        
        if (!window._adminSupabaseClient) {
            window._adminSupabaseClient = window.supabase.createClient(supabaseUrl, adminKey, {
                auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } // Avoid warnings
            });
        }

        const { error } = await window._adminSupabaseClient
            .from('missions')
            .upsert(mission, { onConflict: 'sun_key' });

        if (error) console.error('Supabase saveMission Error:', error.message, error.details, error.hint);
        return !error;
    },
    async uploadMissionMap(file, sunKey) {
        if (!window._adminSupabaseClient) return null;
        
        const fileExt = file.name.split('.').pop();
        const fileName = `map_${sunKey}_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await window._adminSupabaseClient.storage
            .from('mission_maps')
            .upload(fileName, file);

        if (uploadError) {
            console.error('Storage Upload Map Error:', uploadError);
            return null;
        }

        const { data: urlData } = window._adminSupabaseClient.storage
            .from('mission_maps')
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    },
    async uploadCommunityPhoto(file, userId, caption) {
        // 1. Upload to Storage
        const fileExt = file.name.split('.').pop();
        const safeUserId = String(userId).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        const fileName = `${safeUserId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('community_photos')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Storage Upload Error:', uploadError);
            return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('community_photos')
            .getPublicUrl(filePath);

        // 2. Insert into DB
        const { data: dbData, error: dbError } = await supabase.from('community_photos').insert({
            user_id: userId,
            image_url: urlData.publicUrl,
            caption: caption,
            status: 'pending'
        }).select().single();

        if (dbError) {
            console.error('DB Insert Error:', dbError);
            return null;
        }
        return dbData;
    },
    async getCommunityPhotos(status = 'approved') {
        const { data } = await supabase.from('community_photos').select('*').eq('status', status).order('created_at', { ascending: false });
        return data || [];
    },
    async updateCommunityPhotoStatus(id, newStatus) {
        const { error } = await supabase.from('community_photos').update({ status: newStatus }).eq('id', id);
        if (error) console.error('Supabase updatePhoto Error:', error.message, error.details, error.hint);
        return !error;
    },
    async deleteCommunityPhoto(id, imageUrl) {
        try {
            // 1. Delete from DB
            const { error: dbError } = await supabase.from('community_photos').delete().eq('id', id);
            if (dbError) throw dbError;

            // 2. Extract path and delete from Storage
            const pathParts = imageUrl.split('/community_photos/');
            if (pathParts.length > 1) {
                const filePath = pathParts[1];
                await supabase.storage.from('community_photos').remove([filePath]);
            }
            return true;
        } catch (error) {
            console.error('Delete photo error:', error);
            return false;
        }
    },

    // --- SOCIAL SYSTEM ---
    async searchUsers(query) {
        // Usamos una consulta más robusta para el OR
        const { data, error } = await supabase.from('users')
            .select('id, callsign, name, specialty, faction, exp')
            .or(`callsign.ilike.%${query}%,name.ilike.%${query}%`)
            .limit(15);
        
        if (error) {
            console.error('Supabase Search Error:', error.message);
            // Reintento simplificado por callsign
            const { data: retryData } = await supabase.from('users')
                .select('id, callsign, name, specialty, faction, exp')
                .ilike('callsign', `%${query}%`)
                .limit(10);
            return retryData || [];
        }
        return data || [];
    },
    async sendFriendRequest(userId, friendId) {
        const { error } = await supabase.from('friendships').insert({ user_id: userId, friend_id: friendId, status: 'pending' });
        return !error;
    },
    async getFriendships(userId) {
        const { data } = await supabase.from('friendships')
            .select(`
                id, status, user_id, friend_id,
                user:user_id(id, callsign, avatar, specialty, faction, exp),
                friend:friend_id(id, callsign, avatar, specialty, faction, exp)
            `)
            .or(`user_id.eq.${userId},friend_id.eq.${userId}`);
        return data || [];
    },
    async updateFriendship(id, status) {
        const { error } = await supabase.from('friendships').update({ status }).eq('id', id);
        return !error;
    },
    async deleteFriendship(id) {
        const { error } = await supabase.from('friendships').delete().eq('id', id);
        return !error;
    }
};
