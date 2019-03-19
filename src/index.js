import { useState, useContext } from 'react';

function useStore(Context) {
  return (mapState) => {
    const store = useContext(Context);
    const [state, setState] = useState(mapState(store.getState()));

    useEffect(() => {
      let cached = state;

      return store.subscribe(() => {
        const newState = mapState(store.getState());
        if (newState === cached) {
          return;
        }

        cached = newState;
        setState(newState);
      });
    }, []);

    return state;
  }
}

function useDispatch(Context) {
  return () => {
    return useContext(Context).dispatch;
  }
}

function useAction(Context) {
  return (mapActions) => {
    const store = useContext(Context);
    return mapActions(store.dispatch);
  };
}

export default function createApplication(store) {
  const Context = React.createContext(store);

  return {
    useStore: useStore(Context),
    useDispatch: useDispatch(Context),
    useAction: useAction(Context),
  };
}
