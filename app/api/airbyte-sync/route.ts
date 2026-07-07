export const runtime = "nodejs";

export async function POST() {
  const airbyteToken = process.env.AIRBYTE_API_TOKEN;
  const connectionId = process.env.AIRBYTE_CONNECTION_ID;
  const baseUrl = process.env.AIRBYTE_API_BASE_URL || "https://api.airbyte.com/v1";

  if (!airbyteToken || !connectionId) {
    return Response.json(
      { error: "AIRBYTE_API_TOKEN or AIRBYTE_CONNECTION_ID is missing" },
      { status: 500 },
    );
  }

  const response = await fetch(`${baseUrl}/jobs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${airbyteToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jobType: "sync",
      connectionId,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as unknown;

  if (!response.ok) {
    return Response.json({ error: data }, { status: response.status });
  }

  return Response.json({
    message: "Airbyte sync started",
    airbyteResponse: data,
  });
}
