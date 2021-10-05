import { IGameStore } from '../../../stores/store'
import Figure from '../../gameClasses/figure'
import GameObject from '../../gameClasses/gameObject'
import Point from '../../gameClasses/Point'
import { Base, BrickWall, Bridge, Foliage, House, SteelWall, Tank, TankShell, Tree, Water } from '../../gameObjects'
import { entityDirections } from './constObjects/DirectionHandler'
import mapCollection from './constObjects/mapCollection'
import { GameMap } from './GameMap'
import { KnownSections } from './GameObjectsConfiguration'

class MapHandler {
    gameMap = new GameMap()
    mapSize: { width: number, height: number }
    store: IGameStore
    constructor(mapWidth: number, mapHeight: number, choosenMap: string, store: IGameStore) {
        this.mapSize = { width: mapWidth, height: mapHeight }
        this.store = store
        if (this.store.isSinglePlayer) {
            if (choosenMap === 'first') {
                this.generateMap(mapCollection.map1SinglePlayer)
            } else {
                this.generateMap(mapCollection.map2SinglePlayer)
            }
        } else {
            if (choosenMap === 'first') {
                this.generateMap(mapCollection.map1Multiplayer)
            } else {
                this.generateMap(mapCollection.map2Multiplayer)
            }
        }
    }

    generateMap(map: string[][]) {
        const tileSize = 50
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                const symbol = map[y][x]
                if (symbol === '.') {
                    continue
                }
                if (symbol.startsWith('bs')) {
                    // @ts-ignore
                    const baseSide: 0 | 1 = parseInt(symbol.split('bs')[1]) - 1
                    // constructor name
                    const className = KnownSections.Base
                    const obj = new Base(x * tileSize, y * tileSize, baseSide)
                    this.gameMap.addEntity(className, obj, baseSide)
                    continue
                }
                if (symbol === 'b') {
                    const className = KnownSections.obstacle
                    const obj = new BrickWall(x * tileSize, y * tileSize)
                    this.gameMap.addEntity(className, obj)
                    continue
                }
                if (symbol === 's') {
                    const className = KnownSections.obstacle
                    const obj = new SteelWall(x * tileSize, y * tileSize)
                    this.gameMap.addEntity(className, obj)
                    continue
                }
                if (symbol === 'h') {
                    const className = KnownSections.obstacle
                    // @ts-ignore
                    const obj = new House(x * tileSize, y * tileSize, this.store.choosenMap)
                    this.gameMap.addEntity(className, obj)
                    continue
                }
                if (symbol === 'w') {
                    const className = KnownSections.water
                    const obj = new Water(x * tileSize, y * tileSize, entityDirections.Left)
                    this.gameMap.addEntity(className, obj)
                    continue
                }
                if (symbol.startsWith('B')) {
                    // @ts-ignore
                    const side: 'l' | 'u' = symbol[1]
                    const className = KnownSections.bridges
                    const obj = new Bridge(x * tileSize, y * tileSize, side)
                    this.gameMap.addEntity(className, obj)
                    continue
                }
                if (symbol.startsWith('T')) {
                    // @ts-ignore
                    const color: 'a' | 'o' = symbol[1]
                    const className = KnownSections.obstacle
                    const obj = new Tree(x * tileSize, y * tileSize, color)
                    this.gameMap.addEntity(className, obj)
                    continue
                }
                if (symbol.startsWith('f')) {
                    // @ts-ignore
                    const color: 'g' | 'y' = symbol[1]
                    const className = KnownSections.foliage
                    const obj = new Foliage(x * tileSize, y * tileSize, color)
                    this.gameMap.addEntity(className, obj)
                    continue
                }
                if (symbol.startsWith('t')) {
                    const tankNumber: number = parseInt(symbol.split('t')[1])
                    console.log(`tank number: ${tankNumber - 1}`)
                    const className = KnownSections.tanks
                    const obj = new Tank(
                        x * tileSize,
                        y * tileSize,
                        tankNumber === 1 ? 0 : 1
                    )
                    this.gameMap.addEntity(className, obj, tankNumber - 1)
                    continue
                }
            }
        }
    }

    getMinimalStep(step: Point, gameObject: GameObject): [Point, GameObject | undefined] {
        const minimalStep = Object.assign({}, step)
        const collisionBlock = this.findCollisionBlock(minimalStep, gameObject)
        while (
            // eslint-disable-next-line no-unmodified-loop-condition
            (collisionBlock && this.hasObstacleCollision(gameObject, minimalStep, collisionBlock))
            || this.hasBoundsCollision(gameObject, minimalStep, this.mapSize)
        ) {
            if (minimalStep.x === 0 && minimalStep.y === 0) {
                break
            }
            if (minimalStep.x !== 0) {
                minimalStep.x -= Math.sign(minimalStep.x)
            } else {
                minimalStep.y -= Math.sign(minimalStep.y)
            }
        }
        return [minimalStep, collisionBlock]
    }

    findCollisionBlock(minimalStep: Point, gameObject: GameObject) {
        const isShell = gameObject.constructor === TankShell
        return (
            this.gameMap.getCollectionByClassName(KnownSections.obstacle).find((obstacle) => this.hasObstacleCollision(gameObject, minimalStep, obstacle))
            || this.gameMap.getCollectionByClassName(KnownSections.Base).find((base) => this.hasObstacleCollision(gameObject, minimalStep, base))
            || this.gameMap.getCollectionByClassName(KnownSections.tanks).find(
                (tank) => tank !== gameObject && this.hasObstacleCollision(gameObject, minimalStep, tank)
            )
            || (isShell
                ? undefined
                : this.gameMap.getCollectionByClassName(KnownSections.water).find((water) => this.hasObstacleCollision(gameObject, minimalStep, water)))
        )
    }

    hasBoundsCollision(player: GameObject, step: Point, mapSize: { width: number, height: number }) {
        return (
            player.x + step.x < 0
            || player.x + step.x > mapSize.width - player.size
            || player.y + step.y < 0
            || player.y + step.y > mapSize.height - player.size
        )
    }

    hasObstacleCollision(player: GameObject, step: Point, obstacle: GameObject): boolean {
        return this.hasIntersects(player, step, obstacle)
    }

    hasIntersects(firstRect: GameObject, step: Point, secondRect: GameObject): boolean {
        const shiftedRectangle = new Figure(firstRect.x + step.x, firstRect.y + step.y, firstRect.size, firstRect.size)
        return !(
            shiftedRectangle.y > secondRect.getY1()
            || shiftedRectangle.getY1() < secondRect.y
            || shiftedRectangle.getX1() < secondRect.x
            || shiftedRectangle.x > secondRect.getX1()
        )
    }
}

export default MapHandler