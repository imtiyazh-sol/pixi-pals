/** PixiPals character — procedural spherical creature with idle animation. */
import {
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
} from 'three';

export class PixiPet {
  private readonly _mainGroup: Group = new Group();

  // Sub-groups kept for animation references
  private readonly _bodyGroup: Group = new Group();
  private readonly _headGroup: Group = new Group();
  private readonly _tailGroup: Group = new Group();
  private readonly _antennaeGroup: Group = new Group();
  private readonly _eyesGroup: Group = new Group();

  // Palette
  private readonly _matBody = new MeshStandardMaterial({ color: '#ff9a76', roughness: 0.6, metalness: 0.05 });
  private readonly _matBelly = new MeshStandardMaterial({ color: '#fff4e6', roughness: 0.8, metalness: 0.0 });
  private readonly _matEyeRing = new MeshStandardMaterial({ color: '#1a1a2e', roughness: 0.4, metalness: 0.1 });
  private readonly _matEyeWhite = new MeshBasicMaterial({ color: '#ffffff' });
  private readonly _matHighlight = new MeshBasicMaterial({ color: '#ffffff' });
  private readonly _matCheek = new MeshStandardMaterial({ color: '#ffb3c6', roughness: 0.7, metalness: 0.0 });
  private readonly _matAntenna = new MeshStandardMaterial({ color: '#1a1a2e', roughness: 0.5, metalness: 0.1 });

  // Animation state
  private _rafId = 0;
  private readonly _bodyBaseY = 0;
  private _nextBlinkAt = 0;
  private _blinkEndsAt = 0;
  private _blinking = false;
  private _antennaLBase = 0;
  private _antennaRBase = 0;

  public get datas(): Group {
    return this._mainGroup;
  }

  constructor() {
    this._build();
    // Schedule first blink ~4s in
    this._nextBlinkAt = performance.now() + 4000;
    const loop = () => {
      this.update();
      this._rafId = requestAnimationFrame(loop);
    };
    this._rafId = requestAnimationFrame(loop);
  }

  public update(): void {
    const t = performance.now() * 0.001;

    // Body bob
    this._bodyGroup.position.y = this._bodyBaseY + Math.sin(t * 2) * 0.05;

    // Head tilt
    this._headGroup.rotation.z = Math.sin(t * 1.5) * 0.08;

    // Tail sway
    this._tailGroup.rotation.y = Math.sin(t * 3) * 0.3;

    // Antennae wobble
    const antL = this._antennaeGroup.children[0];
    const antR = this._antennaeGroup.children[1];
    if (antL) antL.rotation.z = this._antennaLBase + Math.sin(t * 4) * 0.18;
    if (antR) antR.rotation.z = this._antennaRBase + Math.sin(t * 4 + Math.PI / 2) * 0.18;

    // Blink
    const now = performance.now();
    if (!this._blinking && now >= this._nextBlinkAt) {
      this._blinking = true;
      this._blinkEndsAt = now + 120;
      this._eyesGroup.scale.y = 0.1;
    } else if (this._blinking && now >= this._blinkEndsAt) {
      this._blinking = false;
      this._eyesGroup.scale.y = 1;
      this._nextBlinkAt = now + 4000;
    }
  }

