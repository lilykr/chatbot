- When asked to work with Legend-State, please follow these guidelines:

1. Always import from the v3 packages:
   - Use "@legendapp/state" for core functionality
   - Use "@legendapp/state/react" for React-specific hooks and components

2. Use the observable() function to create state:
   const state$ = observable({ count: 0, user: { name: "John" } });

3. Access values with .get() or the shorthand ._:
   - state$.count.get() // For reactive access
   - state$.count.peek() // For non-reactive peek

4. Update values using:
   - Direct assignment: state$.count.set(5)
   - Functional updates: state$.count.set(prev => prev + 1)
   - Deep updates: state$.user.set({ name: "Jane" })
   - Non-reactive updates: state$.count._ = 5

5. Reactivity:

### Reactivity Best Practices

**Use proper tracking methods**:
   - Use `get()` to access and track observable values
   - Use `peek()` when you need the value without tracking
   - Use `get(true)` for shallow tracking (only direct children)

**Understand what operations track changes**:
   - `observable.get()` - Tracks changes
   - Array methods like `arr$.map()` - Shallow tracking
   - `arr$.length` - Shallow tracking
   - `Object.keys(state$)` and `Object.values(state$)` - Shallow tracking

**Use appropriate reactive functions**:
   - `observe()` - Run code when observables change
   - `when()` - Run code once when condition becomes truthy
   - `whenReady()` - Run code once when objects/arrays are non-empty
   - `onChange()` - Listen for changes within an observable

**Implement batching when needed**:
   - Use `batch(callback)` or `beginBatch()`/`endBatch()` when:
     - Observables depend on each other
     - You want to prevent excessive renders
     - You're using persistence and want to minimize writes

## Examples

### Basic Observable Access
```javascript
// Tracking changes
const value = myObservable.get();

// Without tracking
const valueNoTracking = myObservable.peek();

// Shallow tracking
const shallowValue = myObservable.get(true);
```

### Using Observe
```javascript
observe(() => {
  // This automatically tracks any observable.get() calls
  const username = userState.username.get();
  const isLoggedIn = authState.isLoggedIn.get();
  
  console.log(`User ${username} is ${isLoggedIn ? 'logged in' : 'logged out'}`);
  
  return { username, isLoggedIn }; // Optional return value
}, ({ value, previous }) => {
  // This reaction runs when the observed values change
  console.log('State changed:', previous, '->', value);
});
```

### Using When
```javascript
// Using callback
when(() => authState.isLoggedIn.get(), () => {
  console.log('User is now logged in!');
  loadUserData();
});

// Using Promise
async function waitForLogin() {
  await when(() => authState.isLoggedIn.get());
  console.log('User is now logged in!');
  loadUserData();
}
```

### Batching Changes
```javascript
// Method 1: Using batch callback
batch(() => {
  userState.firstName.set('John');
  userState.lastName.set('Doe');
  userState.email.set('john.doe@example.com');
});

// Method 2: Using begin/end
beginBatch();
userState.firstName.set('John');
userState.lastName.set('Doe');
userState.email.set('john.doe@example.com');
endBatch();
```

### Cleanup Listeners
```javascript
const dispose = onChange(userState, (newValue) => {
  console.log('User state changed:', newValue);
});

// Later when you want to stop listening
dispose();
```

6. In React components, use these patterns:
   - use$() for subscribing to an observable or it's specific values or even a comptued value
   - observer() HOC for making entire components reactive
   - useObservable() for local component state

7. For fine-grained reactivity in React, use:
   - Reactive components
Web example:
import { $React } from "@legendapp/state/react-web"

function Component() {
    // This component renders only once
    const state$ = useObservable({ name: '', age: 18 })

    return (
        <div>
            {/* Reactive styling */}
            <$React.div
                $style={() => ({
                    color: state$.age.get() > 5 ? 'green' : 'red'
                })}
                $className={() => state$.age.get() > 5 ? 'kid' : 'baby'}
            />
            {/* Reactive children */}
            <$React.div>
                {() => (
                    <div>{state$.age.get() > 5 ? <Kid /> : <Baby />}</div>
                )}
            />
            {/* Two-way bind to inputs */}
            <$React.textarea $value={state$.name} />
            <$React.select $value={state$.age}>...</$React.select>
            <$React.input
                $value={state$.name}
                $className={() => !state$.name.get() && "border-red-500"}
                $style={() => !state$.name.get() && { borderWidth: 1 }}
            />
        </div>
    )
}

react-native example:
import { $View, $Text, $TextInput } from "@legendapp/state/react-native" 
function Component() {
    // This component renders only once
    const state$ = useObservable({ name: '', age: 18 })

    return (
        <div>
            {/* Reactive styling */}
            <$View
                $style={() => ({
                    color: state$.age.get() > 5 ? 'green' : 'red'
                })}
            />
            {/* Reactive children */}
            <$Text>
                {() => state$.age.get() > 5 ? 'child' : 'baby'}
            </$Text>
            {/* Two-way bind to inputs */}
            <$TextInput $value={state$.name} />
        </div>
    )
}
   - Control flow components (For, Show, Switch)
   - Computed:
Computed extracts children so that their changes do not affect the parent, but the parent’s changes will still re-render them. Use this when children use observables that change often without affecting the parent, but also depends on local state in the parent.
This is equivalent to extracting it as a separate component (and passing in all needed props).
The child needs to be a function to be able to extract it into a separate tracking context, but the Babel plugin lets you pass it children directly.
example: 
function Component() {
  return (
    <Computed>
      {() =>
        state$.messages.map((message) => (
          <div key={message.id}>
            {message.text} {localVar}
          </div>
        ))
      }
    </Computed>
  );
}

- Memo
Memo is similar to Computed, but it will never re-render when the parent component renders - only if its own observables change. Use Memo when children are truly independent from the parent component. This is equivalent to extracting it as a separate component (and passing in all needed props) with React.memo.
example:
function Component() {
  return (
    <Memo>
      {() =>
        state.messages.map((message) => (
          <div key={message.id}>
            {message.text} {localVar}
          </div>
        ))
      }
    </Memo>
  );
}

9. Follow the "render once" pattern for optimal performance:
   - Create small, focused components
   - Use fine-grained reactivity
   - Leverage Memo and Computed to isolate re-renders
