console.log('ALPHA BETA');
import { createNodes, alphaBetaSearch } from "./a-b-pruning";
import { sceneCreator } from "./sceneCreator";

// const root = createNodes([
//   [
//     [3],
//     [12],
//     [8]
//   ],
//   [
//     [2],
//     [4],
//     [6]
//   ],
//   [
//     [14],
//     [5],
//     [2]
//   ]
// ]);

const rawStruct = [
  [
    [
      [5],
      [8]
    ],
    [
      [3],
      [
        [5],
        [2],
        [7],
        [0]
      ],
      [9],
      [
        [5],
        [8],
        [1]
      ]
    ],
    [
      [7],
      [
        [9],
        [10],
        [8]
      ]
    ]
  ],
  [
    [
      [
        [3],
        [6],
        [4]
      ],
      [6],
      [
        [10],
        [3]
      ]
    ],
    [
      [
        [8],
        [13]
      ],
      [5],
      [
        [10],
        [8]
      ]
    ]
  ]
];

// const rawStruct = [
//   [
//     [5],
//     [
//       [4],
//       [2],
//       [8]
//     ]
//   ],
//   [7],
//   [4],
//   [4],
// ];

const root = createNodes(rawStruct);

// const queue = [root];
// let recentDepth = root.depth;
// let str = ''
// while (queue.length > 0) {
//   const curr = queue.shift()!;
//   queue.push(...curr.actions);
//   if (recentDepth !== curr.depth) {
//     recentDepth = curr.depth;
//     console.log(str);
//     str = '';
//   }

//   str += `D:${curr.depth}, I:${curr.index}, U:${curr.utility}          `;
// }
// console.log(str);

sceneCreator(root);
alphaBetaSearch(root);
// let thing = move;
// while (thing) {
//   console.log(`D:${thing.depth}, I:${thing.index}, U:${thing.utility}`);
//   thing = thing?.nextMove!;
// }
