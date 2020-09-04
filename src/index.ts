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

import { Cell } from '@jupyterlab/cells';

import gensym from './gensym';
import { manageCellIDs } from './cellID';

const CELL_ID_KEY = 'cell-id';
const NEXT_CELL_KEY = 'next-cell';
const DEBUG_ID = 'prompt-button';

function debugLog(...args: any[]): void {
  console.log(DEBUG_ID, ...args);
}

function initializeMetadataValue(
  cell: Cell,
  key: string,
  defaultValue: any
): any {
  const currentValue = cell.model.metadata.get(key);
  if (currentValue === undefined) {
    cell.model.metadata.set(key, defaultValue);
    debugLog(`Set ${key} to ${defaultValue}`);
  } else {
    debugLog(`Got ${key}: ${currentValue}`);
  }

  return cell.model.metadata.get(key);
}

function linkCellToNext(tracker: INotebookTracker): void {
  debugLog('Linking cell to next', tracker);
  const currentCell = tracker.activeCell;
  let atCurrentCell = false;
  let done = false;
  tracker.currentWidget.content.widgets.forEach(w => {
    if (done) {
      return;
    }
    if (!(w instanceof Cell)) {
      debugLog('LinkCellToNext Error: Expected widget would be a cell');
    } else {
      if (w === currentCell) {
        atCurrentCell = true;
      } else if (atCurrentCell) {
        currentCell.model.metadata.set(
          NEXT_CELL_KEY,
          w.model.metadata.get(CELL_ID_KEY)
        );
        atCurrentCell = false;
        done = true;
      }
    }
  });
}

/**
 * Make sure cell has a button
 * @param cell
 */
function initializeButton(cell: Cell, tracker: INotebookTracker): Element {
  manageCellIDs(tracker);

  if (cell.promptNode.getElementsByClassName('link-button').length === 0) {
    const button = cell.promptNode.appendChild(
      document.createElement('button')
    );
    button.className = 'bp3-button bp3-minimal jp-Button minimal link-button';
    button.value = 'Link';
    button.onclick = (): void => {
      linkCellToNext(tracker);
    };
    debugLog('Added button', button);
    return button;
  } else {
    return cell.promptNode.getElementsByClassName('link-button')[0];
  }
}

/**
 * Make sure a cell has required metadata
 * @param cell
 */
const processCell = (cell: Cell, tracker: INotebookTracker) => {
  // Add "cell-id" if none exists
  initializeMetadataValue(cell, CELL_ID_KEY, gensym());

  // Add "next-cell" if none exists
  initializeMetadataValue(cell, NEXT_CELL_KEY, null);

  // Add button if none exists
  initializeButton(cell, tracker);
};

const processCells = (tracker: INotebookTracker) => {
  debugLog('Processing cells', tracker);

  const update = () => {
    console.log('currentChanged', tracker.currentWidget.content.widgets);
    tracker.currentWidget.content.widgets.forEach(w => {
      if (w instanceof Cell) {
        processCell(w, tracker);
      } else {
        debugLog('Well, this is unexpected. Widget is not a Cell!');
        debugLog(w);
      }
    });
  };

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
