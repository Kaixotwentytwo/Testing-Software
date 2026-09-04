// ограничения
let n_current = 1000; // кол-во чисел
let module_current = 10**9; // максимальный модуль числа
var extended = document.getElementById('extendedInfo')?.checked??false;
document.getElementById('extendedInfo')?.addEventListener('change', (el) => {
    extended = document.getElementById('extendedInfo')?.checked??false;
    // if (extended) {document.querySelectorAll('.extended').forEach(element=>{element.style.display = 'inline';})}
    // else {document.querySelectorAll('.extended').forEach(element=>{element.style.display = 'none';})}
    if (extended) {document.querySelectorAll('.extended').forEach(element=>{element.setAttribute('shown','')})}
    else {document.querySelectorAll('.extended').forEach(element=>{element.removeAttribute('shown')})}
});

// получение данных с блока
let inputBlock = document.querySelector('input#lab1_input');

// вычисление при вводе значений
inputBlock?.addEventListener('change', () => {userInputsTest(); calculateSort(module_current, n_current); userInputsTest();});

const unitTestButton = document.getElementById('button_1');
const maxModuleBlock = document.getElementById('mmax');
const maxAmountBlock = document.getElementById('nmax');
document.getElementById('test')?.addEventListener('click', () => {userInputsTest(); calculateSort(module_current, n_current); userInputsTest();});

function userInputsTest() {
    let value = maxModuleBlock?.value;
    if (isNaN(Number(maxModuleBlock?.value))) {
        // if there's ^ or smth
        if (value.indexOf('^') !== -1) {
            let index = value.indexOf('^');
            let left = value.slice(0, index);
            let right = value.slice(index+1);
            module_current = (+left)**(+right);
        } else {
            // error
            let result = document.getElementById('result1'); result.innerHTML='';
            addText(result, `ERROR: Значению "Максимальный модуль числа" необходимо передать число (либо степень в виде 10^3) (Передано: ${value})`, colors.darkTheme.error)
        }
    } else {module_current = +maxModuleBlock?.value;}

    let valueMax = maxAmountBlock?.value;
    // if string of smth
    if (isNaN(Number(maxAmountBlock?.value))) {
        let result = document.getElementById('result1'); result.innerHTML='';
        addText(result, `ERROR: Ожидалось число (Передано: ${valueMax})`, colors.darkTheme.error)
    } else {
        n_current = valueMax;
    }

}

function calculateSort(module, amount) {
    // получение массива. разделение пробелом
    extended = document.getElementById('extendedInfo')?.checked??false;
    let inputBlockData = inputBlock?.value?.trim().replaceAll(',',' ').replaceAll('.',' ').replaceAll('-','').split(' ');

    // Находим первый элемент, который нарушает хотя бы одно условие
    inputBlockData = inputBlockData.filter(item => item != '').map(item => +item);
    const failureItem = inputBlockData.find(item => item > module || isNaN(Number(item)));
    // var bigFailure = failureItem !== undefined && failureItem < module;
    var bigFailure = failureItem > module;
    var typeFailure = failureItem !== undefined && isNaN(Number(failureItem));

    // если больше 1000 цифр или найдено слишком большое число
    if ((inputBlockData?.length <= amount ? inputBlockData?.length : 0)
        && !bigFailure && !typeFailure) {

        // вывод результата
        if (document.getElementById('result1')!==null) {
            let result = document.getElementById('result1'); result.innerHTML='';

            const embedded = inputBlockData ? [...inputBlockData].sort((a, b) => a - b) : [];
            let inputBlockData2 = inputBlock?.value?.trim().replaceAll(',',' ').replaceAll('.',' ').replaceAll('-','').split(' ');
            inputBlockData2 = inputBlockData2.filter(item => item != '').map(item => +item);
            const swaps = bubbleSort(inputBlockData2??[], false);
            const bubble = bubbleSort(inputBlockData??[], true);

            addText(result, 'Исправное выполнение.', colors.darkTheme.success);
            addText(result, '\nВвод пользователя: ', colors.darkTheme.standart, true);
            addText(result, inputBlock?.value.trim()??'', colors.darkTheme.warn, true);
            addText(result, '\nКол-во перестановок: ');
            addText(result, swaps, colors.darkTheme.blue);
            addText(result, '\nСортировка пузырьком: ', 'white', false);
            addText(result, bubble.join(' '), colors.darkTheme.blue, false);
            addText(result, '\nВстроенный метод сортировки: ', 'white', true);
            addText(result, embedded.join(' '), colors.darkTheme.blueD, true);
            addText(result, '\nСрабатывают ли сортировки идентично? ', 'white', true);
            addText(result, (arraysEqual(embedded, bubble) ? 'Да!' : "Нет :("),
            (arraysEqual(embedded, bubble) ? colors.darkTheme.success : colors.darkTheme.error), true);
        } else {
            console.log('\n');
            console.log('%cEverything is OK', 'color: green;');
            console.log(`User Input: %c${inputBlock?.value.trim()??''}`, 'font-weight: 800; color: blue');
            console.log(`Amount of Swaps: %c${bubbleSort(inputBlockData??'')}`, 'font-weight: 800; color: darkgreen;');
            console.log(`Result Array: %c${bubbleSort(inputBlockData??'', true).join(' ')}`, 'font-weight: 800; color: darkgreen;')
        }
    } else {
        if (bigFailure) console.log(bigFailure)
        // ERROR
        if (document.getElementById('result1')!==null) {
            let result = document.getElementById('result1'); result.innerHTML='';

            if (bigFailure) {addText(result, `ERROR: Найдено слишком большое число (${failureItem})\n`, colors.darkTheme.error)}
            if (typeFailure) {addText(result, `ERROR: Передано не число (${failureItem})\n`, colors.darkTheme.error)}
            if (inputBlockData.length > amount) {addText(result, `ERROR: Введено слишком много чисел (${inputBlockData.length})\n`, colors.darkTheme.error)}
        } else {
            if (bigFailure) {console.error(`ERROR: Найдено слишком большое число (${failureItem})`)}
            if (typeFailure) {console.error(`ERROR: Передано не число (${failureItem})`)}
            if (inputBlockData.length > amount) {console.error(`ERROR: Введено слишком много чисел (${inputBlockData.length})`)}
        }
    }
}

