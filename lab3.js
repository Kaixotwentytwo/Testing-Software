const canvas = new fabric.Canvas('graph');

const nodeColor = '#16425f'; // Blue
const nodeStroke = '#20515e'; // Blue
const errorColor = '#700000'; // Red
const errorStroke = '#911414'; // Red
const successColor = '#0e6d0e'; // Green
const successStroke = '#28a745'; // Green

const maxNewNodes = 5; // максимальное количество новых узлов
let nodesCounter = 0; // счетчик узлов

canvas.selection = false; 
canvas.discardActiveObject(); 

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
        const line = new fabric.Line([this.x, this.y, graphNode.getX, graphNode.getY], {
            stroke: '#7f8c8d',
            strokeWidth: 3,
            selectable: false,
            evented: false,
        });

        this.element.on('moving', () => {
            line.set({ x1: this.element.left, y1: this.element.top });
            canvas.renderAll();
        });

        graphNode.element.on('moving', () => {
            line.set({ x2: graphNode.element.left, y2: graphNode.element.top });
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
    const powerSuccess = new GraphNode(3.5*M, 5*M, "Powering Number", 17, successColor, successStroke, 32, []).draw();
    const powerError = new GraphNode(1.5*M, 5*M, "Invalid String", 16, errorColor, errorStroke, 32, []).draw();
    
    const power = new GraphNode(2.5*M, 4*M, "Number with Power?", 16, null, null, 32, [powerSuccess, powerError]).draw();
    const nan2success = new GraphNode(1*M, 3*M, "Pure Number!", 17, successColor, successStroke, 32, []).draw();
    const nan2error = new GraphNode(2.5*M, 3*M, "String", 20, '#522a5a', '#73467c', 32, [power]).draw();
    
    const nan1success = new GraphNode(5*M, 3*M, "Yes", 20, successColor, successStroke, 32, []).draw();
    const nan1error = new GraphNode(3.5*M, 3*M, "No", 20, errorColor, errorStroke, 32, []).draw();
    
    const nan1Node = new GraphNode(4*M, 2*M, "Is M a Number?", 18, null, null, 32, [nan1error, nan1success]).draw();
    const nan2Node = new GraphNode(2*M, 2*M, "Is N a Number?", 18, null, null, 32, [nan2error, nan2success]).draw();
    
    new GraphNode(3*M, 1*M, "UserInputTest", 20, '#296966', '#3f5554', 32, [nan1Node, nan2Node]).draw();
}
InitGraph();

{
    document.getElementById('clearCanvas').addEventListener('click', () => {canvas.clear(); nodesCounter = 0;});
    document.getElementById('initCanvas').addEventListener('click', InitGraph);
    document.getElementById('createNode').addEventListener('click', ()=>{
        nodesCounter++>=maxNewNodes?null : new GraphNode(50+Math.random()*70, 50+Math.random()*70, `${nodesCounter}`).draw();});
}