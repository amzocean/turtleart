// Turtle Art Builder - Text-based Command Builder
class TurtleArtBuilder {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // State
    this.commands = [];
    this.currentColor = 'black';
    
    // Turtle state for rendering
    this.turtleX = 0;
    this.turtleY = 0;
    this.turtleHeading = 90; // degrees, 90 = up/north
    this.penIsDown = true;
    
    // Canvas setup
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
    this.centerX = this.canvasWidth / 2;
    this.centerY = this.canvasHeight / 2;
    
    // Scaling: coordinate units to pixels
    this.scale = 2.5; // pixels per coordinate unit
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Presets
    const CORRECT_PIN = '2342';
    let presetsUnlocked = false;

    document.getElementById('presetsBtn').addEventListener('click', () => {
      if (!presetsUnlocked) {
        document.getElementById('pinModal').classList.remove('hidden');
        document.getElementById('pinInput').focus();
      } else {
        const dropdown = document.getElementById('presetsDropdown');
        dropdown.classList.toggle('hidden');
      }
    });

    document.getElementById('pinSubmitBtn').addEventListener('click', () => {
      const pin = document.getElementById('pinInput').value;
      if (pin === CORRECT_PIN) {
        presetsUnlocked = true;
        document.getElementById('pinModal').classList.add('hidden');
        document.getElementById('pinInput').value = '';
        document.getElementById('presetsDropdown').classList.remove('hidden');
      } else {
        alert('Incorrect PIN');
        document.getElementById('pinInput').value = '';
      }
    });

    document.getElementById('pinCancelBtn').addEventListener('click', () => {
      document.getElementById('pinModal').classList.add('hidden');
      document.getElementById('pinInput').value = '';
    });

