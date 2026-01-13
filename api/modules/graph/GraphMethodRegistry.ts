import { ModuleRegistry } from '../../core/ModuleRegistry'
import { GraphMethod } from '../../../../shared/contracts/services/graphMethod'
import { KeywordCoOccurrence } from './methods/KeywordCoOccurrence'

// Create registry instance
export const graphMethodRegistry = new ModuleRegistry<GraphMethod>()

// Register default methods
graphMethodRegistry.register('keyword-cooccur', new KeywordCoOccurrence())

// Export singleton
export default graphMethodRegistry
