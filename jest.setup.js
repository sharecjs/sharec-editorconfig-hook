jest.mock('fs', () => {
  const fs = jest.requireActual('fs')
  const { readFile } = require('memfs')

  return {
    ...fs,
    readFile,
  }
})
