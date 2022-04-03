export default abstract class AlertServiceClass {
  abstract sendAlert(payload: unknown): Promise<unknown> | unknown;

  abstract sendError(error: unknown): Promise<unknown> | unknown;

  protected abstract config: unknown;
}
