import GameObject from '../../gameClasses/gameObject'
import { configuration } from './GameObjectsConfiguration'

export class GameMap {
    gameMap = new Map<string, (any)[]>()

    constructor() {
        for (const sectionsName of Object.entries(configuration).sort((a, b) => (a[1].layer > b[1].layer) ? 1 : ((b[1].layer > a[1].layer) ? -1 : 0))) {
            if (!this.gameMap.has(sectionsName[0])) {
                this.gameMap.set(sectionsName[0], [])
            }
        }
    }

    getCollectionByClassName(item: string) {
        return this.gameMap.get(item) ?? []
    }

    deleteEntity(entity: any) {
        const parentCollection = this.getParentCollection(entity)
        parentCollection.splice(parentCollection.indexOf(entity), 1)
    }

    getObjectsByOrder() {
        return this.gameMap.values()
    }

    addEntity(className: string, classItem: any, position?: number) {
        if (!this.gameMap.has(className)) {
            this.gameMap.set(className, [])
        }
        const classCollection = this.gameMap.get(className)
        if (!classCollection) {
            return
        }
        if (position !== undefined) {
            classCollection[position] = classItem
        } else {
            classCollection.push(classItem)
        }
    }

    private getParentCollection(gameObject: GameObject) {
        let neededCollection
        for (const [key, value] of Object.entries(configuration)) {
            if (value.classes.includes(gameObject.constructor.name)) {
                neededCollection = key
            }
        }
        return (neededCollection && this.getCollectionByClassName(neededCollection)) || []
    }
}