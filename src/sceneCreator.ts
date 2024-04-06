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
  removeTemplate('node');
  removeTemplate('node__connector');
}

function buildTreeR(node: TreeNode, nodeType: 'MIN' | 'MAX') {
  const nodeEl = cloneTemplate('node');
  const nodeTriangleEl = nodeEl.querySelector('.node__triangle');
  nodeTriangleEl?.classList.add(`node__triangle--${nodeType.toLowerCase()}`);
  const childrenEl = nodeEl.querySelector('.node__children') as HTMLElement;


  for (let i = 0; i < node.actions.length; ++i) {
    const child = buildTreeR(node.actions[i], nodeType === 'MIN' ? 'MAX' : 'MIN');
    childrenEl?.insertAdjacentElement('beforeend', child);
    const connector = cloneTemplate('node__connector') as WbfkConnector;
    nodeEl.querySelector(':scope > .node__connectors')?.insertAdjacentElement('beforeend', connector);
    ConnectorSetter(connector, [nodeTriangleEl, 0.5, 0.95], [child.querySelector('.node__triangle'), 0.5, 0.05]).play();
    ConnectorEntrance(connector, '~appear', []).play();
  }

  return nodeEl;
}
