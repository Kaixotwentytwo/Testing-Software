const canvas = new fabric.Canvas('graph');
const nodeColor = '#16425f'; // Blue
const nodeStroke = '#20515e'; // Blue
const errorColor = '#700000'; // Red
const errorStroke = '#911414'; // Red
const successColor = '#0e6d0e'; // Green
const successStroke = '#28a745'; // Green

canvas.selection = false; 
canvas.discardActiveObject(); 

    // функция обрабатывающая ввод пользователя
    // function userInputsTest() {
    //      // nan
    //     if (isNaN(Number(maxModuleBlock?.value))) {
    //         if (value.indexOf('^') !== -1) {
    //             // action
    //         } else {
    //             // ошибка
    //         }
    //     } else 
    //         // success 
    //
    //     let valueMax = maxAmountBlock?.value;
    //     if (isNaN(Number(maxAmountBlock?.value))) {
    //         // error
    //     } else 
    //         // success
    // }

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
            // selectable: false,
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

(()=>{
    function spawnNode(node, label, color = nodeColor, stroke = nodeStroke) {
        const radius = 32;

        const circle = new fabric.Circle({
            radius: radius,
            fill: color,
            stroke: stroke,
            strokeWidth: 2,
            originX: 'center',
            originY: 'center',
            selectable: false,
            hasControls: false,
            hasBorders: false,
        });

        const text = new fabric.Text(label, {
            fontSize: 20,
            fill: '#fff',
            originX: 'center',
            originY: 'center'
        });

        const nodeGroup = new fabric.Group([circle, text], {
            left: node.x,
            top: node.y,
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: true,
            selectable: false,
        });

        canvas.add(nodeGroup);
        return nodeGroup;
    }

    function spawnEdge(node1, node2) {
        let local_x1; let local_y1; let local_x2; let local_y2;
        if (node1 instanceof GraphNode && node2 instanceof GraphNode) 
            {local_x1 = node1.getX; local_y1 = node1.getY; local_x2 = node2.getX; local_y2 = node2.getY;}
        else {local_x1 = node1.x; local_y1 = node1.y; local_x2 = node2.x; local_y2 = node2.y;}

        const line = new fabric.Line([local_x1, local_y1, local_x2, local_y2    ], {
            stroke: '#7f8c8d',
            strokeWidth: 6,
            selectable: false,
            evented: false,
        });

        canvas.add(line);
        canvas.sendObjectToBack(line); 
        return line;
    }

    // рисование графа
    {
        const M = 100; // множитель координат
        // const entrance = { x: 3*M, y: 1*M };
        const entranceNode = new GraphNode(3*M, 1*M, "UserInputTest", 20, null, null, 32, []).draw();
        const exitNode = new GraphNode(5*M, 1*M, "ExitNode", 20, null, null, 32, [entranceNode]).draw();
        
        // const nan1 = { x: 2*M, y: 2*M };
        // const nan11 = { x: 1*M, y: 3*M };
        // const nan12 = { x: 2.5*M, y: 3*M };

        // const power = { x: 2.5*M, y: 4*M };
        // const power1 = { x: 1.5*M, y: 5*M };
        // const power2 = { x: 3.5*M, y: 5*M };
        
        // const nan2 = { x: 4*M, y: 2*M };
        // const nan21 = { x: 3.5*M, y: 3*M };
        // const nan22 = { x: 5*M, y: 3*M };

        // // вершины графа
        // spawnEdge(entrance, nan1);
        // spawnEdge(entrance, nan2);
        // spawnEdge(nan1, nan11);
        // spawnEdge(nan1, nan12);
        // spawnEdge(nan12, power);
        // spawnEdge(power, power1);
        // spawnEdge(power, power2);
        // spawnEdge(nan2, nan21);
        // spawnEdge(nan2, nan22);

        // // узлы графа
        // spawnNode(entrance, "userInputsTest");
        // spawnNode(nan1, "check M");
        // spawnNode(nan11, "error", errorColor, errorStroke);
        // spawnNode(nan12, "success", successColor, successStroke);
        // spawnNode(nan2, "check N");
        // spawnNode(nan21, "error", errorColor, errorStroke);
        // spawnNode(nan22, "success", successColor, successStroke);
        // spawnNode(power, "powerTest");
        // spawnNode(power1, "success", successColor, successStroke);
        // spawnNode(power2, "no power", errorColor, errorStroke);

        // canvas.renderAll();
    }
})();