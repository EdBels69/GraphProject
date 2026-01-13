export class ModuleRegistry<T> {
    private modules = new Map<string, T>()

    /**
     * Register a new module
     */
    register(id: string, module: T): void {
        if (this.modules.has(id)) {
            throw new Error(`Module ${id} already registered`)
        }
        this.modules.set(id, module)
    }

    /**
     * Get a module by ID
     */
    get(id: string): T | undefined {
        return this.modules.get(id)
    }

    /**
     * List all registered modules
     */
    list(): T[] {
        return Array.from(this.modules.values())
    }

    /**
     * Check if module exists
     */
    has(id: string): boolean {
        return this.modules.has(id)
    }

    /**
     * Unregister a module
     */
    unregister(id: string): boolean {
        return this.modules.delete(id)
    }
}