  public dispose(): void {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = 0;
    }
  }

  private _build(): void {
    this._buildBody();
    this._buildHead();
    this._buildFace();
    this._buildLimbs();
    this._buildTail();
    this._buildAntennae();
    this._mainGroup.add(this._bodyGroup);
  }

  private _buildBody(): void {
    // Body: spherical, slightly squashed
    const bodyGeo = new SphereGeometry(0.55, 32, 24);
    const body = new Mesh(bodyGeo, this._matBody);
    body.scale.set(1, 0.9, 1);
    body.position.y = -0.1;
    this._bodyGroup.add(body);

    // Cream belly: smaller sphere in front, low
    const bellyGeo = new SphereGeometry(0.38, 24, 18);
    const belly = new Mesh(bellyGeo, this._matBelly);
    belly.scale.set(1, 0.8, 0.55);
    belly.position.set(0, -0.18, 0.28);
    this._bodyGroup.add(belly);
  }

  private _buildHead(): void {
    const headGeo = new SphereGeometry(0.42, 32, 24);
    const head = new Mesh(headGeo, this._matBody);
    this._headGroup.add(head);
    this._headGroup.position.set(0, 0.55, 0.05);
    this._bodyGroup.add(this._headGroup);
  }

  private _buildFace(): void {
    // Eyes: torus rings, filled with white sphere and highlight
    const eyeRingGeo = new TorusGeometry(0.08, 0.03, 12, 20);
    const eyeWhiteGeo = new SphereGeometry(0.07, 14, 12);
    const highlightGeo = new SphereGeometry(0.022, 10, 8);

    const eyeL = new Group();
    const ringL = new Mesh(eyeRingGeo, this._matEyeRing);
    ringL.position.set(-0.16, 0.07, 0.36);
    const whiteL = new Mesh(eyeWhiteGeo, this._matEyeWhite);
    whiteL.position.set(-0.16, 0.07, 0.34);
    const hlL = new Mesh(highlightGeo, this._matHighlight);
    hlL.position.set(-0.14, 0.09, 0.41);
    eyeL.add(ringL, whiteL, hlL);

    const eyeR = new Group();
    const ringR = new Mesh(eyeRingGeo, this._matEyeRing);
    ringR.position.set(0.16, 0.07, 0.36);
    const whiteR = new Mesh(eyeWhiteGeo, this._matEyeWhite);
    whiteR.position.set(0.16, 0.07, 0.34);
    const hlR = new Mesh(highlightGeo, this._matHighlight);
    hlR.position.set(0.18, 0.09, 0.41);
    eyeR.add(ringR, whiteR, hlR);

    this._eyesGroup.add(eyeL, eyeR);
    this._headGroup.add(this._eyesGroup);

    // Cheeks
    const cheekGeo = new SphereGeometry(0.055, 14, 12);
    const cheekL = new Mesh(cheekGeo, this._matCheek);
    cheekL.position.set(-0.27, -0.05, 0.28);
    cheekL.scale.set(1, 0.7, 0.5);
    const cheekR = new Mesh(cheekGeo, this._matCheek);
    cheekR.position.set(0.27, -0.05, 0.28);
    cheekR.scale.set(1, 0.7, 0.5);
    this._headGroup.add(cheekL, cheekR);

    // Small mouth: little torus arc
    const mouthGeo = new TorusGeometry(0.05, 0.014, 8, 14, Math.PI);
    const mouth = new Mesh(mouthGeo, this._matEyeRing);
    mouth.position.set(0, -0.08, 0.38);
    mouth.rotation.z = Math.PI;
    this._headGroup.add(mouth);
  }

  private _buildLimbs(): void {
    const legGeo = new CylinderGeometry(0.09, 0.09, 0.22, 14);
    const positions: Array<[number, number, number]> = [
      [-0.28, -0.55, 0.22],
      [0.28, -0.55, 0.22],
      [-0.28, -0.55, -0.22],
      [0.28, -0.55, -0.22],
    ];
    for (const [x, y, z] of positions) {
      const leg = new Mesh(legGeo, this._matBody);
      leg.position.set(x, y, z);
      this._bodyGroup.add(leg);
    }
  }

  private _buildTail(): void {
    // Curved tail: 3 stacked/rotated cylinders
    const segGeo1 = new CylinderGeometry(0.07, 0.06, 0.22, 12);
    const segGeo2 = new CylinderGeometry(0.06, 0.05, 0.2, 12);
    const segGeo3 = new CylinderGeometry(0.05, 0.03, 0.18, 12);

    const s1 = new Mesh(segGeo1, this._matBody);
    s1.position.set(0, 0.05, -0.1);
    s1.rotation.x = Math.PI / 3;

    const s2 = new Mesh(segGeo2, this._matBody);
    s2.position.set(0, 0.2, -0.2);
    s2.rotation.x = Math.PI / 2.2;

    const s3 = new Mesh(segGeo3, this._matBody);
    s3.position.set(0, 0.32, -0.28);
    s3.rotation.x = Math.PI / 1.7;

    this._tailGroup.add(s1, s2, s3);
    this._tailGroup.position.set(0, -0.15, -0.4);
    this._bodyGroup.add(this._tailGroup);
  }

  private _buildAntennae(): void {
    const stemGeo = new CylinderGeometry(0.012, 0.012, 0.22, 10);
    const tipGeo = new SphereGeometry(0.04, 14, 12);

    const antL = new Group();
    const stemL = new Mesh(stemGeo, this._matAntenna);
    stemL.position.y = 0.11;
    const tipL = new Mesh(tipGeo, this._matCheek);
    tipL.position.y = 0.24;
    antL.add(stemL, tipL);
    antL.position.set(-0.14, 0.38, 0);
    this._antennaLBase = 0.1;
    antL.rotation.z = this._antennaLBase;

    const antR = new Group();
    const stemR = new Mesh(stemGeo, this._matAntenna);
    stemR.position.y = 0.11;
    const tipR = new Mesh(tipGeo, this._matCheek);
    tipR.position.y = 0.24;
    antR.add(stemR, tipR);
    antR.position.set(0.14, 0.38, 0);
    this._antennaRBase = -0.1;
    antR.rotation.z = this._antennaRBase;

    this._antennaeGroup.add(antL, antR);
    this._headGroup.add(this._antennaeGroup);
  }
}
