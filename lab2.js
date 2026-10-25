class Mathematical {
    // функция суммирования
    sum(a, b) {return a + b}

    // функция произведения
    multiply(a, b) {return a * b;}

    // выбранная дополнительная
    // функция нахождения факторила
    factorial(a) {
        let counter = 1;
        for (let i of Array.from({length: a},
            (_, index) => index+1)) { counter*=i }
        return counter;
    }
}

// функция общраения к api для математических вычислений
async function fetchRequest(expressionString, presicion=14) {
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({expr: expressionString})
    };

    const url = "https://api.mathjs.org/v4/";
    console.info(`Отправка запроса на сервер...`)
    console.time('mathfetch');
    // запрос на сервер с обработкой ошибок
    return fetch(url, requestOptions)
    .then(async response => {
        if (!response.ok) {response.json().then(item=>console.error(item.error)) ;throw new Error(`Ошибка сервера: ${response.status}`);}
        console.info(`Время получения запроса:`)
        console.timeEnd("mathfetch");
        return response.json();
    })
    .then(data => {data.input = expressionString; console.log("Результат вычисления:", data); return data; })
    .catch(error => {console.error("Произошла ошибка при запросе:", error.message);});
}

// экземпляр созданного класса
let math = new Mathematical;

// набор выраженией и их результат
let unitTestSet = new Set([
    new Map([["expression","2 + 2 * 2"],["function",(math.sum(2, math.multiply(2,2)))]]),
    new Map([["expression","(2 + 2) * 2"],["function",(math.multiply(2, math.sum(2, 2)))]]),
    new Map([["expression", "1+1+1+1+1"],["function", math.sum(1, math.sum(1, math.sum(1, math.sum(1, 1))))]]),
    new Map([["expression", "0*0"],["function", math.multiply(0,0)]]),
    new Map([["expression", "1*0"],["function", math.multiply(1,0)]]),
    new Map([["expression", "0+0"], ["function", math.sum(0,0)]]),
    new Map([["expression", "0+1"], ["function",math.sum(0,1)]]),
    new Map([["expression","-9+1"], ["function",math.sum(-9,1)]]),
    new Map([["expression","-9+(-1)"], ["function",math.sum(-9,-1)]]),
    new Map([["expression","-6*(-1)"], ["function",math.multiply(-6,-1)]]),
    new Map([["expression","6*(-1)"], ["function",math.multiply(6,-1)]]),
    new Map([["expression","0!"], ["function",math.factorial(0)]]),
    new Map([["expression","1!"], ["function",math.factorial(1)]]),
    new Map([["expression","5!"], ["function",math.factorial(5)]]),
    new Map([["expression","-3!"], ["function",math.factorial(-3)]]),
]);

// перебор всех элементов unit-теста
let unitIterator = (...params) => {
    if (params.length === 0) {return [...unitTestSet.values()]}
    let set = new Set();
    [...unitTestSet.values()].map(item => {
        var localObj = new Map();
        params.map(param=>{
            if (item.has(param)) {localObj.set(param, item.get(param))}
            localObj.size==0 ? localObj.set("error", true) : localObj;
        });
        set.add(localObj);
    });
    return set;
};

// функция юнит-теста
let unitTest = async () => {
    const block = document.getElementById('unitTestBlock');
    const template = document.getElementById('loader-template');
    const loaderClone = template.content.cloneNode(true);
    block.appendChild(loaderClone);

    // запрос к API и вычисления на основе результатов
    let results = {}; results.function = [];
    fetchRequest([...unitIterator("expression")].map(d => d.get('expression')))
    .then(result => {
        result.function=[];
        unitTestSet.forEach(item => {result.function.push(item.get('function'))});

        // сокрытие иконки загрузки
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 500);
        }

        // прохождение по каждому элементу и отображение его блока на интерфейсе
        let size = result.input.length;
        for (let i = 0; i < size; i++) {
            const temp = document.getElementById('unittest');
            const clone = temp.content.cloneNode(true);
            const console = clone.querySelector('.result');
            const condition = result.function[i]==(+(result.result[i]));
            
            addText(console, 'Выражение: ');
            addText(console, result.input[i], colors.darkTheme.blueD);

            addText(console, '\nРезультат функции: ')
            addText(console, result.function[i], colors.darkTheme.blue);

            addText(console, '\nРезультат через API: ')
            addText(console, result.result[i], colors.darkTheme.warn);

            addText(console, '\nРезультаты совпадают? ')
            addText(console, condition?"Да!":"Нет.",
                condition?colors.darkTheme.success:colors.darkTheme.error);

            clone.querySelector('span').textContent = `Тест #${i+1}`;

            block.appendChild(clone);
        }
    }).catch((reason)=>{document.getElementById('loader')?.remove();
        alert(`Произошла ошибка запроса: ${reason}`);
        document.getElementById('unit').removeAttribute('disabled')});
}

