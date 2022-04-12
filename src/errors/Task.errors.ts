import { BotRuntimeError } from './index.errors'

export class TaskError extends BotRuntimeError {
  constructor(public id: string, message: string) {
    super(message)
  }
}

export class TaskStoppedError extends TaskError {
  constructor(id: string) {
    super(id, `Task "${id}" tried to run the scheme, despite being stopped.`)
  }
}
