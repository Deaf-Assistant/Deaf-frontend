import { createClient } from '@supabase/supabase-js'
import { CmuEntraIDBasicInfo } from "@/types/CmuEntraIDBasicInfo";


export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function signInWithCMUUser(cmuUser: CmuEntraIDBasicInfo) {
  const email = cmuUser.cmuitaccount;
  const fullName = `${cmuUser.firstname_EN} ${cmuUser.lastname_EN}`;
  
  // Logic กำหนด Role (ใช้เฉพาะตอนสร้าง User ใหม่เท่านั้น)
  let initialRole = 'STUDENT';
  const accountType = cmuUser.itaccounttype_EN.toLowerCase();
  if (accountType.includes('staff') || accountType.includes('misaccount')) {
    initialRole = 'LECTURER'; 
  }

  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const existingAuthUser = users.find(u => u.email === email);
  
  let userId = existingAuthUser?.id;

  if (!userId) {
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: { name: fullName, role: initialRole }
    });
    
    if (createError) throw createError;
    userId = newUser.user!.id;
  }


  const { data: existingProfile } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!existingProfile) {

    await supabaseAdmin.from('users').insert({
      id: userId,
      email: email,
      name: fullName,
      role: initialRole // ✅ ใส่ Role ตรงนี้
    });
  } else {

    await supabaseAdmin.from('users').update({
      name: fullName,
    }).eq('id', userId);
  }

  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/`
    }
  });

  if (linkError) throw linkError;
  return linkData.properties?.action_link;
}