const { supabaseAdminClient } = require("../config/supabase");

function fallbackProfileFromUser(user) {
  const metadata = user?.user_metadata || {};
  return {
    id: user?.id || null,
    full_name: typeof metadata.full_name === "string" ? metadata.full_name : null,
    phone: typeof metadata.phone === "string" ? metadata.phone : null,
    role: typeof metadata.role === "string" ? metadata.role : null,
  };
}

function isMissingProfilesTableError(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("could not find the table") &&
    message.includes("public.profiles")
  );
}

async function upsertProfile(userId, fullName, phone) {
  if (!supabaseAdminClient || !userId) {
    return { ok: true };
  }

  const payload = { id: userId };
  if (fullName) {
    payload.full_name = fullName;
  }
  if (phone) {
    payload.phone = phone;
  }

  const { error } = await supabaseAdminClient.from("profiles").upsert(payload);
  if (error) {
    if (isMissingProfilesTableError(error)) {
      return { ok: true, skipped: true };
    }
    return { ok: false, error };
  }
  return { ok: true };
}

async function getProfile(user) {
  if (!supabaseAdminClient || !user?.id) {
    return { ok: true, profile: fallbackProfileFromUser(user) };
  }

  const { data, error } = await supabaseAdminClient
    .from("profiles")
    .select("id, full_name, phone, role")
    .eq("id", user.id)
    .single();

  if (error) {
    if (isMissingProfilesTableError(error)) {
      return { ok: true, profile: fallbackProfileFromUser(user) };
    }
    if (error.code === "PGRST116") {
      return { ok: true, profile: fallbackProfileFromUser(user) };
    }
    return { ok: false, error };
  }

  return { ok: true, profile: data || fallbackProfileFromUser(user) };
}

module.exports = {
  upsertProfile,
  getProfile,
};
