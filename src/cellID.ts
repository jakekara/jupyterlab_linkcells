import { INotebookTracker } from '@jupyterlab/notebook';
import { Cell } from '@jupyterlab/cells';

import gensym from './gensym';

const CELL_ID_KEY = 'cell-id';

function getCellID(cell: Cell): string | undefined {
    const ret =  cell.model.metadata.get(CELL_ID_KEY);
    if (ret === undefined){ return; }
    return ret.toString();
}

function getCellIDs(cells: readonly Cell[]): Array<string | undefined> {
    return cells.map(getCellID);
}

function setCellID(cell: Cell, cellID: string) {
    cell.model.metadata.set(CELL_ID_KEY, cellID);
}

/**
 * Ensure that cells have a unique ID or undefined
 * @param cells 
 */
function validateCellIDs(cells: readonly Cell[]): undefined {
    const cellIDs = getCellIDs(cells)
        .filter(cid => cid !== undefined);
    console.log('Got cell IDs', cellIDs);
    if (cellIDs.length === new Set(cellIDs).size) {
        return;
    }
    console.log(cellIDs);
    throw Error('Duplicate cellID found');
}

function fillCellIDs(cells: readonly Cell[]): void {
    const cellIDs = getCellIDs(cells);
    console.log('Filling cellIDs. Found these ones already', cellIDs);
    validateCellIDs(cells);
    cells.forEach((c: Cell) => {
        // if the cell has an id, we're done
        if (getCellID(c)) {
            console.log("Cell already has id: ", getCellID(c))
            return;
        }

        // if not, get a new ID
        let newCellID;
        while ((!newCellID) || cellIDs.includes(newCellID)) {
            newCellID = gensym();
            console.log('Generated new cell id: ', newCellID);
        }

        // set the new cell ID
        setCellID(c, newCellID);

        // validate the cell IDs
        validateCellIDs(cells);

    })

}

/**
 * Make sure each cell has a unique cell_id
 * @param validate
 */
function manageCellIDs(tracker: INotebookTracker): void {
    const cells = tracker.currentWidget.content.widgets;
    console.log('Managing Cell IDs for cells', cells);
    console.log('cells', getCellIDs(cells));
    fillCellIDs(cells);
    validateCellIDs(cells);
}

export { manageCellIDs };
