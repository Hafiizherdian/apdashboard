import { pool } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import type { UserRole, ScopeType, SessionUser } from "@/lib/auth/types";

export interface UserListItem {
  id: number;
  username: string;
  email: string | null;
  role: UserRole;
  scope_type: ScopeType;
  is_active: boolean;
  created_at: string;
  regionals: { id: string; name: string }[]; // assigned (kalau scope 'regional')
  areas: { id: string; name: string }[];     // assigned (kalau scope 'area')
}

export async function listUsers(): Promise<UserListItem[]> {
  const res = await pool.query(`
    SELECT
      u.id, u.username, u.email, u.role, u.scope_type, u.is_active, u.created_at,
      COALESCE(
        (SELECT json_agg(json_build_object('id', r.id, 'name', r.name))
         FROM user_regionals ur JOIN regionals r ON r.id = ur.regional_id
         WHERE ur.user_id = u.id), '[]'
      ) AS regionals,
      COALESCE(
        (SELECT json_agg(json_build_object('id', a.id, 'name', a.name))
         FROM user_areas ua JOIN areas a ON a.id = ua.area_id
         WHERE ua.user_id = u.id), '[]'
      ) AS areas
    FROM users u
    ORDER BY u.created_at DESC
  `);
  return res.rows;
}

export async function getUserByUsername(username: string) {
  const res = await pool.query(`SELECT * FROM users WHERE username = $1 AND is_active = true`, [username]);
  return res.rows[0] ?? null;
}

/** Resolve scope user jadi allowed_areas & allowed_regionals — dipanggil saat login & saat /api/auth/me. */
export async function resolveUserScope(userId: number, scopeType: ScopeType): Promise<{ allowed_areas: string[]; allowed_regionals: string[] }> {
  if (scopeType === 'all') return { allowed_areas: [], allowed_regionals: [] };

  if (scopeType === 'regional') {
    const regionals = await pool.query(`SELECT regional_id FROM user_regionals WHERE user_id = $1`, [userId]);
    const regionalIds = regionals.rows.map(r => r.regional_id);
    if (regionalIds.length === 0) return { allowed_areas: [], allowed_regionals: [] };
    const areas = await pool.query(`SELECT id FROM areas WHERE regional_id = ANY($1)`, [regionalIds]);
    return { allowed_areas: areas.rows.map(a => a.id), allowed_regionals: regionalIds };
  }

  // scopeType === 'area'
  const areas = await pool.query(`SELECT area_id FROM user_areas WHERE user_id = $1`, [userId]);
  return { allowed_areas: areas.rows.map(a => a.area_id), allowed_regionals: [] };
}

export async function createUser(data: {
  username: string; email?: string; password: string;
  role: UserRole; scope_type: ScopeType;
  regionalIds?: string[]; areaIds?: string[];
}): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const hash = await hashPassword(data.password);
    const res = await client.query(
      `INSERT INTO users (username, email, password_hash, role, scope_type)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [data.username, data.email ?? null, hash, data.role, data.scope_type]
    );
    const userId = res.rows[0].id;

    if (data.scope_type === 'regional' && data.regionalIds?.length) {
      for (const rid of data.regionalIds) {
        await client.query(`INSERT INTO user_regionals (user_id, regional_id) VALUES ($1,$2)`, [userId, rid]);
      }
    }
    if (data.scope_type === 'area' && data.areaIds?.length) {
      for (const aid of data.areaIds) {
        await client.query(`INSERT INTO user_areas (user_id, area_id) VALUES ($1,$2)`, [userId, aid]);
      }
    }

    await client.query("COMMIT");
    return userId;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function updateUser(id: number, data: {
  email?: string; role?: UserRole; scope_type?: ScopeType; is_active?: boolean;
  password?: string; regionalIds?: string[]; areaIds?: string[];
}): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (data.email !== undefined) { sets.push(`email = $${i++}`); values.push(data.email); }
    if (data.role !== undefined) { sets.push(`role = $${i++}`); values.push(data.role); }
    if (data.scope_type !== undefined) { sets.push(`scope_type = $${i++}`); values.push(data.scope_type); }
    if (data.is_active !== undefined) { sets.push(`is_active = $${i++}`); values.push(data.is_active); }
    if (data.password) { sets.push(`password_hash = $${i++}`); values.push(await hashPassword(data.password)); }

    if (sets.length) {
      values.push(id);
      await client.query(`UPDATE users SET ${sets.join(", ")}, updated_at = NOW() WHERE id = $${i}`, values);
    }

    if (data.regionalIds !== undefined) {
      await client.query(`DELETE FROM user_regionals WHERE user_id = $1`, [id]);
      for (const rid of data.regionalIds) {
        await client.query(`INSERT INTO user_regionals (user_id, regional_id) VALUES ($1,$2)`, [id, rid]);
      }
    }
    if (data.areaIds !== undefined) {
      await client.query(`DELETE FROM user_areas WHERE user_id = $1`, [id]);
      for (const aid of data.areaIds) {
        await client.query(`INSERT INTO user_areas (user_id, area_id) VALUES ($1,$2)`, [id, aid]);
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteUser(id: number): Promise<void> {
  await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
}