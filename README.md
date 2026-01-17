# React Component Test Suite

A TypeScript library for defining consistent test suites for React function components by automatically naming test suites based on component names. Compatible with `jest`, `vitest`, or any testing package that uses global `describe()` and `test()` blocks.

## Features

- 🎯 **Automatic suite naming** - Test suites named after your components
- 🔄 **Multiple test scenarios** - Support for multiple test scenarios per component
- ⏱️ **Lifecycle hooks** - `beforeRender` and `afterRender` hooks (sync or async)
- 🧪 **Test framework agnostic** - Works with Jest, Vitest, or any framework using `describe`/`test`
- 📝 **Full TypeScript support** - Complete type safety with advanced inference
- 🛠️ **Extensible** - Build custom test suite builders for your use cases

## Installation

```bash
npm install react-component-test-suite
```

### Peer Dependencies

This library requires:
- `react`
- `@testing-library/react`
- A test framework with `describe` and `test` (e.g., Jest or Vitest)

## Examples

### Single Test

```tsx
import { render } from '@testing-library/react'
import { componentTestSuite } from 'react-component-test-suite'

const MyComponent = () => <div>Hello World</div>

// Create a test suite named "MyComponent" with a single render test
componentTestSuite(<MyComponent/>, {
  testTitle: 'renders correctly',
  renderFunction: render,
})
```


```
 ----- Test output -----
✓ MyComponent
    ✓ renders correctly
```

### Multiple Tests


```tsx
// Create a test suite named "MyComponent" with multiple tests
componentTestSuite(
  <MyComponent />,
  {
    testTitle: 'renders correctly',
    renderFunction: render,
  },
  { testTitleSuffix: 'default props' },
  {
    testTitleSuffix: 'with prop value 1',
    Component: <MyComponent customProp="1" />,
  },
  {
    testTitleSuffix: 'with prop value 2',
    Component: <MyComponent customProp="2" />,
  },
  {
    testTitleSuffix: 'with setup/teardown',
    Component: <MyComponent  />,
    beforeRender: async () => await setupDatabase(),
    afterRender: async () => await cleanupDatabase()
  }
)
```

```
 ----- Test output -----
✓ MyComponent (4)
   ✓ renders correctly - default props
   ✓ renders correctly - with prop value 1
   ✓ renders correctly - with prop value 2
   ✓ renders correctly - with setup/teardown
```

## API Reference

### `componentTestSuite`

Creates a `describe` block with one or more tests for a React component.

```tsx
componentTestSuite(
  Component: AnyFunctionComponent,
  options: {
    testTitle: string
    renderFunction: (ui: React.ReactElement) => RenderResult // e.g. `render` from `@testing-library/react` 
    suiteFn?: typeof describe.skip | typeof describe.only // for test dev. defaults to normal `describe`.
    insideSuite?: () => void
    Wrapper?: React.FC<{ children: React.ReactNode }>
  },
  ...tests: TestList
)
```

#### Options

- **`testTitle`** (required): Base title for each test. Test suffixes will be appended to this.
- **`renderFunction`** (required): Function to render the component (e.g., `render` from `@testing-library/react`).
- **`suiteFn`** (optional): Use `describe.skip` or `describe.only` for debugging. Default: `describe`.
- **`insideSuite`** (optional): Callback for registering lifecycle hooks (`beforeEach`, `afterEach`, etc.).
- **`Wrapper`** (optional): Component to wrap the test component (e.g., providers). Default: `React.Fragment`.

#### Test Configuration (TestList)

Each test can include:

- **`testTitleSuffix`** (required for 2nd+ tests to differentiate them): Appended to the base `testTitle`.
- **`Component`** (required for 2nd+ tests): The component to test. First test uses the main `Component` arg. An error is thrown if subsequent components don't match.
- **`beforeRender`** (optional): Sync or async function called before rendering.
- **`afterRender`** (optional): Sync or async function called after rendering.

## More Examples

### With Custom Wrapper

```tsx
const ThemeWrapper = ({ children }) => (
  <ThemeProvider theme={testTheme}>
    {children}
  </ThemeProvider>
)

componentTestSuite(MyComponent, {
  testTitle: 'renders with theme',
  renderFunction: render,
  Wrapper: ThemeWrapper,
}, ...tests)
```

### Debugging with `describe.only`

```tsx
componentTestSuite(MyComponent, {
  testTitle: 'renders',
  renderFunction: render,
  suiteFn: describe.only, // Run only this suite
}, ...tests)
```


### Custom Test Suite Builder

_See APIs below this section for helper functions and types_

```tsx
import { componentTestSuite, mapTestList, type AnyFunctionComponent } from 'react-component-test-suite'

type AccessibilityTest = {
  testTitleSuffix: string
  ariaLabel: string
}

const accessibilityTests = (
  Component: AnyFunctionComponent,
  tests: TestList<AccessibilityTest>
) => {
  componentTestSuite(
    Component,
    {
      testTitle: 'meets accessibility requirements',
      renderFunction: render,
    },
    ...mapTestList(tests, (test) => ({
      afterRender: async () => {
        const element = screen.getByLabelText(test.ariaLabel)
        expect(element).toBeInTheDocument()
      }
    }))
  )
}

...
accessibilityTests(<MyComponent/>)
accessibilityTests(<MyOtherComponent/>)
accessibilityTests(<AnotherComponent/>)

```

```tsx

import { componentTestSuite, mapTestList, resolveTestSuiteArgs, type AnyFunctionComponent } from 'react-component-test-suite'

type SmokeTestArgs = TestSuiteArgs<{
  checks?: () => Promisable<unknown>
}>

const smokeTest = (
  Component: AnyFunctionComponent,
  renderFunction: (ui: React.ReactElement) => RenderResult,
  ...args: SmokeTestArgs
) => {
  const { overallOptions, tests } = resolveTestSuiteArgs(args)
  componentTestSuite(
    Component,
    {
      ...overallOptions,
      renderFunction,
      testTitle: 'should render the component',
    },
    ...mapTestList(tests, (t) => ({ afterRender: t.checks }))
  )
}

...
smokeTest(<MyComponent/>)
smokeTest(<MyOtherComponent/>)
smokeTest(<AnotherComponent/>)

```

## TypeScript Support

The library provides full type safety with advanced type inference.

### `TestList`

Used to create a custom test list critiria by adding custom props to the standard props required for each test:

```tsx
import type { TestList } from 'react-component-test-suite'

// Type-safe test list with custom properties
const tests: TestList<{ customProp: string }> = [
  { testTitleSuffix: 'test 1', customProp: 'value 1' },
  { testTitleSuffix: 'test 2', customProp: 'value 2' }
]
```

## Utility Functions

### `resolveTestSuiteArgs`

Normalizes flexible test suite arguments into a consistent shape.

```tsx
const { overallOptions, tests } = resolveTestSuiteArgs([
  { suiteFn: describe.skip },
  [{ testTitleSuffix: 'test 1' }]
])
```

### `mapTestList`

Helper to transform custom test lists into the core `TestList` format.

```tsx
const customTests: TestList<{ customProp: string }> = [
  { testTitleSuffix: 'test 1', customProp: 'value1' }
]

const mappedTests: TestList = mapTestList(customTests, (test) => ({
  afterRender: () => console.log(test.customProp)
}))
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
