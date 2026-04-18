class ShipGrid {
    constructor(canvasId, imgSrc, cols, rows) {
      this.canvas = document.getElementById(canvasId);
      this.ctx    = this.canvas.getContext('2d');
      this.cols   = cols;
      this.rows   = rows;
      this.tiles  = [];
      this.state  = 'grid';
      this.animId = null;
      this.img    = new Image();
  
      this.img.onload = () => {
        this.canvas.width  = this.img.naturalWidth;
        this.canvas.height = this.img.naturalHeight;
        this._buildTiles();
        this._draw();
      };
  
      this.img.src = imgSrc;
    }
  
    _buildTiles() {
      const tw = this.img.naturalWidth  / this.cols;
      const th = this.img.naturalHeight / this.rows;
      this.tiles = [];
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          this.tiles.push({
            sx: c * tw, sy: r * th, tw, th,
            x: c * tw,  y: r * th,
            vx: 0, vy: 0,
            home: { x: c * tw, y: r * th }
          });
        }
      }
    }
  
    _draw() {
      const { ctx, canvas, img, tiles, cols, rows } = this;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      tiles.forEach(t => {
        ctx.drawImage(img, t.sx, t.sy, t.tw, t.th, t.x, t.y, t.tw, t.th);
      });
  
      if (this.state === 'grid') {
        const tw = canvas.width  / cols;
        const th = canvas.height / rows;
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1.2;
        for (let c = 1; c < cols; c++) {
          ctx.beginPath(); ctx.moveTo(c * tw, 0); ctx.lineTo(c * tw, canvas.height); ctx.stroke();
        }
        for (let r = 1; r < rows; r++) {
          ctx.beginPath(); ctx.moveTo(0, r * th); ctx.lineTo(canvas.width, r * th); ctx.stroke();
        }
      }
    }
  
    toggle() {
      if (this.state === 'grid')       this._disperse();
      else if (this.state === 'done')  this._reassemble();
    }
  
    _disperse() {
      this.state = 'dispersing';
      const cx = this.canvas.width  / 2;
      const cy = this.canvas.height / 2;
      this.tiles.forEach(t => {
        const angle = Math.atan2(t.y + t.th / 2 - cy, t.x + t.tw / 2 - cx);
        const speed = 8 + Math.random() * 12;
        t.vx = Math.cos(angle) * speed;
        t.vy = Math.sin(angle) * speed;
      });
      this._animate();
    }
  
    _reassemble() {
      this.state = 'reassembling';
      this._animate();
    }
  
    _animate() {
      cancelAnimationFrame(this.animId);
      const step = () => {
        if (this.state === 'dispersing') {
          let done = true;
          this.tiles.forEach(t => {
            t.x += t.vx; t.y += t.vy;
            t.vx *= 0.96; t.vy *= 0.96;
            if (Math.hypot(t.vx, t.vy) > 0.5) done = false;
          });
          this._draw();
          if (done) { this.state = 'done'; return; }
  
        } else if (this.state === 'reassembling') {
          let done = true;
          this.tiles.forEach(t => {
            const dx = t.home.x - t.x;
            const dy = t.home.y - t.y;
            t.x += dx * 0.1;
            t.y += dy * 0.1;
            if (Math.abs(dx) > 0.8 || Math.abs(dy) > 0.8) done = false;
          });
          this._draw();
          if (done) {
            this.tiles.forEach(t => { t.x = t.home.x; t.y = t.home.y; });
            this.state = 'grid';
            this._draw();
            return;
          }
        }
        this.animId = requestAnimationFrame(step);
      };
      this.animId = requestAnimationFrame(step);
    }
  }
