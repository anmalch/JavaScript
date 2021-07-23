// 1. Создать функцию, генерирующую шахматную доску.
//  При этом можно использовать любые html-теги по своему желанию. 
//  Доска должна быть разлинована соответствующим образом, т.е. чередовать черные и белые ячейки. 
//  Строки должны нумероваться числами от 1 до 8, столбцы – латинскими буквами A, B, C, D, E, F, G, H. 
//  (использовать createElement / appendChild)

"use strict"

function createChessBoard() {
    const table = document.getElementById('chessboard')
    for (let row = 0; row < 9; row++) {
        const trElem = document.createElement('tr');
        table.appendChild(trElem);

        for (let column = 0; column < 9; column++) {
            const td = document.createElement('td');
            if (row === 0) {
                if (column > 0) {
                    const text = document.createTextNode(String.fromCharCode('A'.charCodeAt(0) + column - 1));
                    td.appendChild(text);
                }
            }
            if (column === 0) {
                if (row > 0) {
                    const text = document.createTextNode(9 - row);
                    td.appendChild(text);
                }
            }

            if (row > 0 && column > 0) {
                if ((row + column) % 2 === 0) {
                    td.classList.add('white');
                }
                else {
                    td.classList.add('black');
                }
            }
            trElem.appendChild(td);

        }
    }
};

createChessBoard();