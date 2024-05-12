import { WebFlik, WbfkConnector, AnimSequence, AnimTimeline } from "./WebFlik";

const { Entrance, Exit, Emphasis, Motion, Transition, ConnectorSetter, ConnectorEntrance, ConnectorExit, Scroller } = WebFlik.createAnimationBanks({
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
  let currNode: TreeNode | null = root;
  let seq = new AnimSequence({description: `Trace solution path`});
  while(currNode?.nextMove) {
    const solnConnector = document.querySelector(`.subtree__connector--solution[data-to-id="${currNode.nextMove?.id}"]`) as WbfkConnector;
    seq.addBlocks(
      Transition(solnConnector, '~to', [{strokeWidth: `15px`}])
    )
    currNode = currNode.nextMove;
  }
  timeline.addSequences(seq);
  console.log(root.utility);
  return root;
}

function minOrMaxValue(op: 'MIN' | 'MAX', node: TreeNode, alpha: number, beta: number): void {
  if (node.isTerminal) {
    const subtreeEl = document.querySelector(`[data-id="${node.id}"]`)!
    const subtreeNodeUtilityEl = subtreeEl.querySelector(`.subtree__node-utility`)!;
    const textBox = subtreeEl.querySelector(`:scope > .text-box`);
    const textBoxConnector = textBox?.parentElement?.querySelector('.text-box-connector') as WbfkConnector;
    timeline.addSequences(new AnimSequence({description: `Explain that this is a leaf node whose utility value can be returned immediately.`}).addBlocks(
      textChange(textBox, `This is a leaf node, so it has a known utility value, ${node.utility}. We can immediately return it.`),
      ConnectorSetter(textBoxConnector, [textBox, 'right', 'center'], [subtreeNodeUtilityEl, 'left', 'center']),
      ...enterTextBox(textBox)
    ));

    timeline.addSequences(new AnimSequence({description: `Hide leaf node text box`, autoplaysNextSequence: true}).addBlocks(
      ...exitTextBox(textBox)
    ));
    return;
  }
  node.alpha = alpha;
  node.beta = beta;

  let bestVal = op === 'MAX' ? -Infinity : Infinity;
  let bestMove = null;

  const greatestOrLeast = op === 'MAX' ? 'greatest' : 'least';
  const greaterOrLesser = op === 'MAX' ? 'greater' : 'lesser';
  const nodeColor = op === 'MAX' ? 'darkblue' : 'darkred';
  const alphaOrBetaInverted = op === 'MAX' ? '&beta;' : '&alpha;';
  const alphaOrBeta = op === 'MAX' ? '&alpha;' : '&beta;';
  const opInverted = op === 'MAX' ? 'MIN' : 'MAX';

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
      Scroller(document.documentElement, '~scroll-self', [subtreeNodeEl, {scrollableOffset: [0.5, 0.5]}]),
      Emphasis(textBox, 'change-text', [
        parentSubtree
        ? `The parent passed its &alpha; value (${alpha}) and &beta; value (${beta}) to us. Since we are a ${op} node, ${alphaOrBetaInverted} will never be updated—it just tells us our parent's best option so far.`
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
    textChange(textBox, `Since this is a ${op} node, we want to find the ${greatestOrLeast} utility among our available actions (children). To start, let's set this initial utility to ${op === 'MAX' ? '-' : ''}&infin;.`),
    ConnectorSetter(textBoxConnector, ['preserve'], [subtreeNodeUtilityEl, 'left', 'center']),
    ...enterTextBox(textBox),
    Entrance(subtreeNodeUtilityEl, '~wipe', ['from-left']),
  ));
  
  let currBestSolnConnector: WbfkConnector | null = null;
  for (let i = 0; i < node.actions.length; ++i) {
    const action = node.actions[i];

    const actionSubtreeEl = document.querySelector(`[data-id="${action.id}"]`);
    const baseChildConnector = document.querySelector(`.subtree__connector--base[data-to-id="${action.id}"]`) as WbfkConnector;
    const visitChildConnector = document.querySelector(`.subtree__connector--visit[data-to-id="${action.id}"]`) as WbfkConnector;
    const solutionChildConnector = document.querySelector(`.subtree__connector--solution[data-to-id="${action.id}"]`) as WbfkConnector;
    timeline.addSequences(new AnimSequence({description: `Trace to child ${i}.`}).addBlocks(
      ...exitTextBox(textBox),
      ConnectorEntrance(visitChildConnector, '~trace', ['from-A']),
      textChange(textBox, `Now let's follow this bolded path to visit child ${i} to see if we can find a better (${greaterOrLesser}) utility value.`),
      ConnectorSetter(textBoxConnector, [textBox, 'center', 'bottom'], [visitChildConnector, 'center', 'center']),
      ...enterTextBox(textBox),
    ));

    // Fade out our text box so child text box can shine
    timeline.addSequences(new AnimSequence({autoplaysNextSequence: true, description: `Fade out our text box so child text box can steal the show.`}).addBlocks(
      Exit(textBox, '~fade-out', []),
      ConnectorExit(textBoxConnector, '~trace', ['from-B'], {startsWithPrevious: true}),
    ));

    minOrMaxValue(opInverted, action, node.alpha, node.beta);

    // Erase visit connector to child and solidify base connection
    timeline.addSequences(new AnimSequence({description: `Erase visit connector to child ${i}.`}).addBlocks(
      Scroller(document.documentElement, '~scroll-self', [subtreeNodeEl, {scrollableOffset: [0.5, 0.5]}]),
      ConnectorExit(visitChildConnector, '~trace', ['from-B']),
      Transition(baseChildConnector, '~to', [{strokeDasharray: 0}], {startsWithPrevious: true})
    ));


    // check to see if action.utility is better
    if (betterUtility(op, action, bestVal)) {
      const oldBestVal = bestVal;
      bestVal = action.utility;
      bestMove = action;
  
      const bestValCopy = bestVal;

      // replace old utility value with new better one
      timeline.addSequences(
        new AnimSequence({autoplays: true})
          .addBlocks(
            textChange(textBox, `The child's utility value (${bestValCopy}) is ${greaterOrLesser} than this node's current utility value (${oldBestVal}).`),
            ConnectorSetter(textBoxConnector, [textBox, 'right', 'center'], [subtreeNodeUtilityEl, 'left', 'center']),
            ...enterTextBox(textBox),
          ),
          new AnimSequence().addBlocks(
            ...exitTextBox(textBox),
            textChange(textBox, `Since this is a ${op} node, the new utility value (${bestValCopy}) is better, so let's replace ${oldBestVal} with ${bestValCopy}.`),
            ...enterTextBox(textBox),
            Exit(subtreeNodeUtilityEl, '~wipe', ['from-right']),
            textChange(subtreeNodeUtilityEl, `${bestValCopy}`),
            Entrance(subtreeNodeUtilityEl, '~wipe', ['from-left'])
          ),
          new AnimSequence().addBlocks(
            ...exitTextBox(textBox),
            textChange(textBox, `We also store the child node as the new best move for this solution path.`),
            ConnectorSetter(textBoxConnector, [textBox, 'center', 'bottom'], [solutionChildConnector, 'center', 'center']),
            ...(currBestSolnConnector ? [ConnectorExit(currBestSolnConnector, '~trace', ['from-bottom'])] : []),
            ConnectorEntrance(solutionChildConnector, '~trace', ['from-top']),
            ...enterTextBox(textBox),
          )
      );

      currBestSolnConnector = solutionChildConnector;

      // if equals or beats variable (beta if MAX, alpha if MIN), cut
      if (i+1 < node.actions.length) {
        timeline.addSequences(
          new AnimSequence()
            .addBlocks(
              ...exitTextBox(textBox),
              textChange(textBox, `The next step is to see if we can skip the remaining subtrees for this node. The goal is to find out if taking this path would be pointless for the parent.`),
              ConnectorSetter(textBoxConnector, [textBox, 'right', 'center'], [subtreeNodeEl, 'left + 25%', 'center']),
              ...enterTextBox(textBox)
            ),
        );

        if (parentSubtree) {
          timeline.addSequences(
            new AnimSequence()
            .addBlocks(
              ...exitTextBox(textBox),
              textChange(textBox, `The parent is a ${opInverted} node (which we know simply because our current node is a ${op} node.)`
              ),
              ConnectorSetter(textBoxConnector, [textBox, 'center', 'top'], [parentSubtree.querySelector('.subtree__node')!, 'left + 25%', 'center']),
              ...enterTextBox(textBox)
            ),
          );
        }

        timeline.addSequences(
          new AnimSequence()
            .addBlocks(
              ...exitTextBox(textBox),
              textChange(textBox, `So if our new utility value (${bestValCopy}) is ${greaterOrLesser} (worse) than or equal to our parent's best option so far (the ${alphaOrBetaInverted} value we received from the parent, ${op === 'MAX' ? beta : alpha}), then there is no way the parent would ever choose this path.`
              ),
              ConnectorSetter(textBoxConnector, [textBox, 'right', 'center'], [varsEl, 'left', 'center']),
              ...enterTextBox(textBox)
            )
        );

        if (meetsCutCondition(op, node, bestVal)) {
          [node.utility, node.nextMove] = [bestVal, bestMove];

          timeline.addSequences(
            new AnimSequence()
              .addBlocks(
                ...exitTextBox(textBox),
                textChange(textBox, `${bestValCopy} is ${bestValCopy !== (op === 'MAX' ? beta : alpha) ? `${greaterOrLesser} (worse) than` : 'equal to'} ${op === 'MAX' ? beta : alpha}, so that means we can prune the remaining subtrees and just return ${bestValCopy}.`),
                ...enterTextBox(textBox)
              )
          );

          const strikeThroughConnector = subtreeEl.querySelector(`:scope > .subtree__connectors .strike-through`) as WbfkConnector;
          const firstPrunedLine = document.querySelector(`.subtree__connector--base[data-to-id="${node.actions[i+1].id}"]`) as WbfkConnector;
          const lastPrunedLine = document.querySelector(`.subtree__connector--base[data-to-id="${node.actions[node.actions.length - 1].id}"]`) as WbfkConnector;

          timeline.addSequences(new AnimSequence({description: `Prune remaining subtrees`}).addBlocks(
            // draw strike through the connectors of the subtrees that just got pruned
            ConnectorSetter(strikeThroughConnector, [firstPrunedLine.lineElement, 'center - 10%', 'center + 10%'], [lastPrunedLine.lineElement, 'center + 10%', 'center - 10%']),
            ConnectorEntrance(strikeThroughConnector, '~trace', ['from-left']),
            // reduce opacity of the child subtrees that just got pruned and the connectors pointing to them
            ...node.actions.slice(i+1).map( action => Transition(document.querySelector(`[data-to-id="${action.id}"]`), '~to', [{opacity: 0.5}], {startsNextBlock: true}) ),
            ...node.actions.slice(i+1).map( action => Transition(document.querySelector(`[data-id="${action.id}"]`), '~to', [{opacity: 0.5}], {startsNextBlock: true}) )
          ));

          timeline.addSequences(new AnimSequence({autoplays: true}).addBlocks(
            Transition(subtreeNodeEl, '~to', [{backgroundColor: nodeColor}]),
            Transition(subtreeNodeEl.querySelector('.subtree__node-fill'), '~to', [{backgroundColor: nodeColor}], {startsWithPrevious: true}),
            Transition(subtreeNodeUtilityEl, '~to', [{color: '#f7f7f7', fontWeight: 600}], {startsWithPrevious: true})
          ));
          
          timeline.addSequences(new AnimSequence({description: `Hide this node's text box`, autoplaysNextSequence: true}).addBlocks(
            ...exitTextBox(textBox)
          ));

          return;
        }
        // if does not meet cut condition
        else {
          timeline.addSequences(
            new AnimSequence()
              .addBlocks(
                ...exitTextBox(textBox),
                textChange(textBox, `${bestValCopy} is not ${greaterOrLesser} than ${op === 'MAX' ? beta : alpha}, so we cannot prune the remaining subtrees.`),
                ...enterTextBox(textBox)
              )
          );
        }
      }

      // update node variable (alpha if MAX, beta if MIN)
      timeline.addSequences(
        new AnimSequence()
          .addBlocks(
            ...exitTextBox(textBox),
            textChange(textBox, `Now we need to see if we should update ${alphaOrBeta}. This is because we want to pass it down to the next child to let it know what this node's current best option is.`),
            ConnectorSetter(textBoxConnector, [textBox, 'right', 'center'], [varsEl, 'left', 'center']),
            ...enterTextBox(textBox)
          )
      );

      const prevVarVal = op === 'MAX' ? node.alpha : node.beta;
      if (updateVar(op, node, bestVal)) {
        const [varValEl, varValCopy] = op === 'MAX' ? [alphaValEl, node.alpha] : [betaValEl, node.beta];
        timeline.addSequences(
          new AnimSequence()
            .addBlocks(
              ...exitTextBox(textBox),
              textChange(textBox, `${bestValCopy} is ${greaterOrLesser} (better) than ${prevVarVal}, so ${alphaOrBeta} gets updated.`),
              ...enterTextBox(textBox),
              Exit(varValEl, '~wipe', ['from-right']),
              textChange(varValEl, `${varValCopy}`),
              Entrance(varValEl, '~wipe', ['from-left'])
            ),
        );
      }
      // var not updated
      else {
        const [varValEl, varValCopy] = op === 'MAX' ? [alphaValEl, node.alpha] : [betaValEl, node.beta];
        timeline.addSequences(
          new AnimSequence()
            .addBlocks(
              ...exitTextBox(textBox),
              textChange(textBox, `${bestValCopy} is not ${greaterOrLesser} than ${prevVarVal}, so ${alphaOrBeta} does not get updated here.`),
              ...enterTextBox(textBox),
            ),
        );
      }
    }
    // if action.utility was not better
    else {
      const childUtilCopy = action.utility;
      const bestValCopy = bestVal;
      timeline.addSequences(
        new AnimSequence({autoplays: true})
          .addBlocks(
            textChange(textBox, `The child's utility value (${childUtilCopy}) is not ${greaterOrLesser} than this node's current utility value (${bestValCopy}).`),
            ConnectorSetter(textBoxConnector, [textBox, 'right', 'center'], [subtreeNodeUtilityEl, 'left', 'center']),
            ...enterTextBox(textBox),
          ),
          new AnimSequence().addBlocks(
            ...exitTextBox(textBox),
            textChange(textBox, `Since this is a ${op} node, that means the new utility value (${childUtilCopy}) is worse, so we do not perform an update here.`),
            ...enterTextBox(textBox),
          ),
      );
    }
  };

  timeline.addSequences(new AnimSequence().addBlocks(
    ...exitTextBox(textBox),
    textChange(textBox, `There are no more children (actions) left, so there is no need to attempt pruning. Thus, the final utility value of this node is ${bestVal}. Let's return it.`),
    ConnectorSetter(textBoxConnector, ['preserve'], [subtreeNodeEl, 'left + 25%', 'center']),
    ...enterTextBox(textBox),
  ));

  timeline.addSequences(new AnimSequence({autoplaysNextSequence: true}).addBlocks(
    Transition(subtreeNodeEl, '~to', [{backgroundColor: nodeColor}]),
    Transition(subtreeNodeEl.querySelector('.subtree__node-fill'), '~to', [{backgroundColor: nodeColor}], {startsWithPrevious: true}),
    Transition(subtreeNodeUtilityEl, '~to', [{color: '#f7f7f7', fontWeight: 600}], {startsWithPrevious: true}),
    ...exitTextBox(textBox),
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
  return Emphasis(domElem, 'change-text', [newInnerHtml]);
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

