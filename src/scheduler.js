const { date } = require('./helpers')

const createMessage = content => `[scheduler] ${date()} ${content}`

async function scheduleTask({ timeInMs, task }, { onProgress, id } = { onProgress: () => {} }) {
  return new Promise((res, rej) => {
    setTimeout(async () => {
      try {
        onProgress(createMessage(`Task with id "${id}" started`))
        await task(Date.now())
        onProgress(createMessage(`Task with id "${id}" finished`))
        res()
      } catch (e) {
        rej(e)
      }
    }, timeInMs)
  })
}

function repeatTask({ timeInMs, task }, { onProgress } = { onProgress: () => {} }) {
  let isStopped = false
  const id = Math.random().toString(36).slice(2)
  const schedule = () => (
    scheduleTask({ timeInMs, task }, { onProgress, id })
      .then(() => (
        isStopped ? onProgress(createMessage(`Task with id "${id}" stopped`)) : schedule()
      ))
  )
  onProgress(createMessage(`Task with id "${id}" scheduled`))
  return {
    stop: () => isStopped = true,
    task: schedule().catch(error => {
      onProgress(createMessage(`Task with id "${id}" threw an error`))
      throw error
    })
  }
}

module.exports = {
  scheduleTask,
  repeatTask
}
