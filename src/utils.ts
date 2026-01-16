export type AnyFunctionComponent = React.FunctionComponentElement<unknown>

/**
 * Get a component's name for test naming purposes.
 */
export const getComponentName = (Component: AnyFunctionComponent) => {
  const name =
    Component.type.name ||
    Component.type.displayName ||
    (Component as unknown as { displayName?: string }).displayName
  if (!name) {
    throw new Error(
      'Component has no name. May be a React.MemoExoticComponent-- if so, set displayName on the component.'
    )
  }
  return name
}