//interface thingies
{
    // вывод текста в поле результата
    function addText(parent=document.body,
    text='', color='#ffffff', extendedOnly=false) {
        let el = document.createElement('span');
        el.style.color = color;
        el.innerText = text;
        if (extendedOnly===true) {el.classList.add('extended')}
        parent.appendChild(el);
    }

    const maxDataBlock = document.getElementById('maxDataBlock');
    const inputsIDs = ['sum1', 'sum2', 'multi1', 'multi2', 'fac'];
    const resultIDs = ['res_sum', 'res_mul', 'res_fac'];

    // установка максимума и минимума для инпутов
    inputsIDs.forEach(id=>{
        let element = document.getElementById(id)
        element.setAttribute('min', maxDataBlock.getAttribute('min'));
        element.setAttribute('max', maxDataBlock.getAttribute('max'));
    })

    // блоки вывода результата
    const resultSum = document.getElementById('res_sum');
    const resultMultiply = document.getElementById('res_mul');
    const resultFactorial = document.getElementById('res_fac');

    // кнопки
    const buttonSum = document.getElementById('butt_sum');
    const buttonMultiply = document.getElementById('butt_mul');
    const buttonFactorial = document.getElementById('butt_fac');
    const buttonUnitTest = document.getElementById('unit');

    // функция валидации вычислений
    function validate(inputID, min, max) {
        let value = +(document.getElementById(inputID)?.value??0);

        if (!value) {return {status: "error", code:0, cause:"Значение не определено", value, min, max}}
        if (value > max) {return {status: "error", code:1, cause:"Слишком большое число передано", value, min, max}}
        if (value < min) {return {status: "error", code:2, cause:"Слишком маленькое число передано", value, min, max}}
        if (isNaN(value)) {return {status: "error", code:3, cause:"Передано не число", value, min, max}}
        return {status:'ok', cause:'', value, min, max}
    }

    // обработка ошибок и вычисление результата
    function errorPrevent(operationID, restrictionDataBlock, resultID, ...inputIDs) {
        let resultBlock = document.getElementById(resultID);
        let inputBlock1; let inputBlock2;
        let local_min; let local_max;

        try {
            if (inputIDs.length>0) {
                // ok
                inputBlock1 = document.getElementById(inputIDs[0])
                inputBlock2 = document.getElementById(inputIDs[1])
                local_min = +restrictionDataBlock.getAttribute('data-min')?? 9999999;
                local_max = +restrictionDataBlock.getAttribute('data-max')??-9999999;

                // валидация данных
                let val1 = validate(inputIDs[0], local_min, local_max);
                let val2 = validate(inputIDs[1], local_min, local_max);
                if (operationID==3) {val2.status='ok';}

                // error
                if (val1.status=='error'||val2.status=='error') {
                    if (val1.cause?.length > 0) {throw new Error(val1.cause, {cause: {max:val1.max, min:val1.min, code:val1.code, result:'result', blockID:resultID, value:val1.value}});}
                    if (val2.cause?.length > 0) {throw new Error(val2.cause, {cause: {max:val2.max, min:val2.min, code:val2.code, result:'result', blockID:resultID, value:val2.value}})}
                } else {
                    // not error
                    let result = 0;
                    switch (operationID) {
                        case 1: result = math.sum(val1.value, val2.value); break;
                        case 2: result = math.multiply(val1.value, val2.value); break;
                        case 3: result = math.factorial(val1.value); break;
                    }
                    
                    // display text
                    resultBlock.innerText = '';
                    addText(resultBlock, result, 'white');
                };

                // error
                if (inputIDs.length>2) {
                    throw new Error('Слишком много инпутов передано, ожидалось 2',
                        {cause: {result: 'console', blockID: resultID}})
                }
            } else {throw new Error('Не передано ни одного инпута',
                {cause: {result: 'console', blockID: resultID}})}
        } catch (error) {
            if (error.cause && error.cause.result == 'console') {console.error(error.message);}
            if (error.cause && error.cause.result == 'result') {
                let local_block = document.getElementById(error.cause.blockID);
                local_block.innerText = ''; 
                switch (error.cause.code) {
                    case 1: addText(local_block, `${error.message} (>${error.cause.max})`, 'red'); break;
                    case 2: addText(local_block, `${error.message} (<${error.cause.min})`, 'red'); break;
                    default: addText(local_block, error.message, 'red'); break;
                }
                console.error("Details: ",error.cause);
            }
            else {console.error(error)}
        }
    }

    // триггеры по нажатии кнопок
    buttonSum.addEventListener("click", ()=>{errorPrevent(1, maxDataBlock, resultIDs[0], inputsIDs[0], inputsIDs[1])})
    buttonMultiply.addEventListener("click", ()=>{errorPrevent(2, maxDataBlock, resultIDs[1], inputsIDs[2], inputsIDs[3])})
    buttonFactorial.addEventListener("click", ()=>{errorPrevent(3, maxDataBlock, resultIDs[2], inputsIDs[4])})
    buttonUnitTest.addEventListener("click", ()=>{unitTest(); buttonUnitTest.setAttribute('disabled','')})
}