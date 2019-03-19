import {
  useState,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import { createContext } from 'vm';

function shallowEqual(previous, next) {
  if (previous === null || next === null
    || typeof previous !== 'object' || typeof next !== 'object') {
    return false;
  }

  if (Array.isArray(previous)) {
    if (!Array.isArray(next)) return false;
    if (previous.length !== next.length) return false;
    for (let i = 0; i < previous.length; i += 1) {
      if (next[i] !== previous[i]) return false;
    }
  }

  const prevKeys = Object.keys(previous);
  const nextKeys = Object.keys(next);
  if (prevKeys.length !== nextKeys.length) return false;

  for (let i = 0; i < prevKeys.length; i += 1) {
    if (previous[prevKeys[i]] !== next[nextKeys[i]]) {
      return false;
    }
  }

  return true;
}

function storeFactory(Context) {
  return function useStore(mapState, dependencies = []) {
    const store = useContext(Context);
    const mapper = useCallback(mapState, dependencies);
    const [state, setState] = useState(() => mapper(store.getState()));

    useEffect(() => {
      // Keep track of the previous state to make comparison
      let previous = state;

      return store.subscribe(() => {
        const next = mapper(store.getState());
        if (next === previous || shallowEqual(previous, next)) {
          return;
        }

        previous = next;
        setState(next);
      });
    }, [mapper]);

    return state;
  };
}

function dispatchFactory(Context) {
  return function useDispatch() {
    const store = useContext(Context);
    return store.dispatch;
  };
}

function actionFactory(Context) {
  return function useAction(actionCreator) {
    const store = useContext(Context);
    return useCallback((...args) => store.dispatch(actionCreator(...args), [actionCreator]));
  };
}

function actionsFactory(Context) {
  return function useActions(mapActions, dependencies = []) {
    const store = useContext(Context);
    const mapper = useCallback(mapActions, dependencies);
    return mapper(store.dispatch);
  };
}

export default function createApplication(AppContext = null) {
  const Context = AppContext || createContext(null);

  return {
    Provider: Context.Provider,

    useStore: storeFactory(Context),
    useDispatch: dispatchFactory(Context),
    useAction: actionFactory(Context),
    useActions: actionsFactory(Context),
  };
}
