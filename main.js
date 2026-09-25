// Turtle Art Builder - Text-based Command Builder
class TurtleArtBuilder {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // State
    this.commands = [];
    this.currentColor = 'black';
    
    // Canvas setup
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
    this.centerX = this.canvasWidth / 2;
    this.centerY = this.canvasHeight / 2;
    
    // Scaling: 50 pixels = 1 coordinate unit
    this.scale = 2.5; // pixels per coordinate unit
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Command buttons
    document.getElementById('penUpBtn').addEventListener('click', () => this.addCommand('penup'));
    document.getElementById('penDownBtn').addEventListener('click', () => this.addCommand('pendown'));
    
    // Goto button
    document.getElementById('gotoBtn').addEventListener('click', () => {
      const x = parseInt(document.getElementById('gotoX').value);
      const y = parseInt(document.getElementById('gotoY').value);
      this.addCommand('goto', x, y);
    });
    
    // Allow Enter key in goto inputs
    document.getElementById('gotoX').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') document.getElementById('gotoBtn').click();
    });
    document.getElementById('gotoY').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') document.getElementById('gotoBtn').click();
    });
    
    // Color buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = e.target.getAttribute('data-color');
        this.addCommand('pencolor', color);
      });
    });
    
    // Action buttons
    document.getElementById('undoBtn').addEventListener('click', () => this.undo());
    document.getElementById('clearBtn').addEventListener('click', () => this.clear());
    document.getElementById('runBtn').addEventListener('click', () => this.run());
    document.getElementById('copyBtn').addEventListener('click', () => this.copyPython());
  }

  addCommand(type, arg1 = null, arg2 = null) {
    const cmd = { type };
    if (arg1 !== null) cmd.arg1 = arg1;
    if (arg2 !== null) cmd.arg2 = arg2;
    
    this.commands.push(cmd);
    
    if (type === 'pencolor') {
      this.currentColor = arg1;
    }
    
    this.updateBuildWindow();
    this.draw();
  }

  undo() {
    if (this.commands.length > 0) {
      this.commands.pop();
      this.updateBuildWindow();
      this.draw();
    }
  }

  clear() {
    if (this.commands.length > 0) {
      if (confirm('Clear all commands?')) {
        this.commands = [];
        this.currentColor = 'black';
        this.updateBuildWindow();
        this.draw();
      }
    }
  }

  updateBuildWindow() {
    const buildList = document.getElementById('buildList');
    const emptyMsg = document.getElementById('emptyBuild');
    
    if (this.commands.length === 0) {
      buildList.innerHTML = '';
      emptyMsg.style.display = 'block';
    } else {
      emptyMsg.style.display = 'none';
      
      const lines = this.commands.map((cmd, idx) => {
        const text = this.commandToText(cmd);
        return `
          <div class="build-line">
            <span class="line-number">${idx + 1}</span>
            <span class="line-text">${this.escapeHtml(text)}</span>
            <button class="delete-line" onclick="app.deleteCommand(${idx})">✕</button>
          </div>
        `;
      }).join('');
      
      buildList.innerHTML = lines;
    }
    
    this.updatePythonCode();
  }

  deleteCommand(index) {
    this.commands.splice(index, 1);
    this.updateBuildWindow();
    this.draw();
  }

  commandToText(cmd) {
    switch (cmd.type) {
      case 'penup':
        return 'penup()';
      case 'pendown':
        return 'pendown()';
      case 'goto':
        return `goto(${cmd.arg1}, ${cmd.arg2})`;
      case 'pencolor':
        return `pencolor("${cmd.arg1}")`;
      default:
        return '';
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  run() {
    if (this.commands.length === 0) {
      alert('Add some commands first!');
      return;
    }
    this.draw();
  }

  updatePythonCode() {
    const lines = [
      'import turtle',
      '',
      't = turtle.Turtle()',
      't.speed(0)',
      ''
    ];
    
    for (const cmd of this.commands) {
      switch (cmd.type) {
        case 'penup':
          lines.push('t.penup()');
          break;
        case 'pendown':
          lines.push('t.pendown()');
          break;
        case 'goto':
          lines.push(`t.goto(${cmd.arg1}, ${cmd.arg2})`);
          break;
        case 'pencolor':
          lines.push(`t.pencolor("${cmd.arg1}")`);
          break;
      }
    }
    
    lines.push('');
    lines.push('turtle.done()');
    
    document.getElementById('pythonCode').textContent = lines.join('\n');
  }

  copyPython() {
    const code = document.getElementById('pythonCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById('copyBtn');
      const originalText = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    }).catch(() => {
      alert('Failed to copy. Please try again.');
    });
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Draw light grid
    this.ctx.strokeStyle = '#f0f0f0';
    this.ctx.lineWidth = 1;
    for (let i = -100; i <= 100; i += 50) {
      const x = this.centerX + i * this.scale;
      const y = this.centerY - i * this.scale;
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasHeight);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasWidth, y);
      this.ctx.stroke();
    }
    
    // Draw axes
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.centerY);
    this.ctx.lineTo(this.canvasWidth, this.centerY);
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, 0);
    this.ctx.lineTo(this.centerX, this.canvasHeight);
    this.ctx.stroke();
    
    // Execute commands
    let x = 0, y = 0;
    let penIsDown = false;
    let penColor = 'black';
    
    this.ctx.strokeStyle = penColor;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    for (const cmd of this.commands) {
      if (cmd.type === 'penup') {
        penIsDown = false;
      } else if (cmd.type === 'pendown') {
        penIsDown = true;
      } else if (cmd.type === 'goto') {
        const newX = cmd.arg1;
        const newY = cmd.arg2;
        
        const fromScreenX = this.centerX + x * this.scale;
        const fromScreenY = this.centerY - y * this.scale;
        const toScreenX = this.centerX + newX * this.scale;
        const toScreenY = this.centerY - newY * this.scale;
        
        if (penIsDown) {
          this.ctx.strokeStyle = penColor;
          this.ctx.beginPath();
          this.ctx.moveTo(fromScreenX, fromScreenY);
          this.ctx.lineTo(toScreenX, toScreenY);
          this.ctx.stroke();
        }
        
        x = newX;
        y = newY;
      } else if (cmd.type === 'pencolor') {
        penColor = cmd.arg1;
      }
    }
    
    // Draw current position
    const curScreenX = this.centerX + x * this.scale;
    const curScreenY = this.centerY - y * this.scale;
    this.ctx.fillStyle = '#667eea';
    this.ctx.beginPath();
    this.ctx.arc(curScreenX, curScreenY, 5, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new TurtleArtBuilder();
  app.draw();
});
