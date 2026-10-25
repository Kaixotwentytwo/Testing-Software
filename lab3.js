const canvas = new fabric.Canvas('graph');

const nodeColor = '#16425f'; // Blue
const nodeStroke = '#20515e'; // Blue
const errorColor = '#700000'; // Red
const errorStroke = '#911414'; // Red
const successColor = '#0e6d0e'; // Green
const successStroke = '#28a745'; // Green

const maxNewNodes = 6; // максимальное количество новых узлов
let nodesCounter = 0; // счетчик узлов
canvas.selection = false; 
canvas.discardActiveObject(); 

class ArrowLine extends fabric.Line {
  static type = 'arrowLine';

  // Добавляем конструктор, чтобы можно было передавать радиус ноды
  constructor(points, options) {
    super(points, options);
    // Сохраняем радиус ноды (по умолчанию 30, если не передан)
    this.nodeRadius = options.nodeRadius || 30;
  }

  _render(ctx) {
    // 1. Рисуем саму линию
    super._render(ctx);

    if (this.width === 0 && this.height === 0) return;

    ctx.save();

    // 2. Вычисляем вектор линии и угол наклона
    const xDiff = this.x2 - this.x1;
    const yDiff = this.y2 - this.y1;
    const angle = Math.atan2(yDiff, xDiff);

    // 3. Вычисляем точку на границе ноды (смещаемся назад от x2, y2 на величину радиуса)
    // В локальных координатах центра линии (xDiff / 2, yDiff / 2)
    const arrowX = (xDiff / 2) - Math.cos(angle) * this.nodeRadius;
    const arrowY = (yDiff / 2) - Math.sin(angle) * this.nodeRadius;

    // 4. Переносим контекст в точку на границе ноды и поворачиваем
    ctx.translate(arrowX, arrowY);
    ctx.rotate(angle);

    // 5. Рисуем стрелку (теперь она будет упираться аккурат в край ноды)
    ctx.fillStyle = this.stroke;
    
    const arrowLength = 15; // Длина стрелки
    const arrowWidth = 12;  // Ширина стрелки (сделал чуть шире для жирных нод)

    ctx.beginPath();
    ctx.moveTo(0, 0); // Острие стрелки касается края круга
    ctx.lineTo(-arrowLength, -arrowWidth / 2);
    ctx.lineTo(-arrowLength, arrowWidth / 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
fabric.classRegistry.setClass(ArrowLine);

class GraphNode {
    marked = false;
    x = 100;
    y = 100;

    constructor(
        x=100, 
        y=100, 
        label="A",
        textSize=16, 
        color = nodeColor, 
        stroke = nodeStroke,
        nodeSize = 32, 
        relation=[]) 
    {
        this.x = x;
        this.y = y;
        this.label = label;
        this.textSize = textSize;
        this.color = color;
        this.stroke = stroke;
        this.nodeSize = nodeSize;
        this.relation = relation;
        this.element = null;
    }

    get getX() {return this.x}
    get getY() {return this.y}

    draw() {
        const circle = new fabric.Circle({
            radius: this.nodeSize,
            fill: this.color??nodeColor,
            stroke: this.stroke??nodeStroke,
            strokeWidth: 2,
            originX: 'center',
            originY: 'center',
            selectable: false,
            hasControls: false,
            hasBorders: false,
        });

        const text = new fabric.Text(this.label, {
            fontSize: this.textSize??16,
            fill: '#fff',
            originX: 'center',
            originY: 'center'
        });

        const nodeGroup = new fabric.Group([circle, text], {
            left: this.x,
            top: this.y,
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: true,
            selectable: true,
        });

        this.element = nodeGroup;
        canvas.add(nodeGroup);

        if (this.relation.length > 0) {
            this.relation.forEach((rel) => {
                if (rel instanceof GraphNode && rel.marked === false) {
                    this.line(rel);
                    rel.marked = true;
                }
            });
        }

        canvas.renderAll();
        return this;
    }

    line(graphNode) {
        const start = this.element.getCenterPoint();
        const end = graphNode?.element.getCenterPoint();

        const line = new ArrowLine([start?.x, start?.y, end?.x, end?.y], {
            stroke: '#7f8c8d',
            strokeWidth: 3,
            selectable: false,
            evented: false,
            nodeRadius: this.nodeSize,
        });

        this.element.on('moving', () => {
            line.set({ x1: this.element.left, y1: this.element.top });
            canvas.renderAll();
        });

        graphNode?.element.on('moving', () => {
            line.set({ x2: graphNode?.element.left, y2: graphNode?.element.top });
            canvas.renderAll();
        });

        canvas.add(line);
        canvas.sendObjectToBack(line);
        canvas.renderAll();
        return line;
    }
}

// рисование графа
var InitGraph = () => 
{
    canvas.clear();

    const M = 100; // множитель координат
    const local_nodeSize = 32;
    var randomSize = (delta) => local_nodeSize + Math.random()*delta;
    const powerSuccess = new GraphNode(3.5*M, 5*M, "Powering Number", 17, successColor, successStroke, local_nodeSize, []).draw();
    const powerError = new GraphNode(1.5*M, 5*M, "Invalid String", 16, errorColor, errorStroke, local_nodeSize, []).draw();
    
    const power = new GraphNode(2.5*M, 4*M, "Number with Power?", 16, null, null, local_nodeSize, [powerSuccess, powerError]).draw();
    const nan2success = new GraphNode(1*M, 3*M, "Pure Number!", 17, successColor, successStroke, local_nodeSize, []).draw();
    const nan2error = new GraphNode(2.5*M, 3*M, "String", 20, '#522a5a', '#73467c', local_nodeSize, [power]).draw();
    
    const nan1success = new GraphNode(5*M, 3*M, "Yes", 20, successColor, successStroke, local_nodeSize, []).draw();
    const nan1error = new GraphNode(3.5*M, 3*M, "No", 20, errorColor, errorStroke, local_nodeSize, []).draw();
    
    const nan1Node = new GraphNode(4*M, 2*M, "Is M a Number?", 18, null, null, local_nodeSize, [nan1error, nan1success]).draw();
    const nan2Node = new GraphNode(2*M, 2*M, "Is N a Number?", 18, null, null, local_nodeSize, [nan2error, nan2success]).draw();
    
    const nodeEntrance = new GraphNode(3*M, 1*M, "UserInputTest", 20, '#296966', '#3f5554', local_nodeSize, [nan1Node, nan2Node]).draw();
}

let newNodes = [];
let signleOutputMode = true;
// если true, то графы рисуются так,
// чтобы у них всегда был лишь один выход,
// иначе, может быть несколько
{
    document.getElementById('clearCanvas').addEventListener('click', () => {canvas.clear(); newNodes = []; nodesCounter = 0;});
    document.getElementById('initCanvas').addEventListener('click', ()=>{InitGraph(); newNodes = []; nodesCounter = 0;});
    document.getElementById('createNode').addEventListener('click', ()=>{
        nodesCounter++>=maxNewNodes?null :
        newNodes.push(new GraphNode(50+Math.random()*70, 50+Math.random()*70, `${nodesCounter}`, null, `hsl(${Math.random() * 360}, 25%, 50%)`).draw());
    });
    document.getElementById('createLine').addEventListener('click', ()=>{
        if (newNodes.length < 2) return;

        const unmarkedNodes = newNodes.filter(node => !node.marked);
        if(unmarkedNodes.length < 1) return;
        let node1 = unmarkedNodes[Math.floor(Math.random() * unmarkedNodes.length)];
        const validNode2 = unmarkedNodes.filter(node => node !== node1);
        let node2 = validNode2[Math.floor(Math.random() * validNode2.length)];
        if (node2 === null || node1 === null) return;
        node1.line(node2);
        node1.relation.push(node2);
        signleOutputMode ? ((node1)?node1.marked = true:null) : ((node2)?node2.marked = true:null);
        node1.relation = node1.relation.filter(item => item !== undefined);
    });
}

InitGraph();