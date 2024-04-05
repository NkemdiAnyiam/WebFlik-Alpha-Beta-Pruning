export const findTemplate = (id: string): HTMLTemplateElement => {
  const template = document.getElementById(`${id}`) as HTMLTemplateElement | null;
  if (!template) { throw new Error(`Template with id "${id}" not found`); }
  if (!(template instanceof HTMLTemplateElement)) { throw new Error(`Element with id "${id}" is not a <template> element`); }
  return template;
};

export const cloneTemplate = (id: string): HTMLElement => {
  const template = findTemplate(id);

  const clone = document.importNode(template.content, true);
  return clone.firstElementChild as HTMLElement;
};

export const removeTemplate = (id: string): void => {
  const template = findTemplate(id);
  template.remove();
};
