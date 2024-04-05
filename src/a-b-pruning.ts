export class TreeNode {
  alpha: number = -Infinity;
  beta: number = Infinity;
  nextMove: TreeNode | null = null;
  get isTerminal(): boolean { return this.actions.length === 0; }

  constructor(public utility: number, public actions: TreeNode[], public depth: number, public index: number) {}
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

  for (let i = 0; i < node.actions.length; ++i) {
    const action = node.actions[i];
    minValue(action, node.alpha, node.beta);
    if (action.utility > bestVal) {
      bestVal = action.utility;
      bestMove = action;
      if (bestVal >= node.beta && i+1 < node.actions.length) {
        [node.utility, node.nextMove] = [bestVal, bestMove];
        console.log(`CUTTING, ${node.utility}, ${node.depth}, ${node.index}`);
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
      if (bestVal <= node.alpha && i+1 < node.actions.length) {
        [node.utility, node.nextMove] = [bestVal, bestMove];
        console.log(`CUTTING, ${node.utility}, ${node.depth}, ${node.index}`);
        return;
      }
      node.beta = Math.min(node.beta, bestVal);
    }
  };

  [node.utility, node.nextMove] = [bestVal, bestMove];
}

export function createNodes(dataStruct: any[], depth = 0, index = 0): TreeNode {
  const node = new TreeNode(
    typeof dataStruct[0] === 'number' ? dataStruct[0] : NaN,
    dataStruct[0] instanceof Array ? dataStruct.map((action, i) => createNodes(action, depth + 1, i)) : [],
    depth,
    index
  );

  return node;
}
