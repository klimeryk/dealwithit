export function byId(idToSearchFor: nanoId) {
  return ({ id }: WithNanoId) => id === idToSearchFor;
}
