import { useState, useCallback, useEffect } from 'react';

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

function storeFactory(store) {
  return function useStore(mapState, dependencies = []) {
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

function dispatchFactory(store) {
  return function useDispatch() {
    return store.dispatch;
  };
}

function actionFactory(store) {
  return function useAction(actionCreator) {
    return useCallback((...args) => store.dispatch(actionCreator(...args), [actionCreator]));
  };
}

function actionsFactory(store) {
  return function useActions(mapActions, dependencies = []) {
    const mapper = useCallback(mapActions, dependencies);
    return mapper(store.dispatch);
  };
}

export default function createApplication(store) {
  return {
    useStore: storeFactory(store),
    useDispatch: dispatchFactory(store),
    useAction: actionFactory(store),
    useActions: actionsFactory(store),
  };
}
