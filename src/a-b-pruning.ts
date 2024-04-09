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
  parent: TreeNode | null = null;
  get isTerminal(): boolean { return this.actions.length === 0; }

  constructor(public utility: number, public actions: TreeNode[], public depth: number, public index: number) {
    this.id = TreeNode.id++;
  }
}

export function createNodes(dataStruct: any[], depth = 0, index = 0): TreeNode {
  const node = new TreeNode(
    typeof dataStruct[0] === 'number' ? dataStruct[0] : NaN,
    dataStruct[0] instanceof Array ? dataStruct.map((action, i) => createNodes(action, depth + 1, i)) : [],
    depth,
    index,
  );
  for (const child of node.actions) { child.parent = node; }

  return node;
}

export function alphaBetaSearch(root: TreeNode) {
  minOrMaxValue('MAX', root, -Infinity, Infinity);
  console.log(root.utility);
  return root;
}

function minOrMaxValue(op: 'MIN' | 'MAX', node: TreeNode, alpha: number, beta: number): void {
  if (node.isTerminal) {
    return;
  }
  node.alpha = alpha;
  node.beta = beta;

  let bestVal = op === 'MAX' ? -Infinity : Infinity;
  let bestMove = null;

  const subtreeEl = document.querySelector(`[data-id="${node.id}"]`)!
  const varsEl = subtreeEl.querySelector('.subtree__node-vars')!;
  const alphaEl = subtreeEl.querySelector(`.subtree__node-var--alpha`)!;
  const alphaValEl = alphaEl.querySelector(`.subtree__node-var-value`)!;
  const betaEl = varsEl.querySelector(`.subtree__node-var--beta`)!;
  const betaValEl = betaEl.querySelector(`.subtree__node-var-value`)!;
  const subtreeNodeUtilityEl = subtreeEl.querySelector(`.subtree__node-utility`)!;

  const parentSubtree = document.querySelector(`[data-id="${node.parent?.id}"]`);
  const sequenceRevealVars = new AnimSequence()
    .setOnStart({
      do() { alphaValEl.innerHTML = `${alpha}`.replace('Infinity', '&infin;'); betaValEl.innerHTML = `${beta}`.replace('Infinity', '&infin;'); },
      undo() { betaValEl.innerHTML = alphaValEl.innerHTML = ``; },
    })
    .addBlocks(
      Entrance(subtreeNodeUtilityEl, '~wipe', ['from-left']),
      Entrance(varsEl, '~fade-in', []),
      Entrance(alphaValEl, '~wipe', ['from-left'], {duration: 250}),
      Entrance(betaValEl, '~wipe', ['from-left'], {duration: 250})
    );

  timeline.addSequences(sequenceRevealVars);

  if (parentSubtree) {
    const parentVarsConnector = parentSubtree.querySelector(`.subtree__vars-connector`) as WbfkConnector;
    const parentVarsEl = parentSubtree.querySelector(`.subtree__node-vars`);
    sequenceRevealVars.addBlocksAt(
      1,
      ConnectorSetter(parentVarsConnector, [parentVarsEl, 'left', 'center'], [varsEl, 'center', 'top']),
      ConnectorEntrance(parentVarsConnector, '~trace', ['from-A'])
    );

    timeline.addSequences(new AnimSequence({autoplaysNextSequence: true}).addBlocks(
      ConnectorExit(parentVarsConnector, '~fade-out', [])
    ));
  }
  
  for (let i = 0; i < node.actions.length; ++i) {
    const action = node.actions[i];

    const actionSubtreeEl = document.querySelector(`[data-id="${action.id}"]`);
    const baseChildConnector = document.querySelector(`.subtree__connector--base[data-to-id="${action.id}"]`) as WbfkConnector;
    const thickChildConnector = document.querySelector(`.subtree__connector--thick[data-to-id="${action.id}"]`) as WbfkConnector;
    timeline.addSequences(new AnimSequence().addBlocks(
      ConnectorEntrance(thickChildConnector, '~trace', ['from-A']),
    ));

    minOrMaxValue(op === 'MAX' ? 'MIN' : 'MAX', action, node.alpha, node.beta);

    timeline.addSequences(new AnimSequence().addBlocks(
      ConnectorExit(thickChildConnector, '~trace', ['from-B']),
      Transition(baseChildConnector, '~to', [{strokeDasharray: 0}], {startsWithPrevious: true})
    ));
    // check to see if action.utility is better
    if (betterUtility(op, action, bestVal)) {
      const oldBestVal = bestVal;
      bestVal = action.utility;
      bestMove = action;

      const bestValCopy = bestVal;
      timeline.addSequences(
        new AnimSequence({autoplays: true})
          .addBlocks(
            Exit(subtreeNodeUtilityEl, '~wipe', ['from-right'])
          ),
        new AnimSequence({autoplays: true})
          .setOnStart({
            do() { subtreeNodeUtilityEl.innerHTML = `${bestValCopy}`; },
            undo() { subtreeNodeUtilityEl.innerHTML = `${oldBestVal}`.replace('Infinity', '&infin;'); }
          })
          .addBlocks(
            Entrance(subtreeNodeUtilityEl, '~wipe', ['from-left'])
          )
      );

      // if equals or beats variable (beta if MAX, alpha if MIN), cut
      if (meetsCutCondition(op, node, bestVal) && i+1 < node.actions.length) {
        [node.utility, node.nextMove] = [bestVal, bestMove];
        return;
      }

      // update node variable (alpha if MAX, beta if MIN)
      updateVar(op, node, bestVal);
    }
  };

  [node.utility, node.nextMove] = [bestVal, bestMove];
}









