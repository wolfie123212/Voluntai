// Account deletion. The users row is anonymized rather than dropped because reviews
// referenced by open takedown reports must keep their foreign key for the legal record.

export async function deleteAccount(db: D1Database, userId: string): Promise<void> {
  const now = new Date().toISOString();
  await db.batch([
    db.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(userId),
    db.prepare(`DELETE FROM accounts WHERE user_id = ?`).bind(userId),
    db.prepare(`DELETE FROM volunteer_actions WHERE user_id = ?`).bind(userId),
    db.prepare(
      `DELETE FROM reviews WHERE user_id = ?
         AND id NOT IN (SELECT review_id FROM reports WHERE review_id IS NOT NULL)`
    ).bind(userId),
    db.prepare(
      `UPDATE reviews SET status = 'removed', removed_reason = 'author deleted account'
       WHERE user_id = ?`
    ).bind(userId),
    db.prepare(
      `UPDATE users SET email = ?, display_name = NULL, avatar_r2_key = NULL,
         email_verified = 0, banned_reason = 'account deleted', updated_at = ?
       WHERE id = ?`
    ).bind(`deleted-${userId}@deleted.invalid`, now, userId),
    db.prepare(
      `INSERT INTO audit_log (actor, action, target_type, target_id, reason)
       VALUES ('self', 'user.delete', 'user', ?, 'user requested account deletion')`
    ).bind(userId),
  ]);
}
