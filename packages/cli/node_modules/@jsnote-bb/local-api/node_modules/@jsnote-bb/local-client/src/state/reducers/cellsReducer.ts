import { produce } from 'immer';
import { ActionType } from '../action-types';
import { Action } from '../actions';
import { Cell } from '../cell';

interface CellsState {
  loading: boolean;
  error: string | null;
  order: string[];
  data: {
    [key: string]: Cell;
  };
}

const initialState: CellsState = {
  loading: false,
  error: null,
  order: ['a11111', 'b22222', 'c33333'],
  data: {
    a11111: {
      id: 'a11111',
      content: `## ***JavaScript Notebook by Behbod Babai***
This is an interactive coding environment. You can write JavaScript, see it executed, and write comprehensive documentation using markdown. 
  - Click any cell (including this one) to edit it.
  - The code in each code editor is all joined together into one file. If you define a variable in an earlier cell, you can refer to it in the following cell!
  - You can show any react component, string, number, or anything else by calling the \`show\` function. This is a function built into this environment.
  - Re-order or delete cells using the buttons on the top right.
  - Code cells have a built-in format button that formats your code for you to make it prettier!
  - Add new cells by hovering on the divider between, before, or after each cell.
      
All of your changes get saved to the file you opened JBook with. So, if you ran \`npx jsnote-bb serve test.js\`, all of the text and code you write will be saved to the \`test.js\` file.
      I have deployed this package on \`npmjs.com\` as well, you can search for it and run it under the name: \`jsnote-bb\`.
      Happy Coding my friends, and remember to drink lots of coffee XD`,
      type: 'text',
    },
    b22222: {
      id: 'b22222',
      content: `import { useState } from 'react';

      const Counter = () => {
        const [count, setCount] = useState(0);
        return (
          <div>
            <button onClick={() => setCount(count + 1)}>
              Click Me to Add to Counter
            </button>
            <h3>Count: {count}</h3>
          </div>
        );
      };
      
      const changeColor = () => {
        return (
          <button
            onClick={() => {
              document.querySelector('#root').parentElement.parentElement.style =
                'background-color: cyan; color: black';
            }}
          >
            Click Me to Change the Color
          </button>
        );
      };
      
      // Display any variable or React component by calling 'show'
      show(changeColor);`,
      type: 'code',
    },
    c33333: {
      id: 'c33333',
      content: `const App = () => {
        return (
          <div>
            <h3>App Says Hi!</h3>
            <i>Counter component will be rendered below...</i>
            <hr />
            {/* Counter was declared in an earlier cell - We can reference it here! */}
            <Counter />
          </div>
        );
      };
      
      show(App);`,
      type: 'code',
    },
  },
};

const reducer = produce((state: CellsState = initialState, action: Action) => {
  switch (action.type) {
    case ActionType.SAVE_CELLS_ERROR:
      state.error = action.payload;

      return state;
    case ActionType.FETCH_CELLS:
      state.loading = true;
      state.error = null;

      return state;
    case ActionType.FETCH_CELLS_COMPLETE:
      state.order = action.payload.map((cell) => cell.id);
      state.data = action.payload.reduce((acc, cell) => {
        acc[cell.id] = cell;
        return acc;
      }, {} as CellsState['data']);

      return state;
    case ActionType.FETCH_CELLS_ERROR:
      state.loading = false;
      state.error = action.payload;

      return state;
    case ActionType.UPDATE_CELL:
      const { id, content } = action.payload;

      state.data[id].content = content;

      return state;
    case ActionType.DELETE_CELL:
      delete state.data[action.payload];
      state.order = state.order.filter((id) => id !== action.payload);

      return state;
    case ActionType.MOVE_CELL:
      const { direction } = action.payload;
      const index = state.order.findIndex((id) => id === action.payload.id);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex > state.order.length - 1) {
        return state;
      }

      state.order[index] = state.order[targetIndex];
      state.order[targetIndex] = action.payload.id;

      return state;
    case ActionType.INSERT_CELL_AFTER:
      const cell: Cell = {
        content: '',
        type: action.payload.type,
        id: randomId(),
      };

      state.data[cell.id] = cell;

      const foundIndex = state.order.findIndex(
        (id) => id === action.payload.id
      );

      if (foundIndex < 0) {
        state.order.unshift(cell.id);
      } else {
        state.order.splice(foundIndex + 1, 0, cell.id);
      }

      return state;
    default:
      return state;
  }
}, initialState);

const randomId = () => {
  return Math.random().toString(36).substr(2, 5);
};

export default reducer;
