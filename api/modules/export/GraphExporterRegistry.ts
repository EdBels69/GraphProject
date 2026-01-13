import { ModuleRegistry } from '../../core/ModuleRegistry'
import { GraphExporter } from '../../../../shared/contracts/services/exporter'
import { ObsidianExporter } from './exporters/ObsidianExporter'
import { CytoscapeExporter } from './exporters/CytoscapeExporter'

export const graphExporterRegistry = new ModuleRegistry<GraphExporter>()

graphExporterRegistry.register('obsidian', new ObsidianExporter())
graphExporterRegistry.register('cytoscape', new CytoscapeExporter())

export default graphExporterRegistry
