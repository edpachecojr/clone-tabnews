import database from "infra/database.js";

export default async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const postgresVersion = await database.query("SHOW server_version;");
  const maxConnections = await database.query("SHOW MAX_CONNECTIONS;");
  const databaseName = process.env.POSTGRES_DB;

  const activeConnections = await database.query({
    text: "SELECT COUNT(1)::int as activeConnections FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: postgresVersion.rows[0].server_version,
        max_connections: parseInt(maxConnections.rows[0].max_connections),
        opened_connections: activeConnections.rows[0].activeconnections,
      },
    },
  });
}
