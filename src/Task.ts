import SchemeContext from './contexts/SchemeContext'
import { createTimeout, defaultValue, randomId } from './helpers'
import { getSchemeModule } from './schemes'
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
  protected interval: number
  protected timeout: number

  constructor(private scheme: Scheme, options: TaskConstructorOptions) {
    this.id = randomId()
    this.interval = defaultValue(options.config.config.interval, Task.DEFAULT_INTERVAL)
    this.timeout = defaultValue(options.config.config.timeout, Task.DEFAULT_TIMEOUT)
    this.context = new SchemeContext({
      scheme,
      config: options.config
    })
    if (options.start) this.start()
  }

  start() {
    const repeat = async () => {
      const result = await this.scheduleAndWait()
      this.context.postExecute(result)
      if (this.isStopped) {
        this.isRunning = false
      } else {
        return repeat()
      }
      return result
    }
    this.isRunning = true
    return repeat()
  }

  stop() {
    this.isStopped = true
  }

  private scheduleAndWait() {
    return new Promise((res, rej) => {
      setTimeout(async() => {
        try {
          console.log('[task] executing task')
          const result = await this.executeTask()
          console.log('[task] task executed')
          res(result)
        } catch (error) {
          rej(error)
        }
      }, this.interval)
      console.log('[task] task scheduled')
    })
  }

  private executeTask() {
    const promises = [
      this.scheme.callback(this.context)
    ]
    if (this.timeout > 0) {
      promises.push(createTimeout(this.timeout))
    }
    return Promise.race(promises)
  }
}
