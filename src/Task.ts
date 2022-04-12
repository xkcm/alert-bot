import SchemeContext from './contexts/SchemeContext'
import { TaskStoppedError } from './errors/Task.errors'
import { createErrorIgnoringHandler, createTimeout, defaultValue, delay, randomId } from './helpers'
import { getSchemeModule } from './loaders/schemesLoader'
import { TaskConstructorOptions } from './types'
import { BotConfiguration } from './types/config'
import { Scheme } from './types/scheme'
import { ArrayElement } from './types/utils'

export default class Task {
  public static DEFAULT_INTERVAL = 60_000 // 1 minute
  public static DEFAULT_TIMEOUT = 300_000 // 5 minutes

  public static fromConfig(config: ArrayElement<BotConfiguration.Root['tasks']>, options: Omit<TaskConstructorOptions, 'config'> = {}) {
    const schemeModule = getSchemeModule(config.scheme.id)
    const scheme = schemeModule.create(config.scheme.config)
    return new Task(scheme, {
      config,
      ...options
    })
  }

  public static createTasksFromConfig(config: BotConfiguration.Root['tasks'], options: Omit<TaskConstructorOptions, 'config'> = {}) {
    return config.map(entry => Task.fromConfig(entry, options))
  }

  public id: string
  protected context: SchemeContext
  protected isStopped = false
  protected isRunning = false
  protected timeout: number
  protected tmp: Record<string, any> = {}

  constructor(private scheme: Scheme, options: TaskConstructorOptions) {
    this.id = randomId()
    this.timeout = defaultValue(options.config.config.timeout, Task.DEFAULT_TIMEOUT)
    this.context = new SchemeContext({
      scheme,
      config: options.config
    })
    if (options.start) this.start()
  }

  async start() {
    const { runOnce, runImmediately } = this.scheme.settings.schedule
    if (runImmediately) {
      const result = await this.runScheme()
      if (runOnce) {
        await this.clear()
        return result
      }
    }
    if (this.getInterval()) {
      if (runOnce) {
        await this.waitAndExecute()
      }
      else {
        return this.repeat()
      }
    }
    return this.clear()
  }

  stop() {
    this.isStopped = true
  }

  protected async clear() {
    await this.context.terminate()
    this.safelyClearTimeouts()
    this.context = null
  }

  protected async executeRepeated() {
    const result = await this.waitAndExecute()
    this.safelyClearTimeouts()
    this.context.postExecute(result)
    if (this.isStopped) {
      this.isRunning = false
      this.clear()
      return result
    } 
    return this.executeRepeated()
  }

  protected repeat() {
    this.isRunning = true
    return this.executeRepeated()
  }

  protected async handleError(error: Error) {
    await this.context.adminAlert.send(error)
  }

  protected async waitAndExecute() {
    const delayPromise = delay(this.getInterval())
    this.tmp.delayTimeoutId = delayPromise.timeoutId
    await delayPromise
    return this.runScheme().catch(createErrorIgnoringHandler(TaskStoppedError))
  }

  protected runScheme() {
    if (this.isStopped) {
      return Promise.reject(new TaskStoppedError(this.id))
    }
    const promises = [
      this.scheme.callback(this.context)
    ]
    if (this.timeout > 0) {
      const timeout = createTimeout(this.timeout)
      this.tmp.timeoutId = timeout.timeoutId
      promises.push(timeout)
    }
    return Promise.race(promises).catch(error => {
      if (this.scheme.settings.endOnError) {
        this.stop()
        this.clear()
      }
      return this.handleError(error)
    })
  }

  protected getInterval() {
    const { repeatEvery, calculateInterval } = this.scheme.settings.schedule
    return repeatEvery || calculateInterval?.()
  }

  protected safelyClearTimeouts() {
    try { clearTimeout(this.tmp.timeoutId) }
    catch {}
    
    try { clearTimeout(this.tmp.delayTimeoutId) }
    catch {}
  }
}
