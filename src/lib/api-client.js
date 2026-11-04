export async function readApiResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const detail = response.status === 404
      ? 'API route was not found. Confirm the app is running on the Next.js port.'
      : `Expected JSON from the API but received ${contentType || 'an unknown response'} (HTTP ${response.status}).`;
    throw new Error(detail);
  }

  try {
    return await response.json();
  } catch {
    throw new Error(`The API returned malformed JSON (HTTP ${response.status}).`);
  }
}
