const { vol } = require('memfs')
const { EOL } = require('os')
const hook = require('../')

const fixtures = {
  raw: {
    'foo.txt': `foo${EOL}  bar${EOL}    baz${EOL}`,
  },
  editorconfig: {
    tab: `root = true

[*]
indent_style = tab
indent_size = 4
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true`,
    space: `root = true

[*]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true`,
  },
}

describe('editorconfigHook', () => {
  let semaphore

  beforeEach(() => {
    jest.clearAllMocks()
    vol.reset()
    semaphore = {
      start: jest.fn(),
      error: jest.fn(),
      success: jest.fn(),
    }
  })

  describe('without configs', () => {
    it('returns configs as is', async () => {
      const context = {
        targetPath: '/',
        mergedConfigs: {},
      }
      const result = await hook(context, semaphore)

      expect(result.mergedConfigs).toEqual({})
    })
  })

  describe('without .editorconfig', () => {
    it('returns configs as is', async () => {
      const context = {
        targetPath: '/',
        mergedConfigs: { ...fixtures.raw },
      }
      const result = await hook(context, semaphore)

      expect(result.mergedConfigs['foo.txt']).toMatchSnapshot()
    })
  })

  describe('with .editorconfig in target dir', () => {
    describe('with spaces', () => {
      beforeEach(() => {
        const dir = {
          '.editorconfig': fixtures.editorconfig.space,
        }

        vol.fromJSON(dir, '/')
      })

      it('adds 4 spaces', async () => {
        const context = {
          targetPath: '/',
          mergedConfigs: { ...fixtures.raw },
        }
        const result = await hook(context, semaphore)

        expect(result.mergedConfigs['foo.txt']).toMatchSnapshot()
      })
    })

    describe('with tabs', () => {
      beforeEach(() => {
        const dir = {
          '.editorconfig': fixtures.editorconfig.tab,
        }

        vol.fromJSON(dir, '/')
      })

      it('adds tabs', async () => {
        const context = {
          targetPath: '/',
          mergedConfigs: { ...fixtures.raw },
        }
        const result = await hook(context, semaphore)

        expect(result.mergedConfigs['foo.txt']).toMatchSnapshot()
      })
    })
  })

  describe('with .editorconfig in configs', () => {
    describe('with spaces', () => {
      it('adds 4 spaces', async () => {
        const context = {
          targetPath: '/',
          mergedConfigs: { ...fixtures.raw, '.editorconfig': fixtures.editorconfig.space },
        }
        const result = await hook(context, semaphore)

        expect(result.mergedConfigs['foo.txt']).toMatchSnapshot()
      })
    })

    describe('with tabs', () => {
      it('adds tabs', async () => {
        const context = {
          targetPath: '/',
          mergedConfigs: { ...fixtures.raw, '.editorconfig': fixtures.editorconfig.tab },
        }
        const result = await hook(context, semaphore)

        expect(result.mergedConfigs['foo.txt']).toMatchSnapshot()
      })
    })
  })
})
