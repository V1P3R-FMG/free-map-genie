export type MountPlace = "before" | "after" | "append" | "replace";

export type Parent = string | Element;

export const resolveParent = (parent?: Parent) => {
  if (typeof parent === "string") {
    return document.querySelector(parent);
  }
  return parent ?? document.body;
};

export const mount = (
  parent: Parent | undefined,
  node: Element,
  place?: MountPlace
) => {
  const resolvedParent = resolveParent(parent);

  if (!resolvedParent) {
    logger.warn("Failed to mount node, parent element not found.", {
      parent,
      node,
    });
    return;
  }

  switch (place ?? "append") {
    case "append":
      resolvedParent.append(node);
      break;
    case "after":
      resolvedParent.after(node);
      break;
    case "before":
      resolvedParent.before(node);
      break;
    case "replace":
      resolvedParent.after(node);
      resolvedParent.remove();
      break;
    default:
      throw new Error(`Invalid mounting place '${place}'.`);
  }
};
