const dotenv = require('dotenv')
const { resolve } = require('path')

const assetMap = new Map()

export function filterAssetsByThresholds(results, mailingList) {
  return mailingList.map(entry => {
    const { threshold } = entry
    const filtered = results.filter(({ asset, liquidity: { value } }) => (
      value >= threshold && (assetMap.get(asset) || 0) < threshold
    ))
    results.forEach(({ asset, liquidity: { value }}) => assetMap.set(asset, value))
    return {
      assets: filtered,
      mailEntry: entry
    }
  }).filter(({ assets }) => assets.length > 0)
}

export function loadEnv() {
  return dotenv.config({
    path: resolve(__dirname, '..', '.env')
  }).parsed
}

export function createTimeout(ms) {
  return new Promise((res, rej) => setTimeout(() => rej(`Timeout of ${ms}ms exceeded.`), ms))
}

export const date = () => new Date().toISOString()

export async function loadConfiguration() {
}
