class CanDesigner {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Default state
    this.state = {
      baseColor: '#dbeafe',
      accentColor: '#0ea5e9',
      text: { brand: 'Soofty', flavor: 'Café', size: 48, color: '#0b0b0b' },
      image: null, // HTMLImageElement or null
      imageScale: 1,
      imageOffset: { x: 0, y: 0 },
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      imageOffsetStart: { x: 0, y: 0 },
    };

    this.draw();
  }

  // --- Geometry helpers
  getMetrics() {
    const { canvas } = this;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const canHeight = canvas.height * 0.74;
    const canWidth = canHeight * 0.42;
    const rx = canWidth / 2;
    const ry = rx * 0.22;
    const topCenterY = centerY - canHeight / 2 + ry;
    const bottomCenterY = centerY + canHeight / 2 - ry;
    return { centerX, centerY, canWidth, canHeight, rx, ry, topCenterY, bottomCenterY };
  }

  clipCanSilhouette() {
    const { ctx } = this;
    const { centerX, rx, ry, topCenterY, bottomCenterY } = this.getMetrics();

    ctx.beginPath();
    // Top ellipse (half)
    ctx.ellipse(centerX, topCenterY, rx, ry, 0, Math.PI, 0, false);
    // Right side
    ctx.lineTo(centerX + rx, bottomCenterY);
    // Bottom ellipse (half)
    ctx.ellipse(centerX, bottomCenterY, rx, ry, 0, 0, Math.PI, false);
    // Left side
    ctx.lineTo(centerX - rx, topCenterY);
    ctx.closePath();
    ctx.clip();
  }

  clear() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Subtle backdrop
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, 'rgba(255,255,255,0.03)');
    grad.addColorStop(1, 'rgba(255,255,255,0.00)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  drawCanBase() {
    const { ctx } = this;
    const { baseColor } = this.state;
    const { centerX, rx, ry, topCenterY, bottomCenterY } = this.getMetrics();

    // Fill the silhouette with base color
    ctx.save();
    this.clipCanSilhouette();
    ctx.fillStyle = baseColor;
    const height = bottomCenterY - topCenterY + 2 * ry;
    const width = rx * 2;
    ctx.fillRect(centerX - rx, topCenterY - ry, width, height);

    // Metallic cylindrical shading overlay
    const grad = ctx.createLinearGradient(centerX - rx, 0, centerX + rx, 0);
    grad.addColorStop(0.0, 'rgba(0,0,0,0.25)');
    grad.addColorStop(0.15, 'rgba(255,255,255,0.12)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.22)');
    grad.addColorStop(0.85, 'rgba(255,255,255,0.12)');
    grad.addColorStop(1.0, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = grad;
    ctx.fillRect(centerX - rx, topCenterY - ry, width, height);

    // Vertical highlight stripe
    const stripe = ctx.createLinearGradient(centerX - rx * 0.1, 0, centerX + rx * 0.1, 0);
    stripe.addColorStop(0, 'rgba(255,255,255,0)');
    stripe.addColorStop(0.5, 'rgba(255,255,255,0.35)');
    stripe.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = stripe;
    ctx.fillRect(centerX - rx * 0.2, topCenterY - ry, rx * 0.4, height);
    ctx.globalAlpha = 1;
    ctx.restore();

    // Top and bottom rims
    this.drawRims();
  }

  drawRims() {
    const { ctx } = this;
    const { centerX, rx, ry, topCenterY, bottomCenterY } = this.getMetrics();

    ctx.save();
    // Top rim
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.ellipse(centerX, topCenterY, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner shadow under top
    const topShadow = ctx.createLinearGradient(0, topCenterY - ry, 0, topCenterY + ry);
    topShadow.addColorStop(0, 'rgba(0,0,0,0.2)');
    topShadow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = topShadow;
    ctx.beginPath();
    ctx.ellipse(centerX, topCenterY, rx * 0.96, ry * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bottom rim
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(centerX, bottomCenterY, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawAccent() {
    const { ctx } = this;
    const { accentColor } = this.state;
    const { centerX, rx, ry, topCenterY, bottomCenterY } = this.getMetrics();

    const height = bottomCenterY - topCenterY + 2 * ry;
    ctx.save();
    this.clipCanSilhouette();
    ctx.translate(centerX, 0);
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = accentColor;

    // Curved stripe
    ctx.beginPath();
    const stripeW = rx * 0.18;
    ctx.moveTo(-rx * 0.2, topCenterY - ry);
    ctx.bezierCurveTo(
      -rx * 0.05, topCenterY + height * 0.15,
      -rx * 0.35, topCenterY + height * 0.55,
      -rx * 0.05, bottomCenterY + ry
    );
    ctx.lineTo(-rx * 0.05 + stripeW, bottomCenterY + ry);
    ctx.bezierCurveTo(
      -rx * 0.35 + stripeW, topCenterY + height * 0.55,
      -rx * 0.05 + stripeW, topCenterY + height * 0.15,
      -rx * 0.2 + stripeW, topCenterY - ry
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawImage() {
    const { image, imageScale, imageOffset } = this.state;
    if (!image) return;

    const { ctx } = this;
    const { centerX, rx, ry, topCenterY, bottomCenterY } = this.getMetrics();
    const drawW = image.naturalWidth * imageScale;
    const drawH = image.naturalHeight * imageScale;
    const baseX = centerX - drawW / 2 + imageOffset.x;
    const baseY = (topCenterY + bottomCenterY) / 2 - drawH / 2 + imageOffset.y;

    ctx.save();
    this.clipCanSilhouette();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, baseX, baseY, drawW, drawH);
    ctx.restore();
  }

  drawText() {
    const { ctx } = this;
    const { text } = this.state;
    const { centerX, topCenterY, bottomCenterY } = this.getMetrics();
    const middleY = (topCenterY + bottomCenterY) / 2;

    ctx.save();
    this.clipCanSilhouette();

    ctx.fillStyle = text.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Brand
    ctx.font = `700 ${text.size}px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial`;
    ctx.fillText(text.brand || '', centerX, middleY - text.size * 0.3);

    // Flavor (smaller)
    const flavorSize = Math.max(14, Math.round(text.size * 0.55));
    ctx.font = `600 ${flavorSize}px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial`;
    ctx.globalAlpha = 0.9;
    ctx.fillText(text.flavor || '', centerX, middleY + flavorSize * 0.6);

    ctx.restore();
  }

  draw() {
    this.clear();
    this.drawCanBase();
    this.drawAccent();
    this.drawImage();
    this.drawText();
  }

  // --- State update helpers
  setBaseColor(color) { this.state.baseColor = color; this.draw(); }
  setAccentColor(color) { this.state.accentColor = color; this.draw(); }
  setTextBrand(brand) { this.state.text.brand = brand; this.draw(); }
  setTextFlavor(flavor) { this.state.text.flavor = flavor; this.draw(); }
  setTextSize(size) { this.state.text.size = size; this.draw(); }
  setTextColor(color) { this.state.text.color = color; this.draw(); }
  setImageScale(scale) { this.state.imageScale = scale; this.draw(); }
  resetImage() { this.state.image = null; this.state.imageOffset = { x: 0, y: 0 }; this.state.imageScale = 1; this.draw(); }

  async loadImageFromFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      // Fit image nicely within can width
      const { canWidth } = this.getMetrics();
      const desired = canWidth * 0.6; // 60% of can width
      const initialScale = desired / img.naturalWidth;
      this.state.image = img;
      this.state.imageScale = initialScale;
      this.state.imageOffset = { x: 0, y: 0 };
      this.draw();
      // Revoke after first paint to free memory
      setTimeout(() => URL.revokeObjectURL(url), 0);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }

  // --- Pointer interactions for panning image
  attachPointerHandlers(canvas) {
    canvas.addEventListener('pointerdown', (e) => {
      if (!this.state.image) return;
      this.state.isDragging = true;
      canvas.setPointerCapture(e.pointerId);
      this.state.dragStart = { x: e.clientX, y: e.clientY };
      this.state.imageOffsetStart = { ...this.state.imageOffset };
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!this.state.isDragging) return;
      e.preventDefault();
      const dx = e.clientX - this.state.dragStart.x;
      const dy = e.clientY - this.state.dragStart.y;
      this.state.imageOffset = {
        x: this.state.imageOffsetStart.x + dx,
        y: this.state.imageOffsetStart.y + dy,
      };
      this.draw();
    });
    const endDrag = (e) => {
      if (!this.state.isDragging) return;
      this.state.isDragging = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('pointerleave', endDrag);
  }
}

function init() {
  const canvas = document.getElementById('canvas');
  const designer = new CanDesigner(canvas);

  // Controls
  const baseColor = document.getElementById('baseColor');
  const accentColor = document.getElementById('accentColor');
  const brandText = document.getElementById('brandText');
  const flavorText = document.getElementById('flavorText');
  const textSize = document.getElementById('textSize');
  const textColor = document.getElementById('textColor');
  const imageInput = document.getElementById('imageInput');
  const imageScale = document.getElementById('imageScale');
  const resetImage = document.getElementById('resetImage');
  const exportPng = document.getElementById('exportPng');

  // Wire controls
  baseColor.addEventListener('input', (e) => designer.setBaseColor(e.target.value));
  accentColor.addEventListener('input', (e) => designer.setAccentColor(e.target.value));
  brandText.addEventListener('input', (e) => designer.setTextBrand(e.target.value));
  flavorText.addEventListener('input', (e) => designer.setTextFlavor(e.target.value));
  textSize.addEventListener('input', (e) => designer.setTextSize(Number(e.target.value)));
  textColor.addEventListener('input', (e) => designer.setTextColor(e.target.value));

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) designer.loadImageFromFile(file);
  });
  imageScale.addEventListener('input', (e) => designer.setImageScale(Number(e.target.value)));
  resetImage.addEventListener('click', () => designer.resetImage());

  // Drag & drop file onto canvas
  canvas.addEventListener('dragover', (e) => { e.preventDefault(); });
  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) designer.loadImageFromFile(file);
  });

  // Pan image with pointer
  designer.attachPointerHandlers(canvas);

  // Export PNG
  exportPng.addEventListener('click', () => {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soofty-can.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
}

document.addEventListener('DOMContentLoaded', init);
