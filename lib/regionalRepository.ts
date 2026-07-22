import { pool } from "@/lib/db";

export interface RegionalRow { id: string; name: string; description: string | null }
export interface AreaRow { id: string; name: string; description: string | null; regional_id: string | null; regional_name?: string | null }

export async function listRegionals(): Promise<RegionalRow[]> {
  const res = await pool.query(`SELECT id, name, description FROM regionals ORDER BY name`);
  return res.rows;
}

export async function createRegional(data: { id: string; name: string; description?: string }) {
  await pool.query(
    `INSERT INTO regionals (id, name, description) VALUES ($1,$2,$3)`,
    [data.id, data.name, data.description ?? null]
  );
}

export async function updateRegional(id: string, data: { name?: string; description?: string }) {
  const sets: string[] = []; const values: unknown[] = []; let i = 1;
  if (data.name !== undefined) { sets.push(`name = $${i++}`); values.push(data.name); }
  if (data.description !== undefined) { sets.push(`description = $${i++}`); values.push(data.description); }
  if (!sets.length) return;
  values.push(id);
  await pool.query(`UPDATE regionals SET ${sets.join(", ")}, updated_at = NOW() WHERE id = $${i}`, values);
}

export async function deleteRegional(id: string) {
  await pool.query(`DELETE FROM regionals WHERE id = $1`, [id]);
}

export async function listAreas(): Promise<AreaRow[]> {
  const res = await pool.query(`
    SELECT a.id, a.name, a.description, a.regional_id, r.name AS regional_name
    FROM areas a
    LEFT JOIN regionals r ON r.id = a.regional_id
    ORDER BY a.name
  `);
  return res.rows;
}

export async function createArea(data: { id: string; name: string; description?: string; regional_id?: string | null }) {
  await pool.query(
    `INSERT INTO areas (id, name, description, regional_id) VALUES ($1,$2,$3,$4)`,
    [data.id, data.name, data.description ?? null, data.regional_id ?? null]
  );
}

export async function updateArea(id: string, data: { name?: string; description?: string; regional_id?: string | null }) {
  const sets: string[] = []; const values: unknown[] = []; let i = 1;
  if (data.name !== undefined) { sets.push(`name = $${i++}`); values.push(data.name); }
  if (data.description !== undefined) { sets.push(`description = $${i++}`); values.push(data.description); }
  if (data.regional_id !== undefined) { sets.push(`regional_id = $${i++}`); values.push(data.regional_id); }
  if (!sets.length) return;
  values.push(id);
  await pool.query(`UPDATE areas SET ${sets.join(", ")}, updated_at = NOW() WHERE id = $${i}`, values);
}

export async function deleteArea(id: string) {
  await pool.query(`DELETE FROM areas WHERE id = $1`, [id]);
}