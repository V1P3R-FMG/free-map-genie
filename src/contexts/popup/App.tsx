import { useAppDispatch, useAppSelector } from "./hooks";
import {
  selectAppLoading,
  injectIconFontAsync,
} from "./store/features/app/appSlice";

import "./App.css";

import { TabsContainer, TabView } from "@/components/Tabs";
import { Loading } from "@/components/Loading";
import { Header } from "./store/features/app/Header";
import { Footer } from "./store/features/app/Footer";
import { Bookmarks } from "./store/features/bookmarks/Bookmarks";
import { Info } from "./store/features/info/Info";

function App() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAppLoading);

  React.useEffect(() => {
    dispatch(injectIconFontAsync());
  }, []);

  return (
    <div className="container" data-theme="dark">
      <Loading loading={loading}>
        <Header />
        <TabsContainer>
          <TabView name="bookmarks" icon="bookmark">
            <Bookmarks />
          </TabView>
          <TabView name="info" icon="document">
            <Info />
          </TabView>
        </TabsContainer>
        <Footer />
      </Loading>
    </div>
  );
}

export default App;
