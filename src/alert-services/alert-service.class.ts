export default abstract class AlertServiceClass {
  abstract sendAlert(payload): Promise<unknown> | unknown;
  abstract sendError(error): Promise<unknown> | unknown;
  protected abstract config: unknown;
}