    document.getElementById('pinInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('pinSubmitBtn').click();
      }
    });

    document.getElementById('closePresetsBtn').addEventListener('click', () => {
      document.getElementById('presetsDropdown').classList.add('hidden');
    });

    // Preset items
    document.querySelectorAll('.preset-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = e.target.dataset.preset;
        this.loadPreset(preset);
        document.getElementById('presetsDropdown').classList.add('hidden');
      });
    });

    // Command buttons
    document.getElementById('penUpBtn').addEventListener('click', () => this.addCommand('penup'));
    document.getElementById('penDownBtn').addEventListener('click', () => this.addCommand('pendown'));
    
    // Goto button
    document.getElementById('gotoBtn').addEventListener('click', () => {
      const x = parseInt(document.getElementById('gotoX').value);
      const y = parseInt(document.getElementById('gotoY').value);
      this.addCommand('goto', x, y);
      document.getElementById('gotoX').value = '0';
      document.getElementById('gotoY').value = '0';
    });
    
    // Circle button
    document.getElementById('circleBtn').addEventListener('click', () => {
      const radius = parseInt(document.getElementById('circleRadius').value);
      if (!isNaN(radius) && radius > 0) {
        this.addCommand('circle', radius);
        document.getElementById('circleRadius').value = '50';
      }
    });
    
    // Turn buttons
    document.getElementById('turnLeftBtn').addEventListener('click', () => {
      const angle = parseInt(document.getElementById('turnAngle').value);
      if (!isNaN(angle)) {
        this.addCommand('turnleft', angle);
        document.getElementById('turnAngle').value = '90';
      }
    });
    
    document.getElementById('turnRightBtn').addEventListener('click', () => {
      const angle = parseInt(document.getElementById('turnAngle').value);
      if (!isNaN(angle)) {
        this.addCommand('turnright', angle);
        document.getElementById('turnAngle').value = '90';
      }
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
      case 'circle':
        return `circle(${cmd.arg1})`;
      case 'turnleft':
        return `left(${cmd.arg1})`;
      case 'turnright':
        return `right(${cmd.arg1})`;
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
        case 'circle':
          lines.push(`t.circle(${cmd.arg1})`);
          break;
        case 'turnleft':
          lines.push(`t.left(${cmd.arg1})`);
          break;
        case 'turnright':
          lines.push(`t.right(${cmd.arg1})`);
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

  loadPreset(presetNum) {
    this.clear();
    const presets = {
      '1': [
        { type: 'penup' },
        { type: 'goto', arg1: -50, arg2: 0 },
        { type: 'goto', arg1: 50, arg2: 0 }
      ],
      '2': [
        { type: 'penup' },
        { type: 'goto', arg1: -50, arg2: -50 },
        { type: 'pendown' },
        { type: 'goto', arg1: 50, arg2: 50 }
      ],
      '3': [
        { type: 'goto', arg1: -50, arg2: 50 },
        { type: 'pendown' },
        { type: 'goto', arg1: -50, arg2: -50 },
        { type: 'goto', arg1: 50, arg2: -50 }
      ],
      '4': [
        { type: 'penup' },
        { type: 'goto', arg1: -50, arg2: -50 },
        { type: 'pendown' },
        { type: 'goto', arg1: 0, arg2: 50 },
        { type: 'goto', arg1: 50, arg2: -50 },
        { type: 'goto', arg1: -50, arg2: -50 }
      ],
      '5': [
        { type: 'penup' },
        { type: 'goto', arg1: -50, arg2: 50 },
        { type: 'pendown' },
        { type: 'goto', arg1: 50, arg2: 50 },
        { type: 'goto', arg1: 50, arg2: -50 },
        { type: 'goto', arg1: -50, arg2: -50 },
        { type: 'goto', arg1: -50, arg2: 50 }
      ],
      '6': [
        { type: 'penup' },
        { type: 'goto', arg1: -50, arg2: -50 },
        { type: 'pendown' },
        { type: 'goto', arg1: 0, arg2: 50 },
        { type: 'goto', arg1: 50, arg2: -50 },
        { type: 'penup' },
        { type: 'goto', arg1: -25, arg2: 0 },
        { type: 'pendown' },
        { type: 'goto', arg1: 25, arg2: 0 }
      ],
      '7': [
        { type: 'penup' },
        { type: 'goto', arg1: -50, arg2: -50 },
        { type: 'pendown' },
        { type: 'goto', arg1: 50, arg2: -50 },
        { type: 'goto', arg1: 50, arg2: 0 },
        { type: 'goto', arg1: -50, arg2: 0 },
        { type: 'goto', arg1: -50, arg2: -50 },
        { type: 'penup' },
        { type: 'goto', arg1: -50, arg2: 0 },
        { type: 'pendown' },
        { type: 'goto', arg1: 0, arg2: 50 },
        { type: 'goto', arg1: 50, arg2: 0 }
      ],
      '9': [
        { type: 'penup' },
        { type: 'goto', arg1: 0, arg2: 100 },
        { type: 'pendown' },
        { type: 'goto', arg1: 100, arg2: 0 },
        { type: 'goto', arg1: 0, arg2: -100 },
        { type: 'goto', arg1: -100, arg2: 0 },
        { type: 'goto', arg1: 0, arg2: 100 },
        { type: 'penup' },
        { type: 'goto', arg1: 0, arg2: 50 },
        { type: 'pendown' },
        { type: 'goto', arg1: 50, arg2: 0 },
        { type: 'goto', arg1: 0, arg2: -50 },
        { type: 'goto', arg1: -50, arg2: 0 },
        { type: 'goto', arg1: 0, arg2: 50 }
      ],
      '10': [
        { type: 'penup' },
        { type: 'goto', arg1: 0, arg2: 100 },
        { type: 'pendown' },
        { type: 'goto', arg1: 70, arg2: 70 },
        { type: 'goto', arg1: 100, arg2: 0 },
        { type: 'goto', arg1: 70, arg2: -70 },
        { type: 'goto', arg1: 0, arg2: -100 },
        { type: 'goto', arg1: -70, arg2: -70 },
        { type: 'goto', arg1: -100, arg2: 0 },
        { type: 'goto', arg1: -70, arg2: 70 },
        { type: 'goto', arg1: 0, arg2: 100 }
      ],
      '13': [
        { type: 'pendown' },
        { type: 'circle', arg1: 40 }
      ],
      '14': [
        { type: 'pendown' },
        { type: 'circle', arg1: 40 },
        { type: 'turnright', arg1: 60 },
        { type: 'circle', arg1: 40 }
      ],
      '15': [
        { type: 'pendown' },
        { type: 'circle', arg1: 50 },
        { type: 'turnright', arg1: 60 },
        { type: 'circle', arg1: 50 },
        { type: 'turnright', arg1: 60 },
        { type: 'circle', arg1: 50 },
        { type: 'turnright', arg1: 60 },
        { type: 'circle', arg1: 50 },
        { type: 'turnright', arg1: 60 },
        { type: 'circle', arg1: 50 },
        { type: 'turnright', arg1: 60 },
        { type: 'circle', arg1: 50 }
      ],
      '16': [
        { type: 'pendown' },
        { type: 'circle', arg1: 50 },
        { type: 'turnright', arg1: 30 },
        { type: 'circle', arg1: 50 },
        { type: 'turnright', arg1: 30 },
        { type: 'circle', arg1: 50 },
        { type: 'turnright', arg1: 30 },
        { type: 'circle', arg1: 50 },
        { type: 'turnright', arg1: 30 },
        { type: 'circle', arg1: 50 },
        { type: 'turnright', arg1: 30 },
        { type: 'circle', arg1: 50 },
        { type: 'turnright', arg1: 30 },
        { type: 'circle', arg1: 50 },
        { type: 'turnright', arg1: 30 },
        { type: 'circle', arg1: 50 },
        { type: 'turnright', arg1: 30 },
        { type: 'circle', arg1: 50 },
        { type: 'turnright', arg1: 30 },
        { type: 'circle', arg1: 50 },
        { type: 'turnright', arg1: 30 },
        { type: 'circle', arg1: 50 },
        { type: 'turnright', arg1: 30 },
        { type: 'circle', arg1: 50 }
      ],
      '17': [
        { type: 'pendown' },
        { type: 'circle', arg1: 30 },
        { type: 'pencolor', arg1: 'red' },
        { type: 'circle', arg1: 50 },
        { type: 'pencolor', arg1: 'blue' },
        { type: 'circle', arg1: 70 }
      ],
      '18': [
        { type: 'penup' },
        { type: 'goto', arg1: -30, arg2: 50 },
        { type: 'pendown' },
        { type: 'goto', arg1: -30, arg2: -50 },
        { type: 'penup' },
        { type: 'goto', arg1: -30, arg2: 0 },
        { type: 'pendown' },
        { type: 'goto', arg1: 0, arg2: 0 },
        { type: 'penup' },
        { type: 'goto', arg1: 0, arg2: 50 },
        { type: 'pendown' },
        { type: 'goto', arg1: 0, arg2: -50 },
        { type: 'penup' },
        { type: 'goto', arg1: 30, arg2: 50 },
        { type: 'pendown' },
        { type: 'goto', arg1: 30, arg2: -50 }
      ]
    };

    if (presets[presetNum]) {
      this.commands = presets[presetNum];
      this.updateBuildWindow();
      this.draw();
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Calculate bounding box by simulating all commands
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    let x = 0, y = 0;
    let heading = 0;
    
    const updateBounds = (px, py) => {
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    };
    
    for (const cmd of this.commands) {
      if (cmd.type === 'penup' || cmd.type === 'pendown') {
        // penup/pendown don't move turtle, no bounds update
      } else if (cmd.type === 'goto') {
        x = cmd.arg1;
        y = cmd.arg2;
        updateBounds(x, y);
      } else if (cmd.type === 'circle') {
        const radius = cmd.arg1;
        const leftHeading = heading + 90;
        const centerX = x + radius * Math.cos(leftHeading * Math.PI / 180);
        const centerY = y + radius * Math.sin(leftHeading * Math.PI / 180);
        updateBounds(centerX - radius, centerY - radius);
        updateBounds(centerX + radius, centerY + radius);
      } else if (cmd.type === 'turnleft') {
        heading += cmd.arg1;
      } else if (cmd.type === 'turnright') {
        heading -= cmd.arg1;
      } else if (cmd.type === 'pencolor') {
        // Color doesn't affect bounds
      }
    }
    
    // Include turtle start position
    minX = Math.min(minX, 0);
    maxX = Math.max(maxX, 0);
    minY = Math.min(minY, 0);
    maxY = Math.max(maxY, 0);
    
    // Auto-zoom to fit with padding
    const padding = 30;
    const width = maxX - minX || 100;
    const height = maxY - minY || 100;
    const scaleX = (this.canvasWidth - 2 * padding) / width;
    const scaleY = (this.canvasHeight - 2 * padding) / height;
    
    // Use natural fit, but don't zoom in beyond 1.0 and don't zoom out below 0.5
    this.scale = Math.max(0.5, Math.min(scaleX, scaleY, 1.0));
    
    // Keep origin at center of canvas (don't shift center based on bounding box)
    this.centerX = this.canvasWidth / 2;
    this.centerY = this.canvasHeight / 2;
    
     // NOW draw grid with correct scale after zoom is calculated
    // Dynamically determine grid spacing based on bounding box
    const gridSize = Math.max(Math.abs(minX), Math.abs(maxX), Math.abs(minY), Math.abs(maxY));
    const gridStep = gridSize > 200 ? 100 : gridSize > 100 ? 50 : 25;
    
    // Extend grid symmetrically to include all quadrants
    const extendedRange = Math.ceil(gridSize / gridStep) * gridStep;
    const gridMin = -extendedRange;
    const gridMax = extendedRange;
    
    // Draw grid lines
    this.ctx.strokeStyle = '#d0d0d0';
    this.ctx.lineWidth = 1.5;
    for (let i = gridMin; i <= gridMax; i += gridStep) {
      const x = this.centerX + i * this.scale;
      const y = this.centerY - i * this.scale;
      
      // Vertical lines
      if (x >= 0 && x <= this.canvasWidth) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.canvasHeight);
        this.ctx.stroke();
      }
      
      // Horizontal lines
      if (y >= 0 && y <= this.canvasHeight) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvasWidth, y);
        this.ctx.stroke();
      }
    }
    
    // Draw axes with labels
    this.ctx.strokeStyle = '#999';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.centerY);
    this.ctx.lineTo(this.canvasWidth, this.centerY);
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, 0);
    this.ctx.lineTo(this.centerX, this.canvasHeight);
    this.ctx.stroke();
    
    // Add axis labels (coordinates)
    this.ctx.fillStyle = '#666';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    
    // X-axis labels - use dynamic grid
    for (let i = gridMin; i <= gridMax; i += gridStep) {
      if (i !== 0) {
        const x = this.centerX + i * this.scale;
        if (x >= 0 && x <= this.canvasWidth) {
          this.ctx.fillText(i, x, this.centerY + 5);
        }
      }
    }
    
    // Y-axis labels - use dynamic grid
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';
    for (let i = gridMin; i <= gridMax; i += gridStep) {
      if (i !== 0) {
        const y = this.centerY - i * this.scale;
        if (y >= 0 && y <= this.canvasHeight) {
          this.ctx.fillText(i, this.centerX - 8, y);
        }
      }
    }
    
    // Origin label
    this.ctx.fillStyle = '#999';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText('0', this.centerX - 8, this.centerY + 5);
    
    // Execute commands with turtle state
    x = 0;
    y = 0;
    heading = 0;
    let penIsDown = true; // Start with pen DOWN, like Python turtle
    let penColor = 'black';
    
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
      } else if (cmd.type === 'circle') {
        const radius = cmd.arg1;
        // In real turtle graphics:
        // - Turtle is ON the circumference at its current position
        // - Circle center is one radius perpendicular LEFT of turtle's heading
        // - After a full circle (360°), turtle returns to starting position
        
        // Center is perpendicular left from heading
        const leftHeading = heading + 90;
        const centerX = x + radius * Math.cos(leftHeading * Math.PI / 180);
        const centerY = y + radius * Math.sin(leftHeading * Math.PI / 180);
        
        this.drawCircle(centerX, centerY, radius, heading, penIsDown, penColor);
        // Turtle stays at same position after full circle
      } else if (cmd.type === 'turnleft') {
        heading += cmd.arg1;
      } else if (cmd.type === 'turnright') {
        heading -= cmd.arg1;
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
  
  drawCircle(centerX, centerY, radius, heading, penIsDown, penColor) {
    // Convert heading to radians (turtle heading: 90=up, 0=right)
    const headingRad = heading * Math.PI / 180;
    
    const screenCenterX = this.centerX + centerX * this.scale;
    const screenCenterY = this.centerY - centerY * this.scale;
    const screenRadius = radius * this.scale;
    
    if (penIsDown) {
      this.ctx.strokeStyle = penColor;
      this.ctx.beginPath();
      // Turtle draws circle counterclockwise
      const startAngle = (headingRad + Math.PI / 2) % (Math.PI * 2);
      this.ctx.arc(screenCenterX, screenCenterY, screenRadius, startAngle, startAngle + Math.PI * 2, false);
      this.ctx.stroke();
    }
  }
}

// Initialize app
window.app;
document.addEventListener('DOMContentLoaded', () => {
  window.app = new TurtleArtBuilder();
  app.draw();
});
