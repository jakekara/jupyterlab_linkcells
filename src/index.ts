import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  // NotebookActions, 
  // NotebookPanel,
  // INotebookModel, 
  INotebookTracker
} from '@jupyterlab/notebook';

import {
  Cell
} from '@jupyterlab/cells';

const CELL_ID_KEY = "cell-id";
const DEBUG_ID = 'prompt-button';

function debugLog(...args: any[]) {
  console.log(DEBUG_ID, ...args);
}

const getCellID = (cell: Cell) => cell.model.metadata.get(CELL_ID_KEY);
const setCellID = (cell: Cell) => cell.model.metadata.set(CELL_ID_KEY, "dummy-id");

/**
 * Make sure a cell has required metadata
 * @param tracker 
 */
const processCell = (cell: Cell) => {
  // Add "cell-id" if none exists
  if (!getCellID(cell)) {
    setCellID(cell);
    debugLog("Set cell id...", getCellID(cell))
  } else {
    debugLog("Read cell id...", getCellID(cell))
  }

  // Add "next-cell" if none exists

  // Add button if none exists

}

const processCells = (tracker: INotebookTracker) => {
  debugLog('Processing cells', tracker);

  const update = () => {
    console.log('currentChanged', tracker.currentWidget.content.widgets);
    tracker.currentWidget.content.widgets.forEach(w => {
      if (w instanceof Cell) {
        processCell(w);
      } else {
        debugLog('Well, this is unexpected. Widget is not Cell!');
        debugLog(w);
      }
    });
  }

  tracker.currentChanged.connect(update);
  tracker.activeCellChanged.connect(update);
};

const activate = (app: JupyterFrontEnd, tracker: INotebookTracker) => {
  debugLog('panel-button', 'JupyterLab extension prompt-button is activated!!');
  processCells(tracker);
};

/**
 * Initialization data for the prompt-button extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'prompt-button',
  autoStart: true,
  requires: [INotebookTracker],
  activate
};

export default extension;
