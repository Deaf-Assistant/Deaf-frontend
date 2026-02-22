import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { UserRole } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const { email, password, name, role } = await request.json() as {
            email: string;
            password: string;
            name: string;
            role: UserRole;
        };

        if (!email || !password || !name) {
            return NextResponse.json({ ok: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
        }

        // 1. Create the auth user via admin API (bypasses RLS, no email confirm needed for immediate use)
        const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // skip email confirmation so they can log in right away
            user_metadata: { name, role },
        });

        if (authError) {
            // Supabase returns a specific message for duplicate email
            const message = authError.message.includes('already')
                ? 'อีเมลนี้ถูกใช้งานแล้ว'
                : authError.message;
            return NextResponse.json({ ok: false, message }, { status: 400 });
        }

        const userId = newAuthUser.user.id;

        // 2. Insert the profile row using admin client (bypasses RLS)
        const { error: profileError } = await supabaseAdmin.from('users').insert({
            id: userId,
            email,
            name,
            role: role ?? 'MEMBER',
        });

        if (profileError) {
            // Roll back: delete the auth user so they can try again without being stuck
            await supabaseAdmin.auth.admin.deleteUser(userId);
            console.error('Profile insert failed:', profileError);
            return NextResponse.json(
                { ok: false, message: 'ไม่สามารถสร้างข้อมูลผู้ใช้ได้ กรุณาลองใหม่' },
                { status: 500 }
            );
        }

        return NextResponse.json({ ok: true, userId });
    } catch (err: any) {
        console.error('Register route error:', err);
        return NextResponse.json({ ok: false, message: err.message ?? 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}
