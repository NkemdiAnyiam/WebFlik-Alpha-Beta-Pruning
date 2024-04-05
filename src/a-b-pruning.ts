class TreeNode {
  alpha: number = -Infinity;
  beta: number = Infinity;
  next: TreeNode | null = null;

  constructor(public utility: number, public actions: TreeNode[], public depth: number) {}
  
  isTerminal(): boolean { return this.actions.length === 0; }
  setNext(next: TreeNode | null): TreeNode { this.next = next; return this; }
}

export function alphaBetaSearch(root: TreeNode) {
  const value = maxValue(root, -Infinity, Infinity);
  console.log(value);
  return root;
}

function maxValue(node: TreeNode, alpha: number, beta: number): number {
  if (node.isTerminal()) {
    return node.utility;
  }
  node.alpha = alpha;
  node.beta = beta;
  
  let bestVal = -Infinity;
  let bestMove = null;

  for (let i = 0; i < node.actions.length; ++i) {
    const action = node.actions[i];
    const maybeBetterVal = minValue(action, node.alpha, node.beta);
    if (maybeBetterVal > bestVal) {
      bestVal = maybeBetterVal;
      bestMove = action;
      if (bestVal >= node.beta) {
        [node.utility, node.next] = [bestVal, bestMove];
        return bestVal;
      }
      node.alpha = Math.max(node.alpha, bestVal);
    }
  };

  [node.utility, node.next] = [bestVal, bestMove];
  return bestVal;
}

function minValue(node: TreeNode, alpha: number, beta: number): number {
  if (node.isTerminal()) {
    return node.utility;
  }

  node.alpha = alpha;
  node.beta = beta;
  
  let bestVal = Infinity;
  let bestMove = null;

  for (let i = 0; i < node.actions.length; ++i) {
    const action = node.actions[i];
    const maybeBetterVal = maxValue(action, node.alpha, node.beta);
    if (maybeBetterVal < bestVal) {
      bestVal = maybeBetterVal;
      bestMove = action;
      if (bestVal <= node.alpha) {
        [node.utility, node.next] = [bestVal, bestMove];
        return bestVal;
      }
      node.beta = Math.min(node.beta, bestVal);
    }
  };

  [node.utility, node.next] = [bestVal, bestMove];
  return bestVal;
}

type BasicNodeStruct = {
  utility: number;
  actions?: BasicNodeStruct[];
};

export function createNodes(action: BasicNodeStruct, depth = 0): TreeNode {
  const node = new TreeNode(
    action.utility,
    action.actions?.map((action) => createNodes(action, depth + 1)) ?? [],
    depth
  );

  return node;
}

// const queue = [node];
// let recentDepth = node.depth;
// let str = ''
// while (queue.length > 0) {
//   const curr = queue.shift()!;
//   queue.push(...curr.actions);
//   if (recentDepth !== curr.depth) {
//     recentDepth = curr.depth;
//     console.log(str);
//     str = '';
//   }

//   str += `D:${curr.depth}, U:${curr.utility}          `;
// }
// console.log(str);

// const move = alphaBetaSearch(node);
// let thing = move;
// while (thing) {
//   console.log(`D:${thing.depth}, U:${thing.utility}`);
//   thing = thing?.next!;
// }
