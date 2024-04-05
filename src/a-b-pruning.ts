class TreeNode {
  alpha: number = -Infinity;
  beta: number = Infinity;
  nextMove: TreeNode | null = null;
  get isTerminal(): boolean { return this.actions.length === 0; }

  constructor(public utility: number, public actions: TreeNode[], public depth: number) {}
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
      if (bestVal >= node.beta) {
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
      if (bestVal <= node.alpha) {
        [node.utility, node.nextMove] = [bestVal, bestMove];
        return;
      }
      node.beta = Math.min(node.beta, bestVal);
    }
  };

  [node.utility, node.nextMove] = [bestVal, bestMove];
}

type BasicNodeStruct = {
  utility?: number;
  actions?: BasicNodeStruct[];
};

export function createNodes(action: BasicNodeStruct, depth = 0): TreeNode {
  const node = new TreeNode(
    action.utility ?? NaN,
    action.actions?.map((action) => createNodes(action, depth + 1)) ?? [],
    depth
  );

  return node;
}
