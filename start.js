const canvas = new fabric.Canvas('tshirt-canvas', {
  preserveObjectStacking: true,
  selection: true
});

let shirtObject = null;

function loadShirt() {
  fabric.Image.fromURL('tshirt.png', img => {

    const maxWidth = 600;  
    const maxHeight = 1000; 

    const scale = Math.min(
      maxWidth / img.width,
      maxHeight / img.height
    );

    img.scale(scale);

    img.set({
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      customType: 'shirt'
    });

    shirtObject = img;
    canvas.insertAt(img, 0);
    canvas.renderAll();
  });
}

window.onload = loadShirt;

const brush = new fabric.PencilBrush(canvas);

document.getElementById('tool-draw').onclick = () => {
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush = brush;
};

document.getElementById('tool-select').onclick = () => {
  canvas.isDrawingMode = false;
};

document.getElementById('tool-erase').onclick = () => {
  const eraser = new fabric.PencilBrush(canvas);
  eraser.color = "#ffffff";
  eraser.width = 20;
  canvas.freeDrawingBrush = eraser;
  canvas.isDrawingMode = true;
};

document.getElementById('brush-size').oninput = e => {
  brush.width = parseInt(e.target.value);
};

document.getElementById('color-picker').oninput = e => {
  brush.color = e.target.value;
};

document.getElementById('img-upload').addEventListener('change', function(e){
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(){
    fabric.Image.fromURL(reader.result, img => {
      img.scaleToWidth(200);
      img.set({
        left: canvas.getWidth() / 2 - 100,
        top: canvas.getHeight() / 2 - 100,
        cornerColor: '#1f6feb',
        transparentCorners: false
      });
      canvas.add(img);
      canvas.setActiveObject(img);
    });
  };
  reader.readAsDataURL(file);
});

document.getElementById('add-text').onclick = () => {
  const text = document.getElementById('text-input').value || "نص";
  const obj = new fabric.IText(text, {
    left: canvas.getWidth()/2 - 100,
    top: canvas.getHeight()/2 - 50,
    fontSize: 36,
    fill: "#000",
    cornerColor: '#1f6feb',
    transparentCorners: false
  });
  canvas.add(obj);
  canvas.setActiveObject(obj);
};

document.querySelectorAll('.sticker').forEach(sticker => {
  sticker.addEventListener('click', function () {
    const src = this.src;

    fabric.Image.fromURL(src, img => {
      img.scaleToWidth(120);
      img.set({
        left: canvas.getWidth() / 2 - 60,
        top: canvas.getHeight() / 2 - 60,
        cornerColor: '#1f6feb',
        transparentCorners: false
      });

      canvas.add(img);
      canvas.setActiveObject(img);
    });
  });
});

document.getElementById('delete').onclick = () => {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  if (obj.customType === 'shirt') return;
  canvas.remove(obj);
};

let undoStack = [];
let redoStack = [];

function saveState() {
  undoStack.push(JSON.stringify(canvas.toJSON()));
  redoStack = [];
}

canvas.on('object:added', saveState);
canvas.on('object:modified', saveState);

document.getElementById('undo').onclick = () => {
  if (undoStack.length < 2) return;
  redoStack.push(undoStack.pop());
  const state = undoStack[undoStack.length - 1];
  canvas.loadFromJSON(state, () => canvas.renderAll());
};

document.getElementById('redo').onclick = () => {
  if (!redoStack.length) return;
  const state = redoStack.pop();
  undoStack.push(state);
  canvas.loadFromJSON(state, () => canvas.renderAll());
};

document.getElementById('export-png').onclick = () => {
  canvas.renderAll();
  const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });

  const a = document.createElement('a');
  a.href = dataURL;
  a.download = 'design.png';
  a.click();
};
 document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("tshirt-canvas");
  const confirmBtn = document.getElementById("done");

  confirmBtn.addEventListener("click", function () {
    const dataURL = canvas.toDataURL("image/png");
    localStorage.setItem("tshirtDesign", dataURL);
    window.location.href = "order.html";
  });
});
