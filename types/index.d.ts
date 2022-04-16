export = editorconfigHook
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
declare function editorconfigHook(context: FlowContext, semaphore: Semaphore): Promise<FlowContext>
declare namespace editorconfigHook {
  export { FlowContext, Semaphore }
}
type FlowContext = import('sharec-core').FlowContext
type Semaphore = import('sharec-core').Semaphore
