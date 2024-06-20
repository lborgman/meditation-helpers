

/**
 * 
 * @param {*} ctx - ctx canvas
 * @param {number} cX
 * @param {number} cY
 * @param {number} cR 
 * @param {string} color 
 * @param {number} piePart - 0 to 1
 */
export function drawPie(ctx, cX, cY, cR, color, piePart) {
    const fullAngle = Math.PI * 2;
    const startAngle = - fullAngle * 0.25;
    const angle = startAngle + piePart * fullAngle;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cX, cY);
    ctx.arc(cX, cY, cR, startAngle, angle);
    ctx.lineTo(cX, cY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.strokeWidth = "1";
    ctx.beginPath();
    ctx.ellipse(cX, cY, cR, cR, 0, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
}