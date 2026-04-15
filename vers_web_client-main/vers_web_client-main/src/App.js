import store, { persistor } from "./store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter } from "react-router-dom";
import history from "./history";
import Layouts from "./components/layouts";
import ThreeDotLoader from "./components/template/ThreeDotLoader";

function App() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={<ThreeDotLoader label="Preparing VK Enterprises Software" />}
        persistor={persistor}
      >
        <BrowserRouter history={history}>
          <Layouts />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