// HELPER FUNCTIONS
function betterUtility(op: 'MAX' | 'MIN', action: TreeNode, currentBest: number): boolean {
  switch(op) {
    case "MAX": return action.utility > currentBest;
    case "MIN": return action.utility < currentBest;
  }
}

function meetsCutCondition(op: 'MAX' | 'MIN', node: TreeNode, bestUtility: number): boolean {
  switch(op) {
    case "MAX": return bestUtility >= node.beta;
    case "MIN": return bestUtility <= node.alpha;
  }
}

function updateVar(op: 'MAX' | 'MIN', node: TreeNode, potentialNewVal: number): void {
  switch(op) {
    case "MAX":
      node.alpha = Math.max(node.alpha, potentialNewVal);
      break;
    case "MIN":
      node.beta = Math.min(node.beta, potentialNewVal);
      break;
  }
}













// function minOrMaxValue(op: 'MIN' | 'MAX', node: TreeNode, alpha: number, beta: number): void {
//   if (node.isTerminal) {
//     return;
//   }
//   node.alpha = alpha;
//   node.beta = beta;

//   let bestVal = op === 'MAX' ? -Infinity : Infinity;
//   let bestMove = null;
  
//   for (let i = 0; i < node.actions.length; ++i) {
//     const action = node.actions[i];
//     minOrMaxValue(op === 'MAX' ? 'MIN' : 'MAX', action, node.alpha, node.beta);
//     if ( (op === 'MAX' && action.utility > bestVal) || (op === 'MIN' && action.utility < bestVal) ) {
//       bestVal = action.utility;
//       bestMove = action;
//       // if equals or beats variable, cut
//       if ( ((op === 'MAX' && bestVal >= node.beta) || (op === 'MIN' && bestVal <= node.alpha)) && i+1 < node.actions.length ) {
//         [node.utility, node.nextMove] = [bestVal, bestMove];
//         return;
//       }

//       if (op === 'MAX') { (node.alpha = Math.max(node.alpha, bestVal)); }
//       else { (node.beta = Math.min(node.beta, bestVal)) };
//     }
//   };

//   [node.utility, node.nextMove] = [bestVal, bestMove];
// }

