import { TreeNode } from "./a-b-pruning";
import { cloneTemplate, removeTemplate } from "./utils";

const tree = document.querySelector('.tree-container');

export function sceneCreator(root: TreeNode) {
  const nodeEl = cloneTemplate('node');
  const nodeTriangleEl = nodeEl.querySelector('.node__triangle');
  nodeTriangleEl?.classList.add('node__triange--max');
  const childrenEl = nodeEl.querySelector('.node__children') as HTMLElement;
  childrenEl.style.setProperty('grid-template-columns', `repeat(${root.actions.length}, 1fr)`);

  for (let i = 0; i < root.actions.length; ++i) {
    childrenEl?.insertAdjacentElement('beforeend', helper(root.actions[i], 'MIN'));
  }

  tree?.insertAdjacentElement('beforeend', nodeEl);
}

function helper(node: TreeNode, nodeType: 'MIN' | 'MAX') {
  const nodeEl = cloneTemplate('node');
  const nodeTriangleEl = nodeEl.querySelector('.node__triangle');
  nodeTriangleEl?.classList.add(`node__triangle--${nodeType.toLowerCase()}`);
  const childrenEl = nodeEl.querySelector('.node__children') as HTMLElement;
  childrenEl.style.setProperty('grid-template-columns', `repeat(${node.actions.length}, 1fr)`);


  for (let i = 0; i < node.actions.length; ++i) {
    childrenEl?.insertAdjacentElement('beforeend', helper(node.actions[i], nodeType === 'MIN' ? 'MAX' : 'MIN'));
  }

  return nodeEl;
}
