# Usage
```jsx
import { createStore } from 'redux';
import createApplication from 'redux-hooked';

const { Provider, useStore, useDispatch, useAction } = createApplication();

// Create your application specific hooks and export them
const getConnectionStatus = state => state.status;
export function useConnectionStatus() {
  const { name, age } = useStore((state) => ({
    name: state.name,
    age: state.age,
  }));

  return useStore(getConnectionStatus);
}

const updateUrl = url => ({ type: 'UPDATE_URL', payload: url });
export function useUpdateUrl() {
  return useAction(updateUrl);
}

export function useUserData(id) {
  const { name, age } = useStore(state => state.users[id], [id]);
}

```