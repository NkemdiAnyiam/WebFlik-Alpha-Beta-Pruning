import { TreeNode } from "./a-b-pruning";
import { cloneTemplate, removeTemplate } from "./utils";
import { WebFlik, WbfkConnector } from "./WebFlik";

const {
  ConnectorSetter,
  ConnectorEntrance,
} = WebFlik.createAnimationBanks();

const tree = document.querySelector('.tree-container');

export function sceneCreator(root: TreeNode) {
  const nodeEl = buildTreeR(root, 'MAX');

  tree?.insertAdjacentElement('beforeend', nodeEl);
  removeTemplate('subtree');
  removeTemplate('subtree__connector');
  removeTemplate('strike-through');
}

function buildTreeR(node: TreeNode, nodeType: 'MIN' | 'MAX') {
  const subtreeEl = cloneTemplate('subtree');
  const subtreeNodeEl = subtreeEl.querySelector('.subtree__node')!;
  subtreeNodeEl.classList.add(`subtree__node--${nodeType.toLowerCase()}`);
  const utilityEl = subtreeNodeEl.querySelector('.subtree__node-utility')!;
  // utilityEl.textContent = `${node.utility}`;
  const childrenEl = subtreeEl.querySelector('.subtree__children') as HTMLElement;

  const connectorsContainerEl = subtreeEl.querySelector(':scope > .subtree__connectors') as HTMLElement;
  for (let i = 0; i < node.actions.length; ++i) {
    const child = buildTreeR(node.actions[i], nodeType === 'MIN' ? 'MAX' : 'MIN');
    childrenEl?.insertAdjacentElement('beforeend', child);

    const connector = cloneTemplate('subtree__connector') as WbfkConnector;
    connectorsContainerEl.insertAdjacentElement('beforeend', connector);
    ConnectorSetter(connector, [subtreeNodeEl, 'center', 'bottom - 5%'], [child.querySelector('.subtree__node'), 'center', 'top + 5%']).play();
    ConnectorEntrance(connector, '~appear', []).play();
  }

  if (node.actions.length === 0) {
    childrenEl.remove();
    utilityEl.textContent = `${node.utility}`;
    utilityEl.classList.add('subtree__node-utility--final');
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
