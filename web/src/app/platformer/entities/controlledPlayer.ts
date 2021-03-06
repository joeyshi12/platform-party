import { Character, PlayerMetadata, PlayerState, Vector } from "../../../../../src/types/entityMetadata";
import { Stage } from "../scenes/stage";
import { AnimationControl } from "./animationControl";
import { SoundPlayerService } from "../services/soundPlayerService";
import { RendererService } from "../services/rendererService";

export class ControlledPlayer {
  public static ACCELERATION: number = 2.2;
  public static GRAVITY: number = 0.6;
  public static MAX_SPEED: number = 5.6;
  public static JUMP_VELOCITY: number = 12;
  public static FRICTION: number = 0.7;
  private _velocity: Vector = {x: 0, y: 0};
  private _acceleration: Vector = {x: 0, y: 0};
  private _animationControl: AnimationControl;

  constructor(private _metadata: PlayerMetadata) {
    this._animationControl = new AnimationControl(this._buildAnimationStates(_metadata.character));
  }

  public get metadata(): PlayerMetadata {
    return this._metadata;
  }

  public keyPressed(key: string, soundPlayerService: SoundPlayerService): void {
    switch (key.toLocaleUpperCase()) {
      case "W":
        if (this._isGrounded) {
          soundPlayerService.playJump();
          this._metadata.position.y--;
          this._velocity.y = -ControlledPlayer.JUMP_VELOCITY;
          this._animationControl.state = PlayerState.falling;
        }
        break;
      case "A":
        this._acceleration.x = -ControlledPlayer.ACCELERATION;
        break;
      case "D":
        this._acceleration.x = ControlledPlayer.ACCELERATION;
        break;
      default:
    }
  }

  public keyReleased(key: string): void {
    switch (key.toLocaleUpperCase()) {
      case "A":
        if (this._acceleration.x < 0) {
          this._acceleration.x = 0;
        }
        break;
      case "D":
        if (this._acceleration.x > 0) {
          this._acceleration.x = 0;
        }
        break;
      default:
    }
  }

  public update(stage: Stage, soundPlayerService: SoundPlayerService): void {
    if (this._animationControl.state === PlayerState.dead) {
      return;
    }
    if (this._isDamaged(stage)) {
      this._animationControl.state = PlayerState.dead;
      setTimeout(() => this._reset(), 2000)
    }
    if (this._metadata.position.y > stage.mapData.rows * RendererService.SPRITE_LENGTH) {
      this._metadata.position = {x: 80, y: 500};
      this._velocity = {x: 0, y: 0}
      return;
    }

    this._metadata.position.x += this._velocity.x;
    this._metadata.position.y += this._velocity.y;

    this._velocity.x += this._acceleration.x;
    const collisionEventLeft = stage.getCollisionEventLeft(this._metadata);
    const collisionEventRight = stage.getCollisionEventRight(this._metadata);
    if (collisionEventLeft?.tile === "solid" && this._velocity.x < 0) {
      this._metadata.position.x = collisionEventLeft.position;
      this._velocity.x = 0;
    } else if (collisionEventRight?.tile === "solid" && this._velocity.x > 0) {
      this._metadata.position.x = collisionEventRight.position;
      this._velocity.x = 0;
    } else {
      if (this._acceleration.x === 0) {
        if (Math.abs(this._velocity.x) < ControlledPlayer.FRICTION) {
          this._velocity.x = 0;
        } else {
          this._velocity.x = this._velocity.x > 0
            ? this._velocity.x - ControlledPlayer.FRICTION
            : this._velocity.x + ControlledPlayer.FRICTION;
        }
      }
      if (this._velocity.x >= ControlledPlayer.MAX_SPEED) {
        this._velocity.x = ControlledPlayer.MAX_SPEED;
      } else if (this._velocity.x <= -ControlledPlayer.MAX_SPEED) {
        this._velocity.x = -ControlledPlayer.MAX_SPEED;
      }
    }

    const collisionEventBelow = stage.getCollisionEventBelow(this._metadata, this._velocity.y);
    if (collisionEventBelow && this._velocity.y >= 0) {
      this._metadata.position.y = collisionEventBelow.position;
      this._acceleration.y = 0;
      if (this._animationControl.state === PlayerState.falling) {
        this._animationControl.state = PlayerState.standing;
        soundPlayerService.playLand();
      }
      if (this._velocity.x === 0) {
        if (this._animationControl.state !== PlayerState.standing) {
          this._animationControl.state = PlayerState.standing;
        }
      } else {
        if (this._animationControl.state === PlayerState.standing) {
          this._animationControl.state = PlayerState.walking;
        } else if (this._animationControl.state === PlayerState.walking) {
          this._animationControl.update();
        }
      }
    } else {
      this._acceleration.y = ControlledPlayer.GRAVITY;
      this._animationControl.state = PlayerState.falling;
    }
    this._metadata.spriteIndex = this._animationControl.spriteIndex;

    const collisionEventAbove = stage.getCollisionEventAbove(this._metadata);
    if (collisionEventAbove?.tile === "solid") {
      this._metadata.position.y = collisionEventAbove.position;
      this._velocity.y = 0;
    } else {
      this._velocity.y = this._isGrounded ? 0 : this._velocity.y + this._acceleration.y;
    }

    if (this._velocity.x > 0) {
      this._metadata.isFlipped = false;
    } else if (this._velocity.x < 0) {
      this._metadata.isFlipped = true;
    }
  }

  private _buildAnimationStates(character: Character): Map<string, number[]> {
    switch (character) {
      case Character.orange:
        return new Map([
          [PlayerState.standing, [402]],
          [PlayerState.walking, [402, 403, 404, 405]],
          [PlayerState.falling, [406]],
          [PlayerState.dead, [407]]
        ]);
      case Character.green:
        return new Map([
          [PlayerState.standing, [450]],
          [PlayerState.walking, [450, 451, 452, 453]],
          [PlayerState.falling, [454]],
          [PlayerState.dead, [455]]
        ]);
      default: // blue
        return new Map([
          [PlayerState.standing, [354]],
          [PlayerState.walking, [354, 355, 356, 357]],
          [PlayerState.falling, [358]],
          [PlayerState.dead, [359]]
        ]);
    }
  }

  private get _isGrounded(): boolean {
    return this._animationControl.state === PlayerState.standing
      || this._animationControl.state === PlayerState.walking;
  }

  private _isDamaged(stage: Stage): boolean {
    const row = Math.floor((this._metadata.position.y + this._metadata.collisionBox.offset.y + this._metadata.collisionBox.height / 2) / RendererService.SPRITE_LENGTH);
    const col = Math.floor((this._metadata.position.x + this._metadata.collisionBox.offset.x + this._metadata.collisionBox.width / 2) / RendererService.SPRITE_LENGTH);
    return stage.mapData.spriteData[row * stage.mapData.cols + col] === 22;
  }

  private _reset(): void {
    this._metadata.position = {x: 80, y: 500};
    this._velocity = {x: 0, y: 0};
    this._animationControl.state = PlayerState.falling;
  }
}
