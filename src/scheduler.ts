import { OnProgressHandler } from './types'

export async function scheduleTask({ timeInMs, task }, { onProgress, id }: { onProgress: OnProgressHandler, id: string }) {
  return new Promise((res, rej) => {
    setTimeout(async () => {
      try {
        onProgress(`Task with id "${id}" started`)
        const taskResult = await task(Date.now())
        onProgress(`Task with id "${id}" finished`)
        res(taskResult)
      } catch (e) {
        rej(e)
      }
    }, timeInMs)
  })
}

export function repeatTask({ timeInMs, task }, { onProgress }: { onProgress: OnProgressHandler }) {
  let isStopped = false
  const id = Math.random().toString(36).slice(2)
  const schedule = () => (
    scheduleTask({ timeInMs, task }, { onProgress, id })
      .then(() => (
        isStopped ? onProgress(`Task with id "${id}" stopped`) : schedule()
      ))
  )
  onProgress(`Task with id "${id}" scheduled`)
  return {
    stop: () => isStopped = true,
    task: schedule().catch(error => {
      onProgress(`Task with id "${id}" threw an error`)
      throw error
    })
  }
}
