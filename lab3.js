const canvas = new fabric.Canvas('graph');

const nodeColor = 'hsl(204, 32%, 23%)';
const nodeStroke = 'hsl(193, 49%, 25%)';
const errorColor = 'hsl(0, 50%, 32%)';
const errorStroke = 'hsl(0, 26%, 32%)';
const additionalColor = 'hsl(310,35%,25%)';
const additionalStroke = 'hsl(310,35%,35%)';
const successColor = 'hsl(120, 47%, 24%)';
const successStroke = 'hsl(134, 21%, 41%)';

const maxNewNodes = 8; // максимальное количество новых узлов
let nodesCounter = 0; // счетчик узлов

canvas.selection = false; 
canvas.discardActiveObject(); 

class ArrowLine extends fabric.Line {
  static type = 'arrowLine';

  // Добавляем конструктор, чтобы можно было передавать радиус ноды
  constructor(points, options) {
    super(points, options);
    // Сохраняем радиус ноды (по умолчанию 30, если не передан)
    this.nodeRadius = options.nodeRadius || 32;
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
            originY: 'center',
            textAlign: 'center',
            fontFamily: 'sans-serif',
        });

        const nodeGroup = new fabric.Group([circle, text], {
            left: this.x,
            top: this.y,
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: true,
            selectable: true,
            fontFamily: 'sans-serif',
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
            nodeRadius: graphNode.nodeSize,
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

    checkPathTo(targetNode, visited = new Set(), path=[]) {
        // стартовая нода посещена
        visited.add(this);
        path.push(this);
        // если мы уже в целевой ноде, то путь найден
        if (this === targetNode) return path;

        // рекурсия по соседним нодам
        for (let nextNode of this.relation) {
            if (nextNode instanceof GraphNode && !visited.has(nextNode)) {
                const actualPath = nextNode.checkPathTo(targetNode, visited, [...path]);
                if (actualPath) { return actualPath; }
            }
        }
        return null;
    }
}

// рисование графа
var InitGraph = () => 
{
    canvas.clear();

    const M = 100; // множитель координат
    var randomSize = (size, delta) => size + Math.random()*delta;

    const powerSuccess = new GraphNode(3*M, 4.5*M, "Возведение\nв степень", 17, successColor, successStroke, 56, []).draw();
    const powerError = new GraphNode(1.5*M, 4.5*M, "Неверная\nстрока", 16, errorColor, errorStroke, 48, []).draw();
    
    const nan2success = new GraphNode(0.75*M, 3*M, "Успех", 20, successColor, successStroke, 36, []).draw();
    const nan2error = new GraphNode(2.25*M, 3*M, 'Это строка.\nИмеется ли\nсимвол ^ ?', 15, additionalColor, additionalStroke, 56, [powerSuccess, powerError]).draw();
    
    const nan1success = new GraphNode(5.25*M, 2.75*M, "Успех", 20, successColor, successStroke, 36, []).draw();
    const nan1error = new GraphNode(3.75*M, 2.75*M, "Ошибка", 18, errorColor, errorStroke, 40, []).draw();
    
    const nan1Node = new GraphNode(4.5*M, 1.5*M, "M - число?", 19, null, null, 56, [nan1error, nan1success]).draw();
    const nan2Node = new GraphNode(1.5*M, 1.5*M, "N - число?", 19, null, null, 56, [nan2error, nan2success]).draw();
}

let newNodes = [];
let singleOutputMode = true;
// если true, то графы рисуются так,
// чтобы у них всегда был лишь один выход,
// иначе, может быть несколько
let markNodesOnce = true;
// ноды могут создавать связи в обратную сторону тоже
// и с любыми связанными нодами
{
    //checkboxes
    document.getElementById('singleOutput').addEventListener('change', ()=>{singleOutputMode = !singleOutputMode;});
    document.getElementById('markNodesOnce').addEventListener('change', ()=>{markNodesOnce = !markNodesOnce;});

    // buttons
    document.querySelectorAll('.clearCanvas').forEach(item=>item.addEventListener('click', () => {
        canvas.clear();
        newNodes = [];
        nodesCounter = 0;
        document.querySelectorAll('.hideable').forEach(e=>e.style.display = 'none');
        document.querySelectorAll('.unhideable').forEach(e=>e.style.display = 'block');
    }));
    document.getElementById('initCanvas').addEventListener('click', ()=>{
        InitGraph();
        newNodes = [];
        nodesCounter = 0;
        document.querySelectorAll('.hideable').forEach(e=>e.style.display = 'block');
        document.querySelectorAll('.unhideable').forEach(e=>e.style.display = 'none');
    });
    document.getElementById('createNode').addEventListener('click', ()=>{
        nodesCounter++>=maxNewNodes?null :
        newNodes.push(new GraphNode(100+Math.random()*400, 100+Math.random()*400, `${nodesCounter}`, 28, `hsl(${Math.random() * 360}, 25%, 50%)`).draw());
    });
    document.getElementById('createLine').addEventListener('click', ()=>{
        document.getElementById('noEdge')?.classList.add('hide');
        if (newNodes.length < 2) {
            document.getElementById('noEdge')?.classList.remove('hide');
            return;
        };
        let unmarkedNodes = markNodesOnce ? newNodes.filter(node => !node.marked)
        : singleOutputMode ? [...newNodes].filter(node => node != null && node.relation.length == 0) : [...newNodes];

        if(unmarkedNodes.length <= 1) return;
        let node1 = unmarkedNodes[Math.floor(Math.random() * unmarkedNodes.length)];
        const validNode2 = unmarkedNodes.filter(node => node !== node1);
        let node2 = validNode2[Math.floor(Math.random() * validNode2.length)];
        if (node2 === null || node1 === null) return;

        node1.line(node2);
        node1.relation.push(node2);
        node1.relation = Array.from(new Set([...node1.relation]));
        singleOutputMode ? ((node1)?node1.marked = true:null) : ((node2)?node2.marked = true:null);
        node1.relation = node1.relation.filter(item => item != null);
    });
    document.getElementById('checkPathButton').addEventListener('click', ()=>{
        const noVertexError = document.getElementById('noVertex');
        noVertexError.classList.add('hide');
        const noPathError = document.getElementById('noPath');
        noPathError.classList.add('hide');
        const success = document.getElementById('success');
        success.classList.add('hide');
        const realPath = document.getElementById('realPath');
        realPath.classList.add('hide');
        const noEdge = document.getElementById('noEdge');
        noEdge.classList.add('hide');

        let startNode = +document.getElementById('startNodeInput').value??1;
        let endNode = +document.getElementById('endNodeInput').value??2;
        if (startNode > 8) startNode=8;
        if (endNode > 8) endNode=8;
        if (startNode < 1) startNode=1;
        if (endNode < 1) endNode=1;
        if (newNodes[startNode-1] && newNodes[endNode-1]) {
            const local_path = newNodes[startNode-1].checkPathTo(newNodes[endNode-1]);
            if (local_path!=null && local_path?.length>0) {
                success?.classList.remove('hide'); realPath?.classList.remove('hide');
                realPath.innerHTML = `<v>${local_path.map(item=>item.label).join('<w> ⇾ </w>')}</v>`;
            }
            else {noPathError?.classList.remove('hide');}
        }
        else {noVertexError?.classList.remove('hide')}
    });
}

InitGraph();
