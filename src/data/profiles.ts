import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;
export type UserRole = Tables<'user_roles'>['role'];

export async function getProfileRole(id: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data?.role ?? null;
}

export async function getProfileName(id: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data?.full_name ?? null;
}

export async function getProfileHeader(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data
    ? { ...data, full_name: data.full_name || '', role: data.role || 'employee' }
    : null;
}

export async function getProfileSettings(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, email, phone, branch, department')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getUserProfile(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, role, email, department, branch')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data
    ? { ...data, role: data.role || 'employee' }
    : null;
}

export async function getProfileNames(ids: string[]) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', ids);

  if (error) throw error;
  return data;
}

export async function getProfilesByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone')
    .in('id', ids);

  if (error) throw error;
  return data;
}

export async function listProfilesForAdministration() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, department, branch, phone')
    .order('full_name');

  if (error) throw error;
  return data.map((profile) => ({
    ...profile,
    role: profile.role || 'employee',
  }));
}

export async function listDesigners() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .eq('role', 'designer')
    .order('full_name');

  if (error) throw error;
  return data;
}

export async function listSalesmen() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone')
    .eq('role', 'salesman')
    .order('full_name');

  if (error) throw error;
  return data;
}

export async function listDesignerProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .or('role.eq.designer,and(role.eq.manager,id.eq.f47e1264-dbb8-4645-a712-013b3d77fed5)')
    .order('full_name');

  if (error) throw error;
  return data;
}

export async function listProfilesWithDetails(role?: 'designer' | 'salesman') {
  let query = supabase
    .from('profiles')
    .select('id, full_name, email, phone, branch, department, is_active, role, created_at')
    .order('full_name');

  if (role) query = query.eq('role', role);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function listProfilesForExport() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role, branch, department, is_active, created_at');

  if (error) throw error;
  return data;
}

export async function updateProfile(id: string, updates: ProfileUpdate): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function insertProfile(profile: ProfileInsert) {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select('id, full_name, email, role, department, branch, phone')
    .single();

  if (error) throw error;
  return data;
}

export async function listUserRoleIds(role: UserRole) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', role);

  if (error) throw error;
  return data;
}

export async function hasUserRole(userId: string, role: UserRole): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', role)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export async function listProfilesByIds(ids: string[], roleToExclude: NonNullable<UserRole>) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone, email')
    .in('id', ids)
    .neq('role', roleToExclude)
    .order('full_name');

  if (error) throw error;
  return data;
}
