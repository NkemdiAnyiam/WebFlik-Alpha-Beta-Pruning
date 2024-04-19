import { WebFlik, WbfkConnector, AnimSequence, AnimTimeline } from "./WebFlik";
import { ConnectorSetterBlock } from "./WebFlik/AnimBlockLine";

const {
  Entrance,
  Exit,
  Emphasis,
  Motion,
  Transition,
  ConnectorSetter,
  ConnectorEntrance,
  ConnectorExit,
} = WebFlik.createAnimationBanks({
  emphases: {
    [`change-text`]: {
      generateRafMutators(newText: string) {
        const oldText = this.domElem.innerHTML;

        return [
          () => { this.domElem.innerHTML = newText.replace(/Infinity/g, '&infin;'); },
          () => { this.domElem.innerHTML = oldText.replace(/Infinity/g, '&infin;'); }
        ];
      },
      config: {
        commitStylesForcefully: true,
        duration: 0,
      }
    }
  }
});

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

  const greatestOrLeast = op === 'MAX' ? 'greatest' : 'least';
  const greaterOrLesser = op === 'MAX' ? 'greater' : 'lesser';
  const nodeColor = op === 'MAX' ? 'darkblue' : 'darkred';

  const subtreeEl = document.querySelector(`[data-id="${node.id}"]`)!
  const subtreeNodeEl = subtreeEl.querySelector(`.subtree__node`)!;
  const varsEl = subtreeEl.querySelector('.subtree__node-vars')!;
  const alphaEl = subtreeEl.querySelector(`.subtree__node-var--alpha`)!;
  const alphaValEl = alphaEl.querySelector(`.subtree__node-var-value`)!;
  const betaEl = varsEl.querySelector(`.subtree__node-var--beta`)!;
  const betaValEl = betaEl.querySelector(`.subtree__node-var-value`)!;
  const subtreeNodeUtilityEl = subtreeEl.querySelector(`.subtree__node-utility`)!;
  const textBox = subtreeEl.querySelector(`:scope > .text-box`);
  const textBoxConnector = textBox?.parentElement?.querySelector('.text-box-connector') as WbfkConnector;

  const parentSubtree = document.querySelector(`[data-id="${node.parent?.id}"]`);
  const sequenceRevealVars = new AnimSequence({description: `Reveal the alpha and beta variables`})
    .setOnStart({
      do() { alphaValEl.innerHTML = `${alpha}`.replace(/Infinity/g, '&infin;'); betaValEl.innerHTML = `${beta}`.replace(/Infinity/g, '&infin;'); },
      undo() { betaValEl.innerHTML = alphaValEl.innerHTML = ``; },
    })
    .addBlocks(
      Emphasis(textBox, 'change-text', [
        parentSubtree
        ? `The parent passed its &alpha; and &beta; values to us, which were ${alpha} and ${beta} respectively.`
        : `Let's start with the root node. Since it's the root, no &alpha; or &beta; are passed down to us, so they should be -&infin; and &infin;.`
      ]),
      // Motion(textBox, '~move-to', [subtreeNodeEl, {alignment: 'left bottom', offsetSelfX: '-100%', offsetTargetX: '-1rem'}], {duration: 0}),
      Entrance(textBox, '~fade-in', []),
      ConnectorSetter(textBoxConnector, [textBox, 'right', 'center'], [subtreeNodeEl, 'left + 25%', 'center']),
      ConnectorEntrance(textBoxConnector, '~trace', ['from-A']),
      Entrance(varsEl, '~fade-in', []),
      Entrance(alphaValEl, '~wipe', ['from-left'], {duration: 250}),
      Entrance(betaValEl, '~wipe', ['from-left'], {duration: 250})
    );

  timeline.addSequences(sequenceRevealVars);

  // if this is not the root, draw connector from parent alpha/beta box to this alpha/beta box to indicate passing down values
  if (parentSubtree) {
    const parentVarsConnector = parentSubtree.querySelector(`.subtree__vars-connector`) as WbfkConnector;
    const parentVarsEl = parentSubtree.querySelector(`.subtree__node-vars`);
    sequenceRevealVars.addBlocksAt(
      -3,
      ConnectorSetter(parentVarsConnector, [parentVarsEl, 'left', 'center'], [varsEl, 'center', 'top']),
      ConnectorEntrance(parentVarsConnector, '~trace', ['from-A']),
    );

    timeline.addSequences(new AnimSequence({autoplaysNextSequence: true}).addBlocks(
      ConnectorExit(parentVarsConnector, '~fade-out', [])
    ));
  }

  timeline.addSequences(new AnimSequence({description: `Reveal default utility value`}).addBlocks(
    ...exitTextBox(textBox),
    textChange(textBox, `Since this is a ${op} node, we want to find the ${greatestOrLeast} utility among the children. To start, let's set this initial utility to ${op === 'MAX' ? '-' : ''}&infin;.`),
    ConnectorSetter(textBoxConnector, ['preserve'], [subtreeNodeUtilityEl, 'left', 'center']),
    ...enterTextBox(textBox),
    Entrance(subtreeNodeUtilityEl, '~wipe', ['from-left']),
  ));
  
  for (let i = 0; i < node.actions.length; ++i) {
    const action = node.actions[i];

    const actionSubtreeEl = document.querySelector(`[data-id="${action.id}"]`);
    const baseChildConnector = document.querySelector(`.subtree__connector--base[data-to-id="${action.id}"]`) as WbfkConnector;
    const thickChildConnector = document.querySelector(`.subtree__connector--thick[data-to-id="${action.id}"]`) as WbfkConnector;
    timeline.addSequences(new AnimSequence({description: `Trace to child ${i}.`}).addBlocks(
      ...exitTextBox(textBox),
      ConnectorEntrance(thickChildConnector, '~trace', ['from-A']),
      textChange(textBox, `Now let's follow this bolded path to a child element to see if we can find a better (${greaterOrLesser}) utility value.`),
      ConnectorSetter(textBoxConnector, [textBox, 'center', 'bottom'], [thickChildConnector, 'center', 'center']),
      ...enterTextBox(textBox),
    ));

    timeline.addSequences(new AnimSequence({autoplaysNextSequence: true, description: `Fade out our text box so child text box can steal the show.`}).addBlocks(
      Exit(textBox, '~fade-out', []),
      ConnectorExit(textBoxConnector, '~trace', ['from-B'], {startsWithPrevious: true}),
    ));

    minOrMaxValue(op === 'MAX' ? 'MIN' : 'MAX', action, node.alpha, node.beta);

    timeline.addSequences(new AnimSequence({description: `Erase thick connector to child ${i}.`}).addBlocks(
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
            undo() { subtreeNodeUtilityEl.innerHTML = `${oldBestVal}`.replace(/Infinity/g, '&infin;'); }
          })
          .addBlocks(
            Entrance(subtreeNodeUtilityEl, '~wipe', ['from-left'])
          )
      );

      // if equals or beats variable (beta if MAX, alpha if MIN), cut
      if (meetsCutCondition(op, node, bestVal) && i+1 < node.actions.length) {
        [node.utility, node.nextMove] = [bestVal, bestMove];

        const strikeThroughConnector = subtreeEl.querySelector(`:scope > .subtree__connectors .strike-through`) as WbfkConnector;
        const firstPrunedLine = document.querySelector(`.subtree__connector--base[data-to-id="${node.actions[i+1].id}"]`) as WbfkConnector;
        const lastPrunedLine = document.querySelector(`.subtree__connector--base[data-to-id="${node.actions[node.actions.length - 1].id}"]`) as WbfkConnector;

        timeline.addSequences(new AnimSequence().addBlocks(
          // draw strike through the connectors of the subtrees that just got pruned
          ConnectorSetter(strikeThroughConnector, [firstPrunedLine.lineElement, 'center - 10%', 'center + 10%'], [lastPrunedLine.lineElement, 'center + 10%', 'center - 10%']),
          ConnectorEntrance(strikeThroughConnector, '~trace', ['from-left']),
          // reduce opacity of the child subtrees that just got pruned and the connectors pointing to them
          ...node.actions.slice(i+1).map( action => Transition(document.querySelector(`[data-to-id="${action.id}"]`), '~to', [{opacity: 0.5}], {startsNextBlock: true}) ),
          ...node.actions.slice(i+1).map( action => Transition(document.querySelector(`[data-id="${action.id}"]`), '~to', [{opacity: 0.5}], {startsNextBlock: true}) )
        ));

        timeline.addSequences(new AnimSequence().addBlocks(
          Transition(subtreeNodeEl, '~to', [{backgroundColor: nodeColor}]),
          Transition(subtreeNodeEl.querySelector('.subtree__node-fill'), '~to', [{backgroundColor: nodeColor}], {startsWithPrevious: true}),
          Transition(subtreeNodeUtilityEl, '~to', [{color: '#f7f7f7', fontWeight: 600}], {startsWithPrevious: true})
        ));
        
        return;
      }

      // update node variable (alpha if MAX, beta if MIN)
      const prevVarVal = op === 'MAX' ? node.alpha : node.beta;
      if (updateVar(op, node, bestVal)) {
        const [varValEl, varValCopy] = op === 'MAX' ? [alphaValEl, node.alpha] : [betaValEl, node.beta];
        timeline.addSequences(
          new AnimSequence()
            .addBlocks(
              Exit(varValEl, '~wipe', ['from-right'])
            ),
          new AnimSequence({autoplays: true})
            .setOnStart({
              do() { varValEl.innerHTML = `${varValCopy}`; },
              undo() { varValEl.innerHTML = `${prevVarVal}`.replace(/Infinity/g, '&infin;'); }
            })
            .addBlocks(
              Entrance(varValEl, '~wipe', ['from-left'])
            )
        );
      }
    }
  };

  timeline.addSequences(new AnimSequence().addBlocks(
    Transition(subtreeNodeEl, '~to', [{backgroundColor: nodeColor}]),
    Transition(subtreeNodeEl.querySelector('.subtree__node-fill'), '~to', [{backgroundColor: nodeColor}], {startsWithPrevious: true}),
    Transition(subtreeNodeUtilityEl, '~to', [{color: '#f7f7f7', fontWeight: 600}], {startsWithPrevious: true})
  ));

  [node.utility, node.nextMove] = [bestVal, bestMove];
}




// HELPER ANIM FUNCTIONS
const exitTextBox = (domElem: Element | null) => {
  const connector = domElem?.parentElement?.querySelector('.text-box-connector') as WbfkConnector;
  return [
    ConnectorExit(connector, '~trace', ['from-B']),
    Exit(domElem, '~fade-out', [], {startsWithPrevious: true}),
  ];
}

const enterTextBox = (domElem: Element | null) => {
  const connector = domElem?.parentElement?.querySelector('.text-box-connector') as WbfkConnector;
  return [
    Entrance(domElem, '~fade-in', []),
    ConnectorEntrance(connector, '~trace', ['from-A']),
  ];
};

const textChange = (domElem: Element | null, newInnerHtml: string) => {
  return Emphasis(domElem, 'change-text', [newInnerHtml.replace('Infinity', '&infin;')]);
};




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

function updateVar(op: 'MAX' | 'MIN', node: TreeNode, potentialNewVal: number): boolean {
  switch(op) {
    case "MAX":
      if (node.alpha < potentialNewVal) {
        node.alpha = potentialNewVal;
        return true;
      }
    case "MIN":
      if (node.beta > potentialNewVal) {
        node.beta = potentialNewVal;
        return true;
      }
  }

  return false;
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