function addText(parent=document.body, text='', color='#ffffff', extendedOnly=false) {
    let el = document.createElement('span');
    el.style.color = color;
    el.innerText = text;
    if (extendedOnly===true) {el.classList.add('extended')}
    parent.appendChild(el);
}

const arraysEqual = (a, b) => 
  a.length === b.length && a.every((val, index) => val === b[index])

function trans(string) {
    let lmassive = string?.trim().split(' ');
    return lmassive??''
}

function bubbleSort(array, returnMassive = false, size = array.length) {
    let newArray = array;
    let swap_counter = 0;
    for (let i = 1; i < size; ++i) {
        for (let j = 1; j <= size - i; ++j) {
            if (newArray[j - 1] > newArray[j]) {
                // swap
                let temp1 = newArray[j-1];
                let temp2 = newArray[j];
                newArray[j] = temp1;
                newArray[j-1] = temp2;
                // counter
                swap_counter++;
            }
        }
    }
    
    return returnMassive ? newArray : swap_counter;
}

let unitTest = () => {

    let unitTestSet = new Set([
        {number:1, array:'3 1 2 3', n:1000, module:10**9, expected: true},
        {number:2, array:'2 2 1', n:1000, module:10**9, expected: true},
        {number:3, array:'4 1 5 3', n:1000, module:10**9, expected: true},
        {number:4, array:'5 4 3 2 1 0', n: 6, module:10**9, expected: true},
        {number:5, array:'5 4 3 2 1 0', n: 5, module:10**9, expected:false},
        {number:6, array:'26 09 1', n: 7, module:10**9, expected:true},
        {number:7, array:'0 4 9 8 10', n: 8, module:10, expected:true},
        {number:8, array:'0 4 9 8 10', n: 8, module:9, expected:false},
        {number:9, array:'0 0 0 0', n: 5, module:50, expected:true},
        {number:10, array:'0 1 2 3 4 5', n: 5, module:1, expected:false}
    ]);


    unitTestBlock.innerHTML = '';
    unitTestSet.forEach(item => {
        const temp = document.getElementById('unittest1');
        const clone = temp.content.cloneNode(true);
        const console = clone.querySelector('.resultBlock');
        const block = document.getElementById('unitTestBlock');

        var embedded = '';
        if (typeof item.array == 'string') {embedded = item.array.split(' ').map(item => +item) ? [...item.array.split(' ').map(item => +item)].sort((a, b) => a - b) : []} 
        else {embedded = item.array.map(item => +item) ? [...item.array.map(item => +item)].sort((a, b) => a - b) : [];}

        var bubble = '';
        var swaps = 0;
        if (typeof item.array == 'string') {
            bubble = bubbleSort(item.array.split(' ').map(item => +item)??[], true);
            swaps = bubbleSort(item.array.split(' ').map(item => +item)??[], false);
        } else {
            bubble = bubbleSort(item.array??[], true)
            swaps = bubbleSort(item.array??[], false)}

        let size = item.array.split(' ').length;
        let bigNumber = item.array?.split(' ').find(store => store > item.module);
        var failure = false;
        if ((bigNumber != undefined) || (size > item.n)) {failure=true}

        clone.querySelector('span').textContent = `Тест #${item.number}`;

        addText(console, `Тестовый массив: `);
        addText(console, item.array, colors.darkTheme.warn);
        addText(console, `\nКол-во перестановок: `, 'white', true);
        addText(console, swaps, colors.darkTheme.blue, true);
        addText(console, `\nСортировка пузырьком: `);
        addText(console, bubble.join(' '), colors.darkTheme.blue);
        addText(console, `\nВстроенный метод сортировки: `);
        addText(console, embedded.join(' '), colors.darkTheme.blueD);
        addText(console, `\nРезультаты идентичны? - `);
        addText(console, arraysEqual(embedded, bubble)?'Да':'Нет',
        arraysEqual(embedded, bubble)?colors.darkTheme.success:colors.darkTheme.error);
        addText(console, `\nМаксимальное количество чисел: `, 'white', true);
        addText(console, item.n, colors.darkTheme.warn, true);
        addText(console, `\nМаксимальный модуль числа: `, 'white', true);
        addText(console, item.module, colors.darkTheme.warn, true);
        addText(console, `\nВозникли ли какие-либо ошибки? - `, 'white', true);
        addText(console, failure?'Да.':'Нет!',
        failure?colors.darkTheme.error : colors.darkTheme.success, true);
        addText(console, `\nДолжны ли? - `, 'white', true)
        addText(console, item.expected?'Нет':'Абсолютно',
        item.expected?colors.darkTheme.success : colors.darkTheme.error, true);
        if (failure) {
            addText(console, `\nВ чём ошибка: `, 'white', true); 
            let message = '';
            if ((bigNumber != undefined) && (size > item.n)) {
                message = 'Какое-то из чисел слишком \nбольшое, а также чисел слишком много';} 
            else {
                if (bigNumber != undefined) {message = 'Какое-то из чисел слишком больше'};
                if (size > item.n) {message = 'Представлено слишком много чисел'};}

            addText(console, message, colors.darkTheme.error, true)
        }
        block.appendChild(clone);
    })
}

unitTestButton?.addEventListener('click', unitTest)
