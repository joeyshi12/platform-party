import { Sketch } from "./sketch";
import * as p5 from "p5";
import { RendererService } from "./services/rendererService";
import { Lobby } from "./scenes/lobby";
import { Scene } from "./scenes/scene";
import { ArcadeDataService } from "./services/arcadeDataService";
import { SoundPlayerService } from "./services/soundPlayerService";

export class PlatformerSketch extends Sketch {
  private _scene: Scene;
  private _font: p5.Font;
  private _spriteSheet: p5.Image;
  // private _soundFiles: SoundFiles;

  constructor(private _arcadeService: ArcadeDataService,
              private _rendererService: RendererService,
              private _soundPlayerService: SoundPlayerService) {
    super();
    this._scene = new Lobby(this);
  }

  public get arcadeService(): ArcadeDataService {
    return this._arcadeService;
  }

  public get rendererService(): RendererService {
    return this._rendererService;
  }

  public get soundPlayerService(): SoundPlayerService {
    return this._soundPlayerService;
  }

  public set scene(val: Scene) {
    this._scene = val;
  }

  protected override preload(context: p5): void {
    this._font = context.loadFont("assets/inconsolata.otf");
    this._spriteSheet = context.loadImage("assets/spritesheet.png");
    // this._soundFiles = {
    //   click: new p5.SoundFile("assets/click.mp3"),
    //   pause: new p5.SoundFile("assets/pause.mp3"),
    //   jump: new p5.SoundFile("assets/jump.mp3"),
    //   land: new p5.SoundFile("assets/land.mp3")
    // };
  }

  protected override setUp(context: p5): void {
    context.textFont(this._font);
    this._rendererService.spriteSheet = this._spriteSheet;
    // this._soundPlayerService.soundFiles = this._soundFiles;
    const canvas = context.createCanvas(400, 400);
    canvas.parent("canvas");
    context.frameRate(60);
  }

  protected override mouseMoved(context: p5): void {
    this._scene.mouseMoved(context);
  }

  protected override mouseClicked(context: p5): void {
    this._scene.mouseClicked(context);
  }

  protected override keyPressed(context: p5): void {
    this._scene.keyPressed(context);
  }

  protected override keyReleased(context: p5): void {
    this._scene.keyReleased(context);
  }

  protected draw(context: p5): void {
    this._scene.draw(context);
  }
}