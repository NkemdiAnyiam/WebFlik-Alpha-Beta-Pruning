import { WebFlik, WbfkConnector, AnimSequence, AnimTimeline } from "./WebFlik";

const {
  Entrance,
  Exit,
  Emphasis,
  Motion,
  Transition,
  ConnectorSetter,
  ConnectorEntrance,
  ConnectorExit,
} = WebFlik.createAnimationBanks();

const timeline = new AnimTimeline({timelineName: 'Alpha-Beta-Pruning', debugMode: true});

export class TreeNode {
  readonly id: number;
  static id: number = 0;
  alpha: number = -Infinity;
  beta: number = Infinity;
  nextMove: TreeNode | null = null;
  get isTerminal(): boolean { return this.actions.length === 0; }

  constructor(public utility: number, public actions: TreeNode[], public depth: number, public index: number, public parent: TreeNode | null) {
    this.id = TreeNode.id++;
  }
}

export function createNodes(dataStruct: any[], parent: TreeNode | null = null, depth = 0, index = 0): TreeNode {
  const node = new TreeNode(
    typeof dataStruct[0] === 'number' ? dataStruct[0] : NaN,
    dataStruct[0] instanceof Array ? dataStruct.map((action, i) => createNodes(action, parent, depth + 1, i)) : [],
    depth,
    index,
    parent
  );

  return node;
}

export function alphaBetaSearch(root: TreeNode) {
  maxValue(root, -Infinity, Infinity);
  console.log(root.utility);
  return root;
}

function maxValue(node: TreeNode, alpha: number, beta: number): void {
  if (node.isTerminal) {
    return;
  }
  node.alpha = alpha;
  node.beta = beta;
  
  let bestVal = -Infinity;
  let bestMove = null;

  const subtreeEl = document.querySelector(`[data-id="${node.id}"]`)!
  const varsEl = subtreeEl.querySelector('.subtree__node-vars')!;
  const alphaEl = subtreeEl.querySelector(`.subtree__node-var--alpha`)!;
  const alphaValEl = alphaEl.querySelector(`.subtree__node-var-value`)!;
  const betaEl = varsEl.querySelector(`.subtree__node-var--beta`)!;
  const betaValEl = betaEl.querySelector(`.subtree__node-var-value`)!;
  const seq = new AnimSequence()
    .setOnStart({
      do() { alphaValEl.innerHTML = `${alpha}`.replace('Infinity', '&infin;'); betaValEl.innerHTML = `${beta}`.replace('Infinity', '&infin;'); },
      undo() { betaValEl.innerHTML = alphaValEl.innerHTML = ``; },
    })
    .addBlocks(
      Entrance(varsEl, '~fade-in', []),
      Entrance(alphaValEl, '~wipe', ['from-left'], {duration: 250}),
      Entrance(betaValEl, '~wipe', ['from-left'], {duration: 250})
    );

  timeline.addSequences(seq);

  for (let i = 0; i < node.actions.length; ++i) {
    const action = node.actions[i];
    minValue(action, node.alpha, node.beta);
    if (action.utility > bestVal) {
      bestVal = action.utility;
      bestMove = action;
      // if matches or beats beta, cut
      if (bestVal >= node.beta && i+1 < node.actions.length) {
        [node.utility, node.nextMove] = [bestVal, bestMove];
        return;
      }
      node.alpha = Math.max(node.alpha, bestVal);
    }
  };

  [node.utility, node.nextMove] = [bestVal, bestMove];
}

function minValue(node: TreeNode, alpha: number, beta: number): void {
  if (node.isTerminal) {
    return;
  }

  node.alpha = alpha;
  node.beta = beta;
  
  let bestVal = Infinity;
  let bestMove = null;

  for (let i = 0; i < node.actions.length; ++i) {
    const action = node.actions[i];
    maxValue(action, node.alpha, node.beta);
    if (action.utility < bestVal) {
      bestVal = action.utility;
      bestMove = action;
      // if matches or beats alpha, cut
      if (bestVal <= node.alpha && i+1 < node.actions.length) {
        [node.utility, node.nextMove] = [bestVal, bestMove];
        return;
      }
      node.beta = Math.min(node.beta, bestVal);
    }
  };

  [node.utility, node.nextMove] = [bestVal, bestMove];
}










// export function alphaBetaSearch(root: TreeNode) {
//   maxValue(root, -Infinity, Infinity);
//   console.log(root.utility);
//   return root;
// }

// function maxValue(node: TreeNode, alpha: number, beta: number): void {
//   if (node.isTerminal) {
//     return;
//   }
//   node.alpha = alpha;
//   node.beta = beta;
  
//   let bestVal = -Infinity;
//   let bestMove = null;

//   for (let i = 0; i < node.actions.length; ++i) {
//     const action = node.actions[i];
//     minValue(action, node.alpha, node.beta);
//     if (action.utility > bestVal) {
//       bestVal = action.utility;
//       bestMove = action;
//       // if matches or beats beta, cut
//       if (bestVal >= node.beta && i+1 < node.actions.length) {
//         [node.utility, node.nextMove] = [bestVal, bestMove];
//         return;
//       }
//       node.alpha = Math.max(node.alpha, bestVal);
//     }
//   };

//   [node.utility, node.nextMove] = [bestVal, bestMove];
// }

// function minValue(node: TreeNode, alpha: number, beta: number): void {
//   if (node.isTerminal) {
//     return;
//   }

//   node.alpha = alpha;
//   node.beta = beta;
  
//   let bestVal = Infinity;
//   let bestMove = null;

//   for (let i = 0; i < node.actions.length; ++i) {
//     const action = node.actions[i];
//     maxValue(action, node.alpha, node.beta);
//     if (action.utility < bestVal) {
//       bestVal = action.utility;
//       bestMove = action;
//       // if matches or beats alpha, cut
//       if (bestVal <= node.alpha && i+1 < node.actions.length) {
//         [node.utility, node.nextMove] = [bestVal, bestMove];
//         return;
//       }
//       node.beta = Math.min(node.beta, bestVal);
//     }
//   };

//   [node.utility, node.nextMove] = [bestVal, bestMove];
// }

// export function createNodes(dataStruct: any[], depth = 0, index = 0): TreeNode {
//   const node = new TreeNode(
//     typeof dataStruct[0] === 'number' ? dataStruct[0] : NaN,
//     dataStruct[0] instanceof Array ? dataStruct.map((action, i) => createNodes(action, depth + 1, i)) : [],
//     depth,
//     index
//   );

//   return node;
// }

