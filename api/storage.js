import fs from 'fs'
import os from 'os'
import path from 'path'

export function getDataFilePath(fileName) {
  const localPath = path.join(process.cwd(), 'data', fileName)

  if (process.env.VERCEL) {
    const tempPath = path.join(os.tmpdir(), fileName)

    if (!fs.existsSync(tempPath) && fs.existsSync(localPath)) {
      fs.copyFileSync(localPath, tempPath)
    }

    return tempPath
  }

  return localPath
}

export function ensureDataFileDir(filePath) {
  const dataDir = path.dirname(filePath)

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}
