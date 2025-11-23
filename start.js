// app.js — محرر تيشيرت باستخدام Fabric.js
(function () {
  // ====== إعداد الـ canvas ======
  const canvasEl = document.getElementById('tshirt-canvas');
  const canvas = new fabric.Canvas(canvasEl, {
    preserveObjectStacking: true,
    selection: true,
    backgroundColor: 'transparent'
  });

  // Device pixel ratio fix for crisp rendering
  function fixHiDPICanvas() {
    const ratio = window.devicePixelRatio || 1;
    const w = canvasEl.width;
    const h = canvasEl.height;
    canvasEl.width = w * ratio;
    canvasEl.height = h * ratio;
    canvasEl.style.width = w + 'px';
    canvasEl.style.height = h + 'px';
    canvas.setWidth(w * ratio);
    canvas.setHeight(h * ratio);
  }
  // fixHiDPICanvas(); // اختياري

  // ====== عناصر الواجهة ======
  const btnSelect = document.getElementById('tool-select');
  const btnDraw = document.getElementById('tool-draw');
  const btnErase = document.getElementById('tool-erase');
  const brushSize = document.getElementById('brush-size');
  const brushLabel = document.getElementById('brush-size-label');
  const colorPicker = document.getElementById('color-picker');
  const uploadInput = document.getElementById('img-upload');
  const addStickerBtn = document.getElementById('add-sticker');
  const stickersContainer = document.getElementById('stickers');
  const textInput = document.getElementById('text-input');
  const fontSelect = document.getElementById('font-select');
  const addTextBtn = document.getElementById('add-text');
  const effectButtons = document.querySelectorAll('.effect');
  const removeEffectsBtn = document.getElementById('remove-effects');
  const undoBtn = document.getElementById('undo');
  const redoBtn = document.getElementById('redo');
  const deleteBtn = document.getElementById('delete');
  const exportPngBtn = document.getElementById('export-png');
  const exportSvgBtn = document.getElementById('export-svg');

  // ====== حالة التطبيق (undo/redo stacks) ======
  const undoStack = [];
  const redoStack = [];
  const STATE_LIMIT = 50;

  function saveState() {
    try {
      const state = canvas.toJSON(['selectable', 'shadow']);
      undoStack.push(JSON.stringify(state));
      if (undoStack.length > STATE_LIMIT) undoStack.shift();
      redoStack.length = 0;
      updateUndoRedoButtons();
    } catch (e) {
      console.warn('saveState error', e);
    }
  }

  function updateUndoRedoButtons() {
    undoBtn.disabled = undoStack.length <= 1;
    redoBtn.disabled = redoStack.length === 0;
  }

  function loadStateFromJSON(jsonStr) {
    canvas.clear();
    canvas.loadFromJSON(jsonStr, () => {
      addTshirtOutlineToCanvas(); // إعادة إضافة الـ outline بعد التحميل
      canvas.renderAll();
    }, function () {});
  }

  function undo() {
    if (undoStack.length <= 1) return;
    const last = undoStack.pop();
    redoStack.push(last);
    const previous = undoStack[undoStack.length - 1];
    if (previous) loadStateFromJSON(previous);
    updateUndoRedoButtons();
  }

  function redo() {
    if (redoStack.length === 0) return;
    const state = redoStack.pop();
    undoStack.push(state);
    loadStateFromJSON(state);
    updateUndoRedoButtons();
  }

  // ====== إضافة صورة التيشيرت (outline) ======
  const outlineImgEl = document.getElementById('tshirt-outline');
  let outlineObject = null;

  function addTshirtOutlineToCanvas() {
    if (!outlineImgEl) return;
    const src = outlineImgEl.src;
    if (!src) return;

    fabric.Image.fromURL(src, { crossOrigin: 'anonymous' }, function(img) {
      if (outlineObject) canvas.remove(outlineObject);
      outlineObject = img;
      img.selectable = false;
      img.evented = false;
      img.opacity = 0.25;

      // ملاءمة canvas
      img.scaleToWidth(canvas.getWidth());
      img.scaleToHeight(canvas.getHeight());

      // توسيط الصورة
      img.left = 0;
      img.top = 0;

      canvas.insertAt(img, 0, false);
      canvas.requestRenderAll();
      saveState();
    });
  }

  // التأكد من ظهور الـ outline بعد تحميل الصورة
  window.addEventListener('load', () => {
    addTshirtOutlineToCanvas();
  });

  // ====== إعداد الرسم / الممحاة ======
  const pencilBrush = new fabric.PencilBrush(canvas);
  pencilBrush.width = parseInt(brushSize.value, 10) || 6;
  pencilBrush.color = colorPicker.value || '#000';

  function enableDrawMode() {
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = pencilBrush;
  }

  function enableEraserMode() {
    try {
      const Eraser = fabric.EraserBrush;
      if (Eraser) {
        const eraser = new Eraser(canvas);
        eraser.width = Math.max(10, parseInt(brushSize.value, 10) || 20);
        canvas.freeDrawingBrush = eraser;
        canvas.isDrawingMode = true;
        return;
      }
    } catch (e) {}
    const whiteBrush = new fabric.PencilBrush(canvas);
    whiteBrush.width = Math.max(10, parseInt(brushSize.value, 10) || 20);
    whiteBrush.color = '#ffffff';
    canvas.freeDrawingBrush = whiteBrush;
    canvas.isDrawingMode = true;
  }

  function disableDrawing() {
    canvas.isDrawingMode = false;
  }

  btnSelect.addEventListener('click', () => {
    disableDrawing();
    canvas.selection = true;
    canvas.forEachObject((o) => o.selectable = true);
  });

  btnDraw.addEventListener('click', () => {
    pencilBrush.width = parseInt(brushSize.value, 10) || 6;
    pencilBrush.color = colorPicker.value || '#000';
    enableDrawMode();
  });

  btnErase.addEventListener('click', () => enableEraserMode());

  brushSize.addEventListener('input', (e) => {
    const v = e.target.value;
    brushLabel.textContent = v;
    pencilBrush.width = parseInt(v, 10);
    if (canvas.freeDrawingBrush && canvas.freeDrawingBrush.set) {
      try { canvas.freeDrawingBrush.width = parseInt(v, 10); } catch (e) {}
    }
  });

  colorPicker.addEventListener('input', (e) => {
    pencilBrush.color = e.target.value;
    const active = canvas.getActiveObject();
    if (active && (active.type === 'i-text' || active.type === 'textbox' || active.type === 'text')) {
      active.set('fill', e.target.value);
      canvas.requestRenderAll();
      saveState();
    }
  });

  canvas.on('path:created', saveState);

  // ====== رفع صورة من الجهاز ======
  uploadInput.addEventListener('change', function (ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (f) {
      fabric.Image.fromURL(f.target.result, { crossOrigin: 'anonymous' }, function(img) {
        const maxW = canvas.getWidth() * 0.6;
        const maxH = canvas.getHeight() * 0.6;
        img.scaleToWidth(maxW);
        img.set({
          left: canvas.getWidth()/2 - (img.getScaledWidth()/2),
          top: canvas.getHeight()/2 - (img.getScaledHeight()/2),
          cornerStyle: 'circle',
          transparentCorners: false
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
        saveState();
      });
    };
    reader.readAsDataURL(file);
    ev.target.value = '';
  });

  // ====== استيكرز جاهزة ======
  function initStickerThumbnails() {
    if (!stickersContainer) return;
    const thumbs = stickersContainer.querySelectorAll('.sticker-thumb');
    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const src = thumb.getAttribute('data-src') || thumb.src;
        if (!src) return;
        fabric.Image.fromURL(src, { crossOrigin: 'anonymous' }, (img) => {
          img.scaleToWidth(160);
          img.set({
            left: canvas.getWidth()/2 - (img.getScaledWidth()/2),
            top: canvas.getHeight()/2 - (img.getScaledHeight()/2),
            cornerStyle: 'circle',
            hasRotatingPoint: true
          });
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.requestRenderAll();
          saveState();
        });
      });
    });
  }
  initStickerThumbnails();

  addStickerBtn.addEventListener('click', () => {
    const thumbs = Array.from(stickersContainer.querySelectorAll('.sticker-thumb'));
    if (!thumbs.length) return;
    thumbs[Math.floor(Math.random()*thumbs.length)].click();
  });

  // ====== إضافة نص ======
  addTextBtn.addEventListener('click', () => {
    const txt = (textInput.value || 'نص جديد').trim();
    const fontFamily = fontSelect.value || 'Cairo';
    const textObj = new fabric.IText(txt, {
      left: 80,
      top: 80,
      fontFamily: fontFamily,
      fontSize: 42,
      fill: colorPicker.value || '#000',
      editable: true,
      cornerStyle: 'circle'
    });
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.requestRenderAll();
    saveState();
    textInput.value = '';
  });

  // ====== تأثيرات سريعة ======
  function applyEffectToActive(effect) {
    const active = canvas.getActiveObject();
    if (!active) return;

    if (effect === 'shadow') {
      active.set('shadow', active.shadow ? null : new fabric.Shadow({
        color: 'rgba(0,0,0,0.35)',
        blur: 18,
        offsetX: 8,
        offsetY: 8
      }));
      canvas.requestRenderAll(); saveState();
      return;
    }

    if (active.type === 'image' || active instanceof fabric.Image) {
      if (effect === 'blur') {
        const hasBlur = active.filters && active.filters.find(f => f.type==='Blur');
        active.filters = hasBlur ? active.filters.filter(f=>f.type!=='Blur') : (active.filters||[]).concat([new fabric.Image.filters.Blur({ blur:0.5 })]);
        active.applyFilters();
        canvas.requestRenderAll(); saveState(); return;
      }
      if (effect === 'brightness') {
        const hasB = active.filters && active.filters.find(f=>f.type==='Brightness');
        active.filters = hasB ? active.filters.filter(f=>f.type!=='Brightness') : (active.filters||[]).concat([new fabric.Image.filters.Brightness({ brightness:0.15 })]);
        active.applyFilters();
        canvas.requestRenderAll(); saveState(); return;
      }
    } else {
      if (effect==='brightness') active.set('opacity', active.opacity===1?0.85:1);
      if (effect==='blur') active.set('opacity', active.opacity===1?0.7:1);
      canvas.requestRenderAll(); saveState();
    }
  }

  effectButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>applyEffectToActive(btn.getAttribute('data-effect')));
  });

  removeEffectsBtn.addEventListener('click', () => {
    const active = canvas.getActiveObject();
    if (!active) return;
    active.set('shadow', null);
    if (active.type==='image'||active instanceof fabric.Image) { active.filters=[]; try{active.applyFilters()}catch(e){} }
    active.set('opacity',1);
    canvas.requestRenderAll(); saveState();
  });

  // ====== أدوات التحرير ======
  deleteBtn.addEventListener('click', () => {
    const active = canvas.getActiveObject();
    if (active && active!==outlineObject) {
      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      saveState();
    }
  });

  function rotateActive(angleDelta=15) {
    const a = canvas.getActiveObject();
    if (!a) return;
    a.rotate((a.angle||0)+angleDelta);
    canvas.requestRenderAll(); saveState();
  }
  function scaleActive(factor=1.1) {
    const a = canvas.getActiveObject();
    if (!a) return;
    a.scaleX=(a.scaleX||1)*factor;
    a.scaleY=(a.scaleY||1)*factor;
    canvas.requestRenderAll(); saveState();
  }

  // ====== Export ======
  exportPngBtn.addEventListener('click', () => {
    const origBg = canvas.backgroundColor;
    canvas.setBackgroundColor('#ffffff', ()=>{
      const dataURL = canvas.toDataURL({ format:'png', multiplier:1 });
      canvas.setBackgroundColor(origBg, ()=>canvas.requestRenderAll());
      const a=document.createElement('a');
      a.href=dataURL;
      a.download='tshirt-design.png';
      a.click();
    });
  });

  exportSvgBtn.addEventListener('click', () => {
    const svg = canvas.toSVG({ suppressPreamble:false });
    const blob = new Blob([svg], { type:'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download='tshirt-design.svg';
    a.click();
    URL.revokeObjectURL(url);
  });

  // ====== Undo/Redo ======
  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);

  window.addEventListener('keydown', (e)=>{
    if ((e.ctrlKey||e.metaKey)&&e.key==='z'){ e.preventDefault(); undo(); }
    if ((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.shiftKey&&e.key==='Z'))){ e.preventDefault(); redo(); }
    if (e.key==='Delete'||e.key==='Backspace'){
      const active = canvas.getActiveObject();
      if (active && active!==outlineObject){ canvas.remove(active); canvas.requestRenderAll(); saveState(); }
    }
  });

  canvas.on('object:modified', saveState);
  canvas.on('object:added', saveState);
  canvas.on('object:removed', saveState);

  setTimeout(()=>{
    if (undoStack.length===0){ undoStack.push(JSON.stringify(canvas.toJSON(['selectable','shadow']))); updateUndoRedoButtons(); }
  },700);

  canvas.renderAll();

  // كشف للعالم الخارجي
  window.TShirtEditor={canvas,rotateActive,scaleActive,saveState,undo,redo};

})();
