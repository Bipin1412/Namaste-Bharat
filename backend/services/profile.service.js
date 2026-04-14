const { executeResult } = require("../lib/mysql");
const { findProfileByUserId, toProfile } = require("./mysql-auth");

async function upsertProfile(userId, fullName, phone) {
  if (!userId) {
    return { ok: true };
  }

  try {
    await executeResult(
      `INSERT INTO profiles (id, full_name, phone, role)
       VALUES (?, ?, ?, 'user')
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name),
         phone = VALUES(phone)`,
      [userId, fullName || null, phone || null]
    );
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

async function getProfile(user) {
  if (!user?.id) {
    return { ok: false, error: new Error("User not found.") };
  }

  try {
    const profile = await findProfileByUserId(user.id);
    return { ok: true, profile: toProfile(profile, user) };
  } catch (error) {
    return { ok: false, error };
  }
}

module.exports = {
  upsertProfile,
  getProfile,
};
