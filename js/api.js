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
        // Try saving with payment_method
        const { error } = await supabase.from('expense_logs').upsert(log);
        
        if (error && (error.message?.includes('column "payment_method" does not exist') || error.code === '42703')) {
            console.warn('Column payment_method not found, saving without it...');
            const { payment_method, ...cleanLog } = log;
            const { error: retryError } = await supabase.from('expense_logs').upsert(cleanLog);
            return !retryError;
        }
        
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
    async updateGroupBonus(bonusId, updates) {
        const { error } = await supabase.from('group_bonuses').update(updates).eq('id', bonusId);
        if (error) console.error('Supabase updateGroupBonus Error:', error);
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
        // Check if already enrolled for this date (Safe check)
        const { data: existingRecords } = await supabase
            .from('enrollments')
            .select('id')
            .eq('sun_key', sunKey)
            .eq('user_id', userId);

        const existing = existingRecords && existingRecords.length > 0 ? existingRecords[0] : null;

        if (existing) {
            // Update existing record
            const { error } = await supabase
                .from('enrollments')
                .update({ 
                    gear: gear, 
                    user_email: email
                })
                .eq('id', existing.id);
            return !error;
        } else {
            // New enrollment
            const { error } = await supabase.from('enrollments').insert({
                sun_key: sunKey,
                user_id: userId,
                user_email: email,
                gear: gear
            });
            if (error) console.error('Supabase enroll Error:', error.message);
            return !error;
        }
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
        // Use service_role to bypass RLS.
        const adminKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3lmemVpaWpoZ2phendrZGxrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjUwODEwNCwiZXhwIjoyMDg4MDg0MTA0fQ.VQpeQjKc9NLT8n9zxqN_u2PZzAgU9jz6-85xIYMQ2dU';
        
        if (!window._adminSupabaseClient) {
            window._adminSupabaseClient = window.supabase.createClient(supabaseUrl, adminKey, {
                auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
            });
        }
        
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
    async generateMissionWithGemini(apiKey) {
        const cleanKey = apiKey ? apiKey.trim() : '';
        const promptText = `Eres un oficial de operaciones de Airsoft. Genera una misión breve, directa y con mucho ambiente táctico en ESPAÑOL.
        Párrafos cortos. Sin listas.
        JSON: {"title_loc":"...","objective":"...","gear":"...","map_prompt":"..."}.
        En map_prompt describe un mapa militar con zonas marcadas como 'SECTOR ALFA', 'ZONA DE EXTRACCIÓN', 'PUNTO BRAVO'.`;

        const normalize = (data, source) => ({
            title_loc: data.title_loc || data.title || data.situation || 'OPERACIÓN AGOGE - SECTOR X',
            objective: data.objective || data.mission || data.description || 'Objetivos tácticos pendientes.',
            gear: data.gear || data.equipment || data.rules || 'Equipación estándar.',
            map_prompt: data.map_prompt || data.map || 'Tactical airsoft map',
            is_fallback: data.is_fallback || false,
            source: source
        });

        // --- INTENTO 1: GOOGLE GEMINI ---
        if (cleanKey.length > 10) {
            // Solo modelos que existen en tu cuenta (verificado)
            const models = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash'];
            for (const model of models) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
                    let resp = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
                    });

                    // Si Google dice "espera" (429), reintentar una vez tras 3 segundos
                    if (resp.status === 429) {
                        console.warn(`Gemini ${model}: Rate limit. Reintentando en 3s...`);
                        await new Promise(r => setTimeout(r, 3000));
                        resp = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
                        });
                    }

                    if (resp.ok) {
                        const result = await resp.json();
                        const text = result.candidates[0].content.parts[0].text;
                        const jsonMatch = text.match(/\{[\s\S]*\}/);
                        if (jsonMatch) return normalize(JSON.parse(jsonMatch[0]), `Google ${model}`);
                    } else if (resp.status === 403 || resp.status === 400) {
                        console.error(`Error Google (${model}): ${resp.status}`);
                        break;
                    }
                } catch (e) { console.error(`Fallo en modelo ${model}:`, e); }
            }
        }

        // --- INTENTO 2: IA RESPALDO ---
        try {
            const pollUrl = `https://text.pollinations.ai/${encodeURIComponent(promptText)}?model=openai&json=true`;
            const resp = await fetch(pollUrl);
            if (resp.ok) {
                const text = await resp.text();
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) return normalize(JSON.parse(jsonMatch[0]), 'IA de Respaldo');
            }
        } catch (e) { console.error('Respaldo Error:', e); }

        // --- INTENTO 3: LOCAL DB ---
        const backup = [
            {
                title_loc: "OPERACIÓN CENTINELA - Sector Bravo",
                objective: "Infiltración silenciosa para asegurar inteligencia crítica.",
                gear: "Uniforme multicam y radio obligatoria.",
                map_prompt: "Tactical forest map",
                is_fallback: true
            },
            {
                title_loc: "SABOTAJE EN LA FRONTERA - Delta",
                objective: "Neutralizar comunicaciones enemigas en 120 min.",
                gear: "Uniforme boscoso y gafas de protección.",
                map_prompt: "Mountain border map",
                is_fallback: true
            }
        ];
        return backup[Math.floor(Math.random() * backup.length)];
    },
    async proxyUploadFromUrl(imageUrl, sunKey) {
        // Asegurar que el cliente admin esté listo
        const adminKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZla3lmemVpaWpoZ2phendrZGxrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjUwODEwNCwiZXhwIjoyMDg4MDg0MTA0fQ.VQpeQjKc9NLT8n9zxqN_u2PZzAgU9jz6-85xIYMQ2dU';
        if (!window._adminSupabaseClient) {
            window._adminSupabaseClient = window.supabase.createClient(supabaseUrl, adminKey, {
                auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
            });
        }
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], `ai_map_${sunKey}.jpg`, { type: 'image/jpeg' });
            return await this.uploadMissionMap(file, sunKey);
        } catch (e) {
            console.error('Proxy Upload Error:', e);
            return null;
        }
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
    async addRespect(photoId) {
        try {
            const { data } = await supabase.from('community_photos').select('respects').eq('id', photoId).single();
            const newRespects = (data?.respects || 0) + 1;
            const { error } = await supabase.from('community_photos').update({ respects: newRespects }).eq('id', photoId);
            return !error;
        } catch (err) {
            console.error('Respect error:', err);
            return false;
        }
    },
    async uploadCommunityPhoto(userId, file, caption) {
        const fileExt = file.name.split('.').pop();
        const fileName = `op_${userId}_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('community_photos').upload(fileName, file);
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('community_photos').getPublicUrl(fileName);
        
        const { error: dbError } = await supabase.from('community_photos').insert({
            user_id: userId,
            image_url: urlData.publicUrl,
            caption: caption,
            status: 'pending',
            respects: 0
        });
        
        if (dbError) throw dbError;
        return true;
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
