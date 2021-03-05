import GameEntity from '../gameRules/gameEntity';
import Point from '../gameClasses/Point';
import InputHandler from './inputHandler';

class MovementHandler {
    gameEntity: GameEntity;
    canvas: HTMLCanvasElement;
    InputHandler: InputHandler;

    constructor(gameEntity: GameEntity, canvas: HTMLCanvasElement) {
        this.gameEntity = gameEntity;
        this.canvas = canvas;
        this.InputHandler = new InputHandler();
    }
    frameEngine(dt: number) {
        this.handleMovementKeyPressing(dt);
        this.handleShotPress();
        this.handleShellsMovement(dt);
        this.handleParticleChanging(dt);
    }

    handleMovementKeyPressing(dt: number) {
        const playerSpeed = 20;
        const shift = Math.round(playerSpeed * dt * 10);
        const movement: { [index: string]: Point } = {
            ArrowDown: new Point(0, shift),
            ArrowUp: new Point(0, -shift),
            ArrowLeft: new Point(-shift, 0),
            ArrowRight: new Point(shift, 0),
        };
        for (const move in movement) {
            if (this.handleMovements(move, movement[move])) break;
        }
    }

    handleShotPress() {
        if (this.InputHandler.isDown(' ')) {
            this.gameEntity.handleShoot(this.gameEntity.player.direction);
        }
    }

    handleShellsMovement(dt: number) {
        const shellSpeed = 30;
        const shellShift = Math.round(shellSpeed * dt * 10);
        const directions: { [index: number]: Point } = {
            '180': new Point(0, shellShift),
            '0': new Point(0, -shellShift),
            '-90': new Point(-shellShift, 0),
            '90': new Point(shellShift, 0),
        };
        for (const shell of this.gameEntity.shell) {
            this.gameEntity.handleShellMovements(shell, directions[shell.direction]);
        }
    }

    handleParticleChanging(dt: number) {
        for (const particle of this.gameEntity.particles) {
            this.gameEntity.handleParticle(particle, dt);
        }
    }

    handleMovements(button: any, step: Point) {
        if (this.InputHandler.isDown(button)) {
            this.gameEntity.handleMovements(button, step);
            return true;
        }
        return false;
    }
}

export default MovementHandler;
