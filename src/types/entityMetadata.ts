export interface Vector {
    x: number;
    y: number;
}

export interface CollisionBox {
    width: number;
    height: number;
    offset: Vector;
}

export interface EntityMetadata {
    position: Vector;
    spriteIndex: number;
    isFlipped: boolean;
    collisionBox: CollisionBox;
}

export enum PlayerState {
    standing = "standing",
    walking = "walking",
    falling = "falling",
    dead = "dead"
}

export enum Character {
    blue = "blue",
    orange = "orange",
    green = "green"
}

export interface PlayerMetadata extends EntityMetadata {
    name: string;
    character: Character;
}
