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
        const { error } = await supabase.from('missions').upsert(mission);
        if (error) console.error('Supabase saveMission Error:', error.message, error.details, error.hint);
        return !error;
    },
    async uploadCommunityPhoto(file, userId, caption) {
        // 1. Upload to Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
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
    }
};
