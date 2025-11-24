export default async function returnErrorMessage(
  response: Response,
): Promise<string | undefined> {
  const err: unknown = await response.json();

  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message: string | string[] | undefined = (
      err as { message?: string | string[] }
    ).message;

    let finalMessage: string;
    if (typeof message === 'string') {
      finalMessage = message;
    } else if (Array.isArray(message)) {
      finalMessage = message.join(',\n');
    } else {
      finalMessage = 'Authentication error';
    }
    return finalMessage;
  }
  return;
}
