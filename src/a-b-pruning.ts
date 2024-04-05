class TreeNode {
  alpha: number = -Infinity;
  beta: number = Infinity;
  next: TreeNode | null = null;

  constructor(public utility: number, public actions: TreeNode[], public depth: number) {}
  
  isTerminal(): boolean { return this.actions.length === 0; }
  nextify(next: TreeNode | null): TreeNode { this.next = next; return this; }
}

type Ret = [
  utility: number,
  move: null | TreeNode
];

export function alphaBetaSearch(root: TreeNode) {
  const [value, move] = maxValue(root, -Infinity, Infinity);
  console.log(value);
  return move;
}

function maxValue(node: TreeNode, alpha: number, beta: number): Ret {
  if (node.isTerminal()) {
    return [node.utility, node.nextify(null)];
  }
  node.alpha = alpha;
  node.beta = beta;
  
  let bestVal = -Infinity;
  let bestMove = null;

  for (let i = 0; i < node.actions.length; ++i) {
    const action = node.actions[i];
    const [maybeBetterVal, maybeBetterMove] = minValue(action, node.alpha, node.beta);
    if (maybeBetterVal > bestVal) {
      bestVal = maybeBetterVal;
      bestMove = maybeBetterMove;
      if (bestVal >= node.beta) {
        return [bestVal, node.nextify(bestMove)];
      }
      node.alpha = Math.max(node.alpha, bestVal);
    }
  };

  return [bestVal, node.nextify(bestMove)];
}

function minValue(node: TreeNode, alpha: number, beta: number): Ret {
  if (node.isTerminal()) {
    return [node.utility, null];
  }
  
  let bestVal = Infinity;
  let bestMove = null;

  for (let i = 0; i < node.actions.length; ++i) {
    const action = node.actions[i];
    const [maybeBetterVal, maybeBetterMove] = maxValue(action, node.alpha, node.beta);
    if (maybeBetterVal < bestVal) {
      bestVal = maybeBetterVal;
      bestMove = maybeBetterMove;
      if (bestVal <= alpha) {
        return [bestVal, node.nextify(bestMove)];
      }
      beta = Math.min(beta, bestVal);
    }
  };

  return [bestVal, node.nextify(bestMove)];
}

type BootLeg = {
  utility: number;
  actions?: BootLeg[];
};

function convert(action: BootLeg, depth = 0): TreeNode {
  const node = new TreeNode(
    action.utility,
    action.actions?.map((action) => convert(action, depth + 1)) ?? [],
    depth
  );

  return node;
}

const node = convert({
  utility: 3,
  actions: [
    {
      utility: 3,
      actions: [
        {utility: 3},
        {utility: 12},
        {utility: 8},
      ]
    },
    {
      utility: 2,
      actions: [
        {utility: 2},
        {utility: 4},
        {utility: 6},
      ]
    },
    {
      utility: 2,
      actions : [
        {utility: 14},
        {utility: 5},
        {utility: 2},
      ]
    }
  ]
});

const queue = [node];
let recentDepth = node.depth;
let str = ''
while (queue.length > 0) {
  const curr = queue.shift()!;
  queue.push(...curr.actions);
  if (recentDepth !== curr.depth) {
    recentDepth = curr.depth;
    console.log(str);
    str = '';
  }

  str += `D:${curr.depth}, U:${curr.utility}          `;
}
console.log(str);

const move = alphaBetaSearch(node);
let thing = move;
while (thing) {
  console.log(`D:${thing.depth}, U:${thing.utility}`);
  thing = thing?.next!;
}
