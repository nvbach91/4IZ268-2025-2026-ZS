let currentImageObject = new Image();

export const textPositions = {
    top: { x: 0, y: 0, isDragging: false },
    bottom: { x: 0, y: 0, isDragging: false }
};

export function loadImageForCanvas(url, canvas, drawCallback) {
    currentImageObject.crossOrigin = "anonymous"; 
    currentImageObject.src = url;

    currentImageObject.onload = () => {
        canvas.width = currentImageObject.width;
        canvas.height = currentImageObject.height;
        
        textPositions.top.x = canvas.width / 2;
        textPositions.top.y = 40; 
        textPositions.top.isDragging = false;

        textPositions.bottom.x = canvas.width / 2;
        textPositions.bottom.y = canvas.height - 100; 
        textPositions.bottom.isDragging = false;

        drawCallback();
    };
}

function drawTextLine(ctx, text, x, y, maxWidth, lineHeight) {
    const lines = text.split('\n');
    lines.forEach((line, index) => {
        const currentY = y + (index * lineHeight);
        ctx.strokeText(line, x, currentY, maxWidth);
        ctx.fillText(line, x, currentY, maxWidth);
    });
}

export function drawMeme(canvas, ctx, topText, bottomText, customPositions = null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentImageObject.src) {
        ctx.drawImage(currentImageObject, 0, 0);
    }

    if (customPositions) {
        textPositions.top.x = customPositions.top.x;
        textPositions.top.y = customPositions.top.y;
        textPositions.bottom.x = customPositions.bottom.x;
        textPositions.bottom.y = customPositions.bottom.y;
    }

    const fontSize = canvas.width / 10; 
    const lineHeight = fontSize * 1.1; 
    
    ctx.font = `${fontSize}px Impact, sans-serif`;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = fontSize / 15;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top'; 

    if (topText) {
        drawTextLine(ctx, topText, textPositions.top.x, textPositions.top.y, canvas.width - 20, lineHeight);
    }

    if (bottomText) {
        drawTextLine(ctx, bottomText, textPositions.bottom.x, textPositions.bottom.y, canvas.width - 20, lineHeight);
    }
}

export function downloadMeme(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function isMouseOverText(mouseX, mouseY, textX, textY, textContent, ctx, canvasWidth) {
    if (!textContent) return false;

    const fontSize = canvasWidth / 10;
    const lineHeight = fontSize * 1.1;
    const lines = textContent.split('\n');
    
    let maxWidth = 0;
    lines.forEach(line => {
        const width = ctx.measureText(line).width;
        if (width > maxWidth) maxWidth = width;
    });

    const totalHeight = lines.length * lineHeight;

    const left = textX - (maxWidth / 2);
    const right = textX + (maxWidth / 2);
    const top = textY;
    const bottom = textY + totalHeight;

    const padding = 20;

    return (
        mouseX >= left - padding &&
        mouseX <= right + padding &&
        mouseY >= top - padding &&
        mouseY <= bottom + padding
    );
}

export function initCanvasDrag(canvas, ctx, getTextsCallback, redrawCallback) {
    let startX, startY;

    function getMousePos(evt) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (evt.clientX - rect.left) * scaleX,
            y: (evt.clientY - rect.top) * scaleY
        };
    }

    canvas.addEventListener('mousedown', (e) => {
        e.preventDefault(); 
        const pos = getMousePos(e);
        const { topText, bottomText } = getTextsCallback();

        if (isMouseOverText(pos.x, pos.y, textPositions.top.x, textPositions.top.y, topText, ctx, canvas.width)) {
            textPositions.top.isDragging = true;
        } 
        else if (isMouseOverText(pos.x, pos.y, textPositions.bottom.x, textPositions.bottom.y, bottomText, ctx, canvas.width)) {
            textPositions.bottom.isDragging = true;
        }

        startX = pos.x;
        startY = pos.y;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!textPositions.top.isDragging && !textPositions.bottom.isDragging) return;
        
        e.preventDefault();
        const pos = getMousePos(e);

        const dx = pos.x - startX;
        const dy = pos.y - startY;

        if (textPositions.top.isDragging) {
            textPositions.top.x += dx;
            textPositions.top.y += dy;
        } else if (textPositions.bottom.isDragging) {
            textPositions.bottom.x += dx;
            textPositions.bottom.y += dy;
        }

        redrawCallback(); 

        startX = pos.x;
        startY = pos.y;
    });

    const stopDragging = () => {
        textPositions.top.isDragging = false;
        textPositions.bottom.isDragging = false;
    };

    canvas.addEventListener('mouseup', stopDragging);
    canvas.addEventListener('mouseout', stopDragging);
}