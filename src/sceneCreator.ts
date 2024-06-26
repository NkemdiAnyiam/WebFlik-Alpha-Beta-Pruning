import { MinMaxNode } from "./a-b-pruning";
import { cloneTemplate, removeTemplate } from "./utils";
import { WebFlik, WbfkConnector, AnimSequence } from "./WebFlik";

const {
  ConnectorSetter,
  ConnectorEntrance,
  Transition,
  Scroller
} = WebFlik.createAnimationBanks();

const tree = document.querySelector('.tree-container');

export function sceneCreator(root: MinMaxNode) {
  const subtreeEl = buildTreeR(root, 'MAX');

  tree?.insertAdjacentElement('beforeend', subtreeEl);
  removeTemplate('subtree');
  removeTemplate('subtree__connector-base');
  removeTemplate('subtree__connector-visit');
  Scroller(document.documentElement, '~scroll-self', [subtreeEl.querySelector('.subtree__node'), {scrollableOffset: [0.5, 0.5]}]).play();
  // removeTemplate('strike-through');
}

function buildTreeR(node: MinMaxNode, nodeType: 'MIN' | 'MAX') {
  const subtreeEl = cloneTemplate('subtree');
  // subtreeEl.dataset.depth = `${node.depth}`;
  // subtreeEl.dataset.index = `${node.index}`;
  subtreeEl.dataset.id = `${node.id}`;
  subtreeEl.classList.add(`subtree--${nodeType.toLowerCase()}`)
  const textBox = subtreeEl.querySelector(`:scope .text-box`)!;
  textBox.classList.add(`text-box--${nodeType.toLowerCase()}`)
  const subtreeNodeEl = subtreeEl.querySelector('.subtree__node')!;
  subtreeNodeEl.classList.add(`subtree__node--${nodeType.toLowerCase()}`);
  const utilityEl = subtreeNodeEl.querySelector('.subtree__node-utility')!;
  utilityEl.innerHTML = nodeType === 'MAX' ? `-&infin;` : `&infin;`;
  // utilityEl.textContent = `${node.utility}`;
  const childrenEl = subtreeEl.querySelector('.subtree__children') as HTMLElement;

  const connectorsContainerEl = subtreeEl.querySelector(':scope > .subtree__connectors') as HTMLElement;
  for (let i = 0; i < node.actions.length; ++i) {
    const child = buildTreeR(node.actions[i], nodeType === 'MIN' ? 'MAX' : 'MIN');
    childrenEl?.insertAdjacentElement('beforeend', child);

    const connectorBase = cloneTemplate('subtree__connector-base') as WbfkConnector;
    const connectorVisit = cloneTemplate('subtree__connector-visit') as WbfkConnector;
    const connectorSolution = cloneTemplate('subtree__connector-solution') as WbfkConnector;
    connectorsContainerEl.insertAdjacentElement('beforeend', connectorBase);
    connectorsContainerEl.insertAdjacentElement('beforeend', connectorVisit);
    connectorsContainerEl.insertAdjacentElement('beforeend', connectorSolution);
    connectorSolution.dataset.toId = connectorVisit.dataset.toId = connectorBase.dataset.toId = `${node.actions[i].id}`;
    new AnimSequence().addBlocks(
      ConnectorSetter(connectorBase, [subtreeNodeEl, 'center', 'bottom - 5%'], [child.querySelector('.subtree__node'), 'center', 'top + 5%']),
      ConnectorSetter(connectorVisit, [subtreeNodeEl, 'center', 'bottom - 5%'], [child.querySelector('.subtree__node'), 'center', 'top + 5%']),
      ConnectorSetter(connectorSolution, [subtreeNodeEl, 'center', 'bottom - 5%'], [child.querySelector('.subtree__node'), 'center', 'top + 5%']),
      ConnectorEntrance(connectorBase, '~appear', []),
    ).play();
  }

  // if the current node is a leaf, add the utility value to the text content and style the node differently to indicate finalized value
  if (node.actions.length === 0) {
    // remove unnecessary elements
    childrenEl.remove();
    connectorsContainerEl.querySelector('.subtree__vars-connector')?.remove();

    utilityEl.textContent = `${node.utility}`;
    utilityEl.classList.add('subtree__node-utility--final');
    utilityEl.classList.remove('wbfk-hidden');

    const nodeColor = nodeType === 'MAX' ? 'darkblue' : 'darkred';
    new AnimSequence().addBlocks(
      Transition(subtreeNodeEl, '~to', [{backgroundColor: nodeColor}]),
      Transition(subtreeNodeEl.querySelector('.subtree__node-fill'), '~to', [{backgroundColor: nodeColor}], {startsWithPrevious: true}),
      Transition(utilityEl, '~to', [{color: '#f7f7f7', fontWeight: 600}], {startsWithPrevious: true})
    ).finish();
  }

  // const connectors = [...connectorsContainerEl.children] as WbfkConnector[];
  // if (connectors.length > 2) {
  //   const first = connectors[0];
  //   const last = connectors[connectors.length - 1];
  //   const strikeThrough = cloneTemplate('strike-through') as WbfkConnector;
  //   connectorsContainerEl.insertAdjacentElement('beforeend', strikeThrough);
  //   ConnectorSetter(strikeThrough, [first.lineElement, '10% - 15px', 'center + 20%'], [last.lineElement, '80% + 15px', 'center - 20%']).play();
  //   ConnectorEntrance(strikeThrough, '~appear', []).play();
  // }

  return subtreeEl;
}
