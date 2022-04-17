// @ts-check
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { parseString } = require('editorconfig')
const micromatch = require('micromatch')
const { applyFormat } = require('sharec-utils').format

const readFile = promisify(fs.readFile)

/**
 * @typedef {import('sharec-core').FlowContext} FlowContext
 * @typedef {import('sharec-core').Semaphore} Semaphore
 */

/**
 * Formats configuration inside the current flow context by `.editorconfig` rules
 * Usage example:
 * ```js
 * const editorconfigHook = require('sharec-editorconfig-hook')
 *
 * module.exports = {
 *   afterMerge: editorconfigHook,
 * }
 * ```
 * @param {FlowContext} context
 * @param {Semaphore} semaphore
 * @returns {Promise<FlowContext>}
 */
const editorconfigHook = async (context, semaphore) => {
  semaphore.start('editorconfig: formatting')

  const { targetPath, mergedConfigs } = context

  if (Object.keys(mergedConfigs).length === 0) {
    semaphore.warn('editorconfig: nothing to format')

    return context
  }

  const upcomingEditorConfigKey = Object.keys(mergedConfigs).find(key => /editorconfig/.test(key))
  let editorconfig = upcomingEditorConfigKey ? mergedConfigs[upcomingEditorConfigKey] : null
  let parsedRules

  if (!editorconfig) {
    try {
      const editorconfigPath = path.join(targetPath, '.editorconfig')

      editorconfig = await readFile(editorconfigPath, 'utf8')
    } catch (err) {
      semaphore.warn("editorconfig: can't find .editorconfig config")

      return context
    }
  }

  try {
    [, ...parsedRules] = [].concat(parseString(editorconfig))
  } catch (err) {
    semaphore.error("editorconfig: can't parse .editorconfig config")

    return context
  }

  for (const [match, rules] of parsedRules) {
    for (const config in mergedConfigs) {
      const configBasename = path.basename(config)

      if (!micromatch.isMatch(configBasename, match)) continue

      const {
        indent_style = 'space',
        indent_size = '2',
        // end_of_line = 'lf'
      } = rules

      mergedConfigs[config] = applyFormat({
        filename: configBasename,
        content: mergedConfigs[config],
        rules: {
          indentType: indent_style,
          indentSize: parseInt(indent_size),
          eof: true,
        },
      })
    }
  }

  semaphore.success('editorconfig: configs have been formatted')

  return context
}

module.exports = editorconfigHook
