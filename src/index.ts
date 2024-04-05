console.log('ALPHA BETA');
import { createNodes, alphaBetaSearch } from "./a-b-pruning";

const root = createNodes({
  actions: [
    {
      actions: [
        {utility: 3},
        {utility: 12},
        {utility: 8},
      ]
    },
    {
      actions: [
        {utility: 2},
        {utility: 4},
        {utility: 6},
      ]
    },
    {
      actions : [
        {utility: 14},
        {utility: 5},
        {utility: 2},
      ]
    }
  ]
});

const queue = [root];
let recentDepth = root.depth;
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

const move = alphaBetaSearch(root);
let thing = move;
while (thing) {
  console.log(`D:${thing.depth}, U:${thing.utility}`);
  thing = thing?.nextMove!;
}
