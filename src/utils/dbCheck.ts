import { pool } from "../config/db"; // make sure path is correct

const checkTableExists = async (tableName: string) => {
  const query = `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = $1
    );
  `;
  
  const res = await pool.query(query, [tableName]);
  return res.rows[0].exists; // true or false
};

const checkAllTables = async () => {
  const tables = ["users", "hobbies", "user_hobbies", "friendships"];
  for (const table of tables) {
    const exists = await checkTableExists(table);
    console.log(`${table} exists?`, exists);
  }
  await pool.end(); // close connection
};

checkAllTables();
